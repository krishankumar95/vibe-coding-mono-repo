export interface DirectTcpClientPlugin {
  /**
   * Connect to a TCP server
   * @param options Connection options
   * @returns Promise with connection result
   */
  connect(options: { ipAddress: string; port: number }): Promise<{ connected: boolean; error?: string }>;
  
  /**
   * Disconnect from the current TCP server
   * @returns Promise with disconnection result
   */
  disconnect(): Promise<{ disconnected: boolean; error?: string }>;
  
  /**
   * Send a hex string to the connected TCP server
   * @param options Hex data and repeat count
   * @returns Promise with send operation results
   */
  sendHex(options: { 
    hexCode: string; 
    repeatCount?: number 
  }): Promise<{ 
    success: Record<string, { sent: string; received: string }>;
    errors?: Record<string, string>;
  }>;
  
  /**
   * Get the current connection status
   * @returns Promise with current status
   */
  getStatus(): Promise<{
    connected: boolean;
    connectionInfo?: string;
    log: Array<{
      timestamp: string;
      type: 'info' | 'error' | 'sent' | 'received';
      message: string;
    }>;
    lastActivity?: string;
    lastUpdated: string;
  }>;
}