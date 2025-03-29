import net from "net";
import { formatTimestamp, formatHexString, hexToBuffer, bufferToHexString } from "../client/src/lib/utils";

// Log entry interface
interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'sent' | 'received';
  message: string;
}

// TcpClient class to manage a single TCP connection
class TcpClient {
  private socket: net.Socket | null = null;
  private ipAddress: string = '';
  private port: number = 0;
  private connected: boolean = false;
  private log: LogEntry[] = [];
  private lastActivity: Date | null = null;
  private responseBuffer: Buffer = Buffer.alloc(0);
  
  constructor() {
    // Add initial log entry
    this.addLogEntry('info', 'TCP client initialized');
  }
  
  /**
   * Connect to a TCP server
   */
  async connect(ipAddress: string, port: number): Promise<boolean> {
    // If already connected, disconnect first
    if (this.connected && this.socket) {
      await this.disconnect();
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.ipAddress = ipAddress;
        this.port = port;
        
        this.addLogEntry('info', `Connecting to ${ipAddress}:${port}...`);
        
        this.socket = new net.Socket();
        
        // Set timeout for connection
        this.socket.setTimeout(10000); // 10 seconds timeout
        
        // Connection successful handler
        this.socket.on('connect', () => {
          this.connected = true;
          this.lastActivity = new Date();
          this.addLogEntry('info', `Connected to ${ipAddress}:${port}`);
          resolve(true);
        });
        
        // Data received handler
        this.socket.on('data', (data) => {
          this.lastActivity = new Date();
          this.responseBuffer = Buffer.concat([this.responseBuffer, data]);
          
          // Convert received data to hex for logging
          const hexData = bufferToHexString(data);
          this.addLogEntry('received', `Received: ${hexData}`);
        });
        
        // Error handler
        this.socket.on('error', (err) => {
          this.addLogEntry('error', `Socket error: ${err.message}`);
          
          // Only reject if we're in the connect process
          if (!this.connected) {
            reject(err);
          }
        });
        
        // Close handler
        this.socket.on('close', (hadError) => {
          this.connected = false;
          if (hadError) {
            this.addLogEntry('error', 'Connection closed due to error');
          } else {
            this.addLogEntry('info', 'Connection closed');
          }
        });
        
        // Timeout handler
        this.socket.on('timeout', () => {
          this.addLogEntry('error', 'Connection timeout');
          this.socket?.destroy();
          this.connected = false;
          
          // Only reject if we're in the connect process
          if (!this.connected) {
            reject(new Error('Connection timeout'));
          }
        });
        
        // Attempt to connect
        this.socket.connect(port, ipAddress);
        
      } catch (error) {
        this.addLogEntry('error', `Connection error: ${(error as Error).message}`);
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from the TCP server
   */
  async disconnect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        this.addLogEntry('info', 'Not connected');
        this.connected = false;
        resolve(true);
        return;
      }
      
      this.addLogEntry('info', 'Disconnecting...');
      
      // Clean up event listeners
      this.socket.removeAllListeners();
      
      // Add only the required listeners for clean disconnect
      this.socket.on('close', () => {
        this.connected = false;
        this.addLogEntry('info', 'Disconnected successfully');
        resolve(true);
      });
      
      this.socket.on('error', (err) => {
        this.addLogEntry('error', `Disconnect error: ${err.message}`);
        this.connected = false;
        resolve(false);
      });
      
      // End the socket
      this.socket.end();
    });
  }
  
  /**
   * Send hex data to the connected TCP server
   */
  async sendHex(hexCode: string): Promise<{
    success: boolean;
    response?: string;
  }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        this.addLogEntry('error', 'Not connected. Cannot send data.');
        reject(new Error('Not connected'));
        return;
      }
      
      try {
        // Format and convert hex string to buffer
        const formattedHex = formatHexString(hexCode);
        const buffer = hexToBuffer(formattedHex);
        
        // Clear response buffer before sending new command
        this.responseBuffer = Buffer.alloc(0);
        
        // Send the data
        this.socket.write(buffer, () => {
          this.lastActivity = new Date();
          this.addLogEntry('sent', `Sent: ${formattedHex}`);
          
          // Wait for response with timeout
          setTimeout(() => {
            const responseHex = bufferToHexString(this.responseBuffer);
            resolve({
              success: true,
              response: responseHex !== '' ? responseHex : undefined
            });
          }, 1000); // Wait 1 second for response
        });
      } catch (error) {
        this.addLogEntry('error', `Send error: ${(error as Error).message}`);
        reject(error);
      }
    });
  }
  
  /**
   * Get the current status of the TCP connection
   */
  getStatus() {
    return {
      connected: this.connected,
      connectionInfo: this.connected ? `${this.ipAddress}:${this.port}` : undefined,
      log: this.log.slice(-50),
      lastActivity: this.lastActivity ? formatTimestamp(this.lastActivity) : undefined,
      lastUpdated: formatTimestamp(new Date()),
      serverInfo: this.connected 
        ? `Connected to TCP server at ${this.ipAddress}:${this.port}`
        : undefined
    };
  }
  
  /**
   * Add a log entry
   */
  private addLogEntry(type: LogEntry['type'], message: string) {
    const entry: LogEntry = {
      timestamp: formatTimestamp(new Date()),
      type,
      message
    };
    
    // Keep log size manageable (last 100 entries)
    this.log.push(entry);
    if (this.log.length > 100) {
      this.log.shift();
    }
    
    // Log to console as well for server-side debugging
    console.log(`[TCP Client] ${entry.timestamp} - ${entry.type}: ${entry.message}`);
  }
}

