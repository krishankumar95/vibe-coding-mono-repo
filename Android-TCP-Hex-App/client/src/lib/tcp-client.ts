import { DirectTcpClient } from './capacitor-tcp';

export class TcpClientService {
  /**
   * Connects to a TCP server
   */
  static async connect(ipAddress: string, port: number): Promise<boolean> {
    try {
      const result = await DirectTcpClient.connect({ ipAddress, port });
      return result.connected;
    } catch (error) {
      console.error('TCP Connect Error:', error);
      throw error;
    }
  }

  /**
   * Disconnects from the current TCP server
   */
  static async disconnect(): Promise<boolean> {
    try {
      const result = await DirectTcpClient.disconnect();
      return result.disconnected;
    } catch (error) {
      console.error('TCP Disconnect Error:', error);
      throw error;
    }
  }

  /**
   * Sends a hex message to the TCP server
   * @param hexCode The hex code to send
   * @param repeatCount Optional number of times to repeat the send (default: 1)
   * @returns Promise with the result of the operation
   */
  static async sendHex(
    hexCode: string,
    repeatCount: number = 1
  ): Promise<{
    success: boolean;
    response?: string;
    responses?: string[];
    successCount?: number;
    totalCount?: number;
  }> {
    try {
      const result = await DirectTcpClient.sendHex({
        hexCode,
        repeatCount
      });
      
      // Process results
      const responses: string[] = [];
      let successCount = 0;
      
      // Extract all successful responses
      Object.values(result.success).forEach(item => {
        if (item && typeof item === 'object' && 'received' in item) {
          responses.push(item.received as string);
        }
        successCount++;
      });
      
      return {
        success: true,
        responses,
        successCount,
        totalCount: repeatCount
      };
    } catch (error) {
      console.error('TCP Send Error:', error);
      throw error;
    }
  }

  /**
   * Gets the current status of the TCP connection
   */
  static async getStatus(): Promise<{
    connected: boolean;
    connectionInfo?: string;
    log: Array<{
      timestamp: string;
      type: 'info' | 'error' | 'sent' | 'received';
      message: string;
    }>;
    lastActivity?: string;
    lastUpdated: string;
    serverInfo?: string;
  }> {
    return DirectTcpClient.getStatus();
  }
}