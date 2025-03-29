import React from "react";
import { Wifi, WifiOff, Clock, Terminal } from "lucide-react";

interface StatusDisplayProps {
  connected: boolean;
  statusData: any;
  isMobile: boolean;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  connected,
  statusData,
  isMobile,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {connected ? (
          <div className="flex items-center space-x-2 text-green-500">
            <Wifi className="h-5 w-5" />
            <span className="font-medium">Connected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">Disconnected</span>
          </div>
        )}

        {statusData?.connectionInfo && (
          <div className="text-sm text-muted-foreground">
            {statusData.connectionInfo}
          </div>
        )}
      </div>

      {statusData?.lastActivity && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last activity: {statusData.lastActivity}</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4" />
          <span className="font-medium text-sm">Log</span>
        </div>
        
        <div className="log-container border rounded-md p-2 bg-muted/20">
          {statusData?.log && statusData.log.length > 0 ? (
            <div className="space-y-1">
              {statusData.log.map((entry: any, index: number) => (
                <div key={index} className={`text-xs ${entry.type === 'error' ? 'text-red-400' : entry.type === 'sent' ? 'text-blue-400' : entry.type === 'received' ? 'text-green-400' : 'text-muted-foreground'}`}>
                  <span className="opacity-70">[{entry.timestamp}]</span>{' '}
                  {entry.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              No log entries yet
            </div>
          )}
        </div>
      </div>

      {!isMobile && statusData?.serverInfo && (
        <div className="mt-4 p-3 rounded-md bg-muted/30">
          <h4 className="text-sm font-medium mb-1">Server Info</h4>
          <div className="text-xs text-muted-foreground">
            {statusData.serverInfo}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusDisplay;
