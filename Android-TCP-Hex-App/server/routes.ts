import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { TcpClientManager } from "./tcp-client";

export async function registerRoutes(app: Express): Promise<Server> {
  // TCP client routes
  app.post("/api/tcp/connect", async (req, res) => {
    try {
      const { ipAddress, port } = req.body;
      
      if (!ipAddress || !port) {
        return res.status(400).json({ 
          success: false, 
          message: "IP address and port are required" 
        });
      }

      const result = await TcpClientManager.connect(ipAddress, port);
      res.json({ success: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to connect" 
      });
    }
  });

  app.post("/api/tcp/disconnect", async (req, res) => {
    try {
      const result = await TcpClientManager.disconnect();
      res.json({ success: result });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to disconnect" 
      });
    }
  });

  app.post("/api/tcp/send", async (req, res) => {
    try {
      const { hexCode, repeatCount } = req.body;
      
      if (!hexCode) {
        return res.status(400).json({
          success: false,
          message: "Hex code is required"
        });
      }

      // Parse repeat count or use default of 1
      const count = repeatCount ? parseInt(repeatCount, 10) : 1;
      if (isNaN(count) || count < 1 || count > 100) {
        return res.status(400).json({
          success: false,
          message: "Repeat count must be between 1 and 100"
        });
      }

      const result = await TcpClientManager.sendHex(hexCode, count);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to send hex code" 
      });
    }
  });

  app.get("/api/tcp/status", (req, res) => {
    const status = TcpClientManager.getStatus();
    res.json(status);
  });

  const httpServer = createServer(app);

  return httpServer;
}
