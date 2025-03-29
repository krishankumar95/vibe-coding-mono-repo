import { useState, useEffect } from "react";
import { getServerUrl, setServerUrl } from "../../lib/queryClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

export default function ServerConfig() {
  const [serverUrl, setServerUrlState] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isCapacitor, setIsCapacitor] = useState<boolean>(false);

  useEffect(() => {
    // Get saved server URL on component mount
    setServerUrlState(getServerUrl());
    
    // Check if we're running in Capacitor
    const capacitorDetected = !!(window as any)?.Capacitor?.isNative;
    setIsCapacitor(capacitorDetected);
  }, []);

  const handleSave = () => {
    // Validate URL format
    try {
      // Simple validation - make sure it's a valid URL with http/https protocol
      const url = new URL(serverUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error("URL must use http or https protocol");
      }
      
      // Save the server URL
      setServerUrl(serverUrl);
      setShowAlert(true);
      
      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
    } catch (error) {
      alert("Invalid URL. Please enter a valid URL with http:// or https:// prefix.");
    }
  };

  // Only show this component when running in Capacitor
  if (!isCapacitor) {
    return null;
  }

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-md border mb-4">
      <h3 className="text-lg font-semibold mb-2">Server Configuration</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Configure the server address for your TCP client. This is required when running on a device.
      </p>
      
      <div className="grid gap-2">
        <Label htmlFor="server-url">Server URL</Label>
        <Input
          id="server-url"
          placeholder="http://192.168.1.100:5000"
          value={serverUrl}
          onChange={(e) => setServerUrlState(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Enter the full URL including http:// and port of the server running your TCP client backend
        </p>
      </div>
      
      <Button onClick={handleSave} className="mt-3">
        Save Server URL
      </Button>
      
      {showAlert && (
        <Alert variant="default" className="mt-3 bg-green-100 text-green-800 border-green-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Server URL saved successfully. Restart the app if connection issues persist.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}