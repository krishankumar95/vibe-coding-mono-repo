import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import ConnectionForm from "./components/tcp-client/ConnectionForm";
import HexInput from "./components/tcp-client/HexInput";
import StatusDisplay from "./components/tcp-client/StatusDisplay";
import CommonHexCodes from "./components/tcp-client/CommonHexCodes";
import { toast } from "sonner";
import { useIsMobile } from "./hooks/use-is-mobile";
import { useTcpClient } from "./lib/stores/useTcpClient";
import { Capacitor } from '@capacitor/core';

function App() {
  // Use our TCP client store
  const {
    ipAddress, setIpAddress,
    port, setPort,
    hexCode, setHexCode,
    isConnected, isLoading,
    statusData,
    connect, disconnect,
    sendHex, getStatus
  } = useTcpClient();

  // Get mobile status
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();

  // No automatic status polling - only check status when needed

  // Handle connect/disconnect
  const handleConnect = async () => {
    if (isConnected) {
      const success = await disconnect();
      if (success) {
        toast.info("Disconnected from server");
      } else {
        toast.error("Failed to disconnect");
      }
    } else {
      const success = await connect();
      if (success) {
        toast.success("Connection established");
      } else {
        toast.error("Connection failed");
      }
    }
  };

  // Handle sending hex - auto-connect if not already connected
  const handleSendHex = async (repeatCount?: number) => {
    // Auto-connect if not already connected
    if (!isConnected) {
      toast.info("Connecting to server...");
      const connectSuccess = await connect();
      
      if (!connectSuccess) {
        toast.error("Failed to connect to server");
        return;
      }
      
      // Brief pause to ensure connection is established
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (repeatCount && repeatCount > 1) {
      toast.info(`Sending hex code ${repeatCount} times...`);
    }
    
    // Assume server is alive and don't check status before sending
    const result = await sendHex(repeatCount);
    if (result.success) {
      toast.success("Hex code sent successfully");
    } else {
      toast.error(`Failed to send hex code: ${result.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-4">TCP Client</h1>
      <p className="text-muted-foreground text-center mb-6">
        Connect to a TCP server and send hex codes
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connection</CardTitle>
            <CardDescription>Enter server details</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectionForm
              ipAddress={ipAddress}
              setIpAddress={setIpAddress}
              port={port}
              setPort={setPort}
              handleConnect={handleConnect}
              connected={isConnected}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Hex Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Hex Command</CardTitle>
            <CardDescription>Enter or select hex code to send</CardDescription>
          </CardHeader>
          <CardContent>
            <HexInput
              hexCode={hexCode}
              setHexCode={setHexCode}
              handleSendHex={handleSendHex}
              connected={isConnected}
              isLoading={isLoading}
            />
            <div className="mt-4">
              <CommonHexCodes setHexCode={setHexCode} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Logs */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Status & Response</CardTitle>
          <CardDescription>Connection status and server response</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusDisplay
            connected={isConnected}
            statusData={statusData}
            isMobile={isMobile}
          />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Last updated: {statusData?.lastUpdated || "Never"}
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
