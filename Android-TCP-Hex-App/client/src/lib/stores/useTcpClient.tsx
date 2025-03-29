import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Capacitor } from '@capacitor/core';
import { DirectTcpClient } from '../capacitor-tcp';
import { formatHexString, getLocalStorage, setLocalStorage } from "../utils";

// Check if we're running on a native device
const isNative = Capacitor.isNativePlatform();

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'sent' | 'received';
  message: string;
}

export interface TcpStatusData {
  connected: boolean;
  connectionInfo?: string;
  log: LogEntry[];
  lastActivity?: string;
  lastUpdated: string;
  serverInfo?: string;
}

export interface ConnectionHistory {
  ipAddress: string;
  port: string;
  timestamp: string;
}

interface TcpClientState {
  isConnected: boolean;
  isLoading: boolean;
  ipAddress: string;
  port: string;
  hexCode: string;
  statusData: TcpStatusData;
  connectionHistory: ConnectionHistory[];
  
  // Actions
  setIpAddress: (value: string) => void;
  setPort: (value: string) => void;
  setHexCode: (value: string) => void;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  sendHex: (repeatCount?: number) => Promise<{ success: boolean; message?: string }>;
  getStatus: () => Promise<TcpStatusData>;
  addLogEntry: (type: LogEntry['type'], message: string) => void;
  
  // Connection history methods
  getConnectionHistory: () => ConnectionHistory[];
  saveConnectionToHistory: (ipAddress: string, port: string) => void;
}

// Storage key for connection history
const CONNECTION_HISTORY_KEY = 'tcp_connection_history';

