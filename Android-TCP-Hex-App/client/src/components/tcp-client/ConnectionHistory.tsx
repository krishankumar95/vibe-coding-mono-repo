import React from 'react';
import { useTcpClient } from '../../lib/stores/useTcpClient';
import { Button } from '../ui/button';

interface ConnectionHistoryProps {
  onSelectConnection: (ipAddress: string, port: string) => void;
}

export default function ConnectionHistory({ onSelectConnection }: ConnectionHistoryProps) {
  const connectionHistory = useTcpClient(state => state.connectionHistory);
  
  if (!connectionHistory || connectionHistory.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Recent Connections</h3>
      <div className="flex flex-wrap gap-2">
        {connectionHistory.map((connection, index) => (
          <Button
            key={`${connection.ipAddress}-${connection.port}-${index}`}
            variant="outline"
            size="sm"
            className="text-xs py-1 h-auto"
            onClick={() => onSelectConnection(connection.ipAddress, connection.port)}
          >
            {connection.ipAddress}:{connection.port}
          </Button>
        ))}
      </div>
    </div>
  );
}