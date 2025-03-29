// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/tcp-client.ts
import net from "net";

// client/src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function formatTimestamp(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}
function formatHexString(hex) {
  const cleanHex = hex.replace(/\s+/g, "");
  return cleanHex.match(/.{1,2}/g)?.join(" ") || "";
}
function hexToBuffer(hexString) {
  const cleanHex = hexString.replace(/\s+/g, "");
  const bytes = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  return Buffer.from(bytes);
}
function bufferToHexString(buffer) {
  return Array.from(buffer).map((byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join(" ");
}

// server/tcp-client.ts
var TcpClient = class {
  socket = null;
  ipAddress = "";
  port = 0;
  connected = false;
  log = [];
  lastActivity = null;
  responseBuffer = Buffer.alloc(0);
  constructor() {
    this.addLogEntry("info", "TCP client initialized");
  }
  /**
   * Connect to a TCP server
   */
  async connect(ipAddress, port) {
    if (this.connected && this.socket) {
      await this.disconnect();
    }
    return new Promise((resolve, reject) => {
      try {
        this.ipAddress = ipAddress;
        this.port = port;
        this.addLogEntry("info", `Connecting to ${ipAddress}:${port}...`);
        this.socket = new net.Socket();
        this.socket.setTimeout(1e4);
        this.socket.on("connect", () => {
          this.connected = true;
          this.lastActivity = /* @__PURE__ */ new Date();
          this.addLogEntry("info", `Connected to ${ipAddress}:${port}`);
          resolve(true);
        });
        this.socket.on("data", (data) => {
          this.lastActivity = /* @__PURE__ */ new Date();
          this.responseBuffer = Buffer.concat([this.responseBuffer, data]);
          const hexData = bufferToHexString(data);
          this.addLogEntry("received", `Received: ${hexData}`);
        });
        this.socket.on("error", (err) => {
          this.addLogEntry("error", `Socket error: ${err.message}`);
          if (!this.connected) {
            reject(err);
          }
        });
        this.socket.on("close", (hadError) => {
          this.connected = false;
          if (hadError) {
            this.addLogEntry("error", "Connection closed due to error");
          } else {
            this.addLogEntry("info", "Connection closed");
          }
        });
        this.socket.on("timeout", () => {
          this.addLogEntry("error", "Connection timeout");
          this.socket?.destroy();
          this.connected = false;
          if (!this.connected) {
            reject(new Error("Connection timeout"));
          }
        });
        this.socket.connect(port, ipAddress);
      } catch (error) {
        this.addLogEntry("error", `Connection error: ${error.message}`);
        reject(error);
      }
    });
  }
  /**
   * Disconnect from the TCP server
   */
  async disconnect() {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        this.addLogEntry("info", "Not connected");
        this.connected = false;
        resolve(true);
        return;
      }
      this.addLogEntry("info", "Disconnecting...");
      this.socket.removeAllListeners();
      this.socket.on("close", () => {
        this.connected = false;
        this.addLogEntry("info", "Disconnected successfully");
        resolve(true);
      });
      this.socket.on("error", (err) => {
        this.addLogEntry("error", `Disconnect error: ${err.message}`);
        this.connected = false;
        resolve(false);
      });
      this.socket.end();
    });
  }
  /**
   * Send hex data to the connected TCP server
   */
  async sendHex(hexCode) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        this.addLogEntry("error", "Not connected. Cannot send data.");
        reject(new Error("Not connected"));
        return;
      }
      try {
        const formattedHex = formatHexString(hexCode);
        const buffer = hexToBuffer(formattedHex);
        this.responseBuffer = Buffer.alloc(0);
        this.socket.write(buffer, () => {
          this.lastActivity = /* @__PURE__ */ new Date();
          this.addLogEntry("sent", `Sent: ${formattedHex}`);
          setTimeout(() => {
            const responseHex = bufferToHexString(this.responseBuffer);
            resolve({
              success: true,
              response: responseHex !== "" ? responseHex : void 0
            });
          }, 1e3);
        });
      } catch (error) {
        this.addLogEntry("error", `Send error: ${error.message}`);
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
      connectionInfo: this.connected ? `${this.ipAddress}:${this.port}` : void 0,
      log: this.log.slice(-50),
      lastActivity: this.lastActivity ? formatTimestamp(this.lastActivity) : void 0,
      lastUpdated: formatTimestamp(/* @__PURE__ */ new Date()),
      serverInfo: this.connected ? `Connected to TCP server at ${this.ipAddress}:${this.port}` : void 0
    };
  }
  /**
   * Add a log entry
   */
  addLogEntry(type, message) {
    const entry = {
      timestamp: formatTimestamp(/* @__PURE__ */ new Date()),
      type,
      message
    };
    this.log.push(entry);
    if (this.log.length > 100) {
      this.log.shift();
    }
    console.log(`[TCP Client] ${entry.timestamp} - ${entry.type}: ${entry.message}`);
  }
};
var TcpClientManager = class {
  static client = new TcpClient();
  static async connect(ipAddress, port) {
    return await this.client.connect(ipAddress, port);
  }
  static async disconnect() {
    return await this.client.disconnect();
  }
  static async sendHex(hexCode, repeatCount = 1) {
    if (repeatCount <= 1) {
      return await this.client.sendHex(hexCode);
    }
    const responses = [];
    let lastError = null;
    let successCount = 0;
    console.log(`[TCP Client] Starting send operation with repeat count: ${repeatCount}`);
    for (let i = 0; i < repeatCount; i++) {
      try {
        console.log(`[TCP Client] Send attempt ${i + 1}/${repeatCount}`);
        const result = await this.client.sendHex(hexCode);
        if (result.success) {
          successCount++;
          if (result.response) {
            responses.push(result.response);
            console.log(`[TCP Client] Attempt ${i + 1}: Successful with response`);
          } else {
            console.log(`[TCP Client] Attempt ${i + 1}: Successful without response`);
          }
        } else {
          console.log(`[TCP Client] Attempt ${i + 1}: Failed to send`);
        }
        if (i < repeatCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        lastError = error;
        console.log(`[TCP Client] Attempt ${i + 1}: Error - ${error.message}`);
      }
    }
    if (successCount > 0) {
      console.log(`[TCP Client] Completed ${successCount}/${repeatCount} send operations successfully`);
      return {
        success: true,
        responses: responses.length > 0 ? responses : void 0,
        successCount,
        totalCount: repeatCount
      };
    }
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
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/tcp/connect", async (req, res) => {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to connect"
      });
    }
  });
  app2.post("/api/tcp/disconnect", async (req, res) => {
    try {
      const result = await TcpClientManager.disconnect();
      res.json({ success: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to disconnect"
      });
    }
  });
  app2.post("/api/tcp/send", async (req, res) => {
    try {
      const { hexCode, repeatCount } = req.body;
      if (!hexCode) {
        return res.status(400).json({
          success: false,
          message: "Hex code is required"
        });
      }
      const count = repeatCount ? parseInt(repeatCount, 10) : 1;
      if (isNaN(count) || count < 1 || count > 100) {
        return res.status(400).json({
          success: false,
          message: "Repeat count must be between 1 and 100"
        });
      }
      const result = await TcpClientManager.sendHex(hexCode, count);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to send hex code"
      });
    }
  });
  app2.get("/api/tcp/status", (req, res) => {
    const status = TcpClientManager.getStatus();
    res.json(status);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    glsl()
    // Add GLSL shader support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"]
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import cors from "cors";
var app = express2();
app.use(cors({
  origin: ["capacitor://localhost", "http://localhost", "http://localhost:5000", "http://10.0.2.2:5000"],
  credentials: true
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