export const useTcpClient = create<TcpClientState>()(
  subscribeWithSelector((set, get) => ({
    isConnected: false,
    isLoading: false,
    ipAddress: '',
    port: '',
    hexCode: '',
    statusData: {
      connected: false,
      log: [],
      lastUpdated: new Date().toISOString()
    },
    // Initialize connection history from local storage or empty array
    connectionHistory: getLocalStorage(CONNECTION_HISTORY_KEY) || [],
    
    setIpAddress: (value: string) => set({ ipAddress: value }),
    setPort: (value: string) => set({ port: value }),
    setHexCode: (value: string) => set({ hexCode: value }),
    
    connect: async () => {
      const { ipAddress, port } = get();
      
      if (!ipAddress || !port) {
        get().addLogEntry('error', 'IP address and port are required');
        return false;
      }
      
      set({ isLoading: true });
      get().addLogEntry('info', `Connecting to ${ipAddress}:${port}...`);
      
      try {
        if (isNative) {
          try {
            // Use the native Capacitor plugin
            const result = await DirectTcpClient.connect({
              ipAddress,
              port: parseInt(port, 10)
            });
            
            set({ 
              isConnected: result.connected,
              isLoading: false
            });
            
            if (!result.connected) {
              get().addLogEntry('error', `Connection failed: ${result.error || 'Unknown error'}`);
              return false;
            }
            
            // Save successful connection to history
            get().saveConnectionToHistory(ipAddress, port);
            
            get().addLogEntry('info', `Connected to ${ipAddress}:${port}`);
            return true;
          } catch (error) {
            console.error('Native connection error:', error);
            get().addLogEntry('error', `Native plugin error: ${error instanceof Error ? error.message : String(error)}`);
            // Fall back to web mode
            set({ isLoading: false });
            return false;
          }
        } else {
          // Web fallback - make an API request to the server
          // This is just for testing in the browser
          get().addLogEntry('info', 'Running in browser mode - simulating connection');
          
          // Simulate a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ 
            isConnected: true,
            isLoading: false,
            statusData: {
              ...get().statusData,
              connected: true,
              connectionInfo: `${ipAddress}:${port}`,
              lastUpdated: new Date().toISOString()
            }
          });
          
          // Save successful connection to history (browser mode)
          get().saveConnectionToHistory(ipAddress, port);
          
          get().addLogEntry('info', `Connected to ${ipAddress}:${port}`);
          return true;
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        get().addLogEntry('error', `Connection error: ${errorMessage}`);
        
        set({ 
          isConnected: false,
          isLoading: false
        });
        
        return false;
      }
    },
    
    disconnect: async () => {
      set({ isLoading: true });
      get().addLogEntry('info', 'Disconnecting...');
      
      try {
        if (isNative) {
          try {
            // Use the native Capacitor plugin
            const result = await DirectTcpClient.disconnect();
            
            set({ 
              isConnected: !result.disconnected,
              isLoading: false
            });
            
            if (!result.disconnected) {
              get().addLogEntry('error', `Disconnect failed: ${result.error || 'Unknown error'}`);
              return false;
            }
            
            get().addLogEntry('info', 'Disconnected');
            return true;
          } catch (error) {
            console.error('Native disconnect error:', error);
            get().addLogEntry('error', `Native plugin error: ${error instanceof Error ? error.message : String(error)}`);
            set({ 
              isConnected: false,
              isLoading: false 
            });
            return true; // Assume disconnected on error
          }
        } else {
          // Web fallback - simulate disconnection
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            isConnected: false,
            isLoading: false,
            statusData: {
              ...get().statusData,
              connected: false,
              connectionInfo: undefined,
              lastUpdated: new Date().toISOString()
            }
          });
          
          get().addLogEntry('info', 'Disconnected');
          return true;
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        get().addLogEntry('error', `Disconnect error: ${errorMessage}`);
        
        set({ isLoading: false });
        return false;
      }
    },
    
    sendHex: async (repeatCount = 1) => {
      const { hexCode, isConnected } = get();
      
      if (!isConnected) {
        get().addLogEntry('error', 'Not connected to a server');
        return { success: false, message: 'Not connected to a server' };
      }
      
      const formattedHexCode = formatHexString(hexCode);
      if (!formattedHexCode) {
        get().addLogEntry('error', 'Invalid hex code');
        return { success: false, message: 'Invalid hex code' };
      }
      
      set({ isLoading: true });
      
      try {
        if (isNative) {
          try {
            // Add timeout protection to prevent freezes
            const timeoutPromise = new Promise<{
              success: Record<string, { sent: string; received: string }>;
              errors?: Record<string, string>;
            }>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Send operation timed out after 15 seconds'));
              }, 15000); // 15 seconds is plenty for most TCP operations
            });
            
            // Race between actual send and timeout
            const result = await Promise.race([
              DirectTcpClient.sendHex({
                hexCode: formattedHexCode,
                repeatCount
              }),
              timeoutPromise
            ]) as {
              success: Record<string, { sent: string; received: string }>;
              errors?: Record<string, string>;
            };
            
            set({ isLoading: false });
            
            if (result.errors && Object.keys(result.errors).length > 0) {
              const errorMessages = Object.values(result.errors).join(', ');
              get().addLogEntry('error', `Send errors: ${errorMessages}`);
              return { success: false, message: errorMessages };
            }
            
            // Update log with success message
            if (result.success && Object.keys(result.success).length > 0) {
              get().addLogEntry('info', `Sent ${Object.keys(result.success).length} message(s) successfully`);
            }
            
            return { success: true };
          } catch (error) {
            console.error('Native sendHex error:', error);
            get().addLogEntry('error', `Native plugin error: ${error instanceof Error ? error.message : String(error)}`);
            set({ isLoading: false });
            return { success: false, message: String(error) };
          }
        } else {
          // Web fallback - simulate sending hex
          await new Promise(resolve => setTimeout(resolve, 300));
          
          get().addLogEntry('sent', `Sent: ${formattedHexCode}${repeatCount > 1 ? ` (${repeatCount} times)` : ''}`);
          
          // Simulate response
          await new Promise(resolve => setTimeout(resolve, 200));
          get().addLogEntry('received', `Received: 4F4B`);
          
          set({ isLoading: false });
          return { success: true };
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        get().addLogEntry('error', `Send error: ${errorMessage}`);
        
        set({ isLoading: false });
        return { success: false, message: errorMessage };
      }
    },
    
    getStatus: async () => {
      try {
        if (isNative) {
          try {
            // Use the native Capacitor plugin with timeout protection
            const timeoutPromise = new Promise<TcpStatusData>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Status request timed out after 3 seconds'));
              }, 3000);
            });
            
            // Race between the actual request and timeout
            const status = await Promise.race([
              DirectTcpClient.getStatus(),
              timeoutPromise
            ]);
            
            // Only update state if we actually got status
            if (status) {
              set({ 
                statusData: status,
                isConnected: status.connected
              });
              return status;
            } else {
              throw new Error('Empty status response');
            }
          } catch (error) {
            console.error('Native getStatus error:', error);
            // For status request errors, don't update connection state to prevent
            // false disconnections, but make the error available
            const currentStatus = get().statusData;
            return {
              ...currentStatus,
              error: error instanceof Error ? error.message : String(error)
            };
          }
        } else {
          // In web mode, we use the stored status
          const currentStatus = get().statusData;
          return currentStatus;
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        console.error('Error getting status:', errorMessage);
        // Return existing status data but include the error
        const currentStatus = get().statusData;
        return {
          ...currentStatus,
          error: errorMessage
        };
      }
    },
    
    addLogEntry: (type: LogEntry['type'], message: string) => {
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      });
      
      const entry: LogEntry = {
        timestamp,
        type,
        message
      };
      
      set(state => {
        const newLog = [...state.statusData.log, entry];
        // Keep only the last 100 log entries
        const trimmedLog = newLog.length > 100 ? newLog.slice(-100) : newLog;
        
        return {
          statusData: {
            ...state.statusData,
            log: trimmedLog,
            lastUpdated: new Date().toISOString()
          }
        };
      });
    },
    
    // Get connection history from state
    getConnectionHistory: () => {
      return get().connectionHistory;
    },
    
    // Save a new connection to history
    saveConnectionToHistory: (ipAddress: string, port: string) => {
      if (!ipAddress || !port) return;
      
      const timestamp = new Date().toISOString();
      const newEntry: ConnectionHistory = {
        ipAddress,
        port,
        timestamp
      };
      
      // Get existing history
      const history = [...get().connectionHistory];
      
      // Check if this connection already exists (ignore timestamp for comparison)
      const existingIndex = history.findIndex(item => 
        item.ipAddress === ipAddress && item.port === port
      );
      
      // If it exists, update the timestamp to make it the most recent
      if (existingIndex !== -1) {
        // Remove the old entry
        history.splice(existingIndex, 1);
      }
      
      // Add the new entry to the beginning of the array
      history.unshift(newEntry);
      
      // Keep only the most recent 10 entries
      const trimmedHistory = history.slice(0, 10);
      
      // Update state
      set({ connectionHistory: trimmedHistory });
      
      // Save to local storage
      setLocalStorage(CONNECTION_HISTORY_KEY, trimmedHistory);
    }
  }))
);