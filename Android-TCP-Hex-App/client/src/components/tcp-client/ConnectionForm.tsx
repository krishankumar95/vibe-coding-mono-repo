import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Network, Wifi, WifiOff, Loader2 } from "lucide-react";
import { validateIpAddress, validatePort } from "@/lib/validators";
import ConnectionHistory from "./ConnectionHistory";

interface ConnectionFormProps {
  ipAddress: string;
  setIpAddress: (value: string) => void;
  port: string;
  setPort: (value: string) => void;
  handleConnect: () => void;
  connected: boolean;
  isLoading: boolean;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  ipAddress,
  setIpAddress,
  port,
  setPort,
  handleConnect,
  connected,
  isLoading,
}) => {
  // Validate inputs
  const isIpAddressValid = validateIpAddress(ipAddress);
  const isPortValid = validatePort(port);
  const canConnect = isIpAddressValid && isPortValid && !isLoading;

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <div className="space-y-2">
          <Label htmlFor="ip-address">
            IP Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Network className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="ip-address"
              placeholder="192.168.1.1"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="pl-10"
              disabled={connected || isLoading}
            />
          </div>
          {ipAddress && !isIpAddressValid && (
            <p className="text-xs text-destructive mt-1">
              Please enter a valid IP address
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="port">
            Port
          </Label>
          <Input
            id="port"
            placeholder="8080"
            value={port}
            onChange={(e) => setPort(e.target.value.replace(/\D/g, ""))}
            disabled={connected || isLoading}
          />
          {port && !isPortValid && (
            <p className="text-xs text-destructive mt-1">
              Port must be between 1-65535
            </p>
          )}
        </div>
      </div>

      {!connected && !isLoading && (
        <ConnectionHistory 
          onSelectConnection={(ip, portVal) => {
            setIpAddress(ip);
            setPort(portVal);
          }} 
        />
      )}

      <div className="space-y-2">
        <Button 
          onClick={handleConnect} 
          className="w-full" 
          disabled={connected ? false : !canConnect}
          variant={connected ? "destructive" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {connected ? "Disconnecting..." : "Connecting..."}
            </>
          ) : (
            <>
              {connected ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  Disconnect
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Connect Manually
                </>
              )}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          You can also connect automatically by using the "Connect & Send" button
        </p>
      </div>
    </div>
  );
};

export default ConnectionForm;