// Singleton manager for the TCP client
export class TcpClientManager {
  private static client: TcpClient = new TcpClient();
  
  static async connect(ipAddress: string, port: number): Promise<boolean> {
    return await this.client.connect(ipAddress, port);
  }
  
  static async disconnect(): Promise<boolean> {
    return await this.client.disconnect();
  }
  
  static async sendHex(hexCode: string, repeatCount: number = 1): Promise<{
    success: boolean;
    response?: string;
    responses?: string[];
    successCount?: number;
    totalCount?: number;
  }> {
    if (repeatCount <= 1) {
      return await this.client.sendHex(hexCode);
    }
    
    // Handle multiple sends
    const responses: string[] = [];
    let lastError: Error | null = null;
    let successCount = 0;
    
    console.log(`[TCP Client] Starting send operation with repeat count: ${repeatCount}`);
    
    for (let i = 0; i < repeatCount; i++) {
      try {
        console.log(`[TCP Client] Send attempt ${i+1}/${repeatCount}`);
        
        const result = await this.client.sendHex(hexCode);
        if (result.success) {
          successCount++;
          if (result.response) {
            responses.push(result.response);
            console.log(`[TCP Client] Attempt ${i+1}: Successful with response`);
          } else {
            console.log(`[TCP Client] Attempt ${i+1}: Successful without response`);
          }
        } else {
          console.log(`[TCP Client] Attempt ${i+1}: Failed to send`);
        }
        
        // Add a small delay between sends to avoid overwhelming the server
        if (i < repeatCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        lastError = error as Error;
        console.log(`[TCP Client] Attempt ${i+1}: Error - ${(error as Error).message}`);
      }
    }
    
    // If at least one send was successful, consider the operation successful
    if (successCount > 0) {
      console.log(`[TCP Client] Completed ${successCount}/${repeatCount} send operations successfully`);
      
      return {
        success: true,
        responses: responses.length > 0 ? responses : undefined,
        successCount,
        totalCount: repeatCount
      };
    }
    
    // If all sends failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    return {
      success: false
    };
  }
  
  static getStatus() {
    return this.client.getStatus();
  }
}
