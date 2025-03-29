package com.tcp.client;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "DirectTcpClient")
public class DirectTcpClientPlugin extends Plugin {
    private static final String TAG = "DirectTcpClient";
    private Socket socket;
    private boolean isConnected = false;
    private String ipAddress = "";
    private int port = 0;
    private ExecutorService executor = Executors.newSingleThreadExecutor();
    private final List<LogEntry> logEntries = new ArrayList<>();
    private Date lastActivity = null;

    private static class LogEntry {
        final String timestamp;
        final String type;
        final String message;

        LogEntry(String type, String message) {
            this.timestamp = new SimpleDateFormat("HH:mm:ss.SSS", Locale.US).format(new Date());
            this.type = type;
            this.message = message;
        }

        JSObject toJSObject() {
            JSObject obj = new JSObject();
            obj.put("timestamp", timestamp);
            obj.put("type", type);
            obj.put("message", message);
            return obj;
        }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String ipAddress = call.getString("ipAddress");
        Integer port = call.getInt("port");

        if (ipAddress == null || port == null) {
            call.reject("IP address and port are required");
            return;
        }

        // Disconnect first if already connected
        if (isConnected) {
            try {
                disconnectSocket();
            } catch (IOException e) {
                addLogEntry("error", "Error disconnecting: " + e.getMessage());
            }
        }

        this.ipAddress = ipAddress;
        this.port = port;

        executor.execute(() -> {
            try {
                socket = new Socket();
                addLogEntry("info", "Connecting to " + ipAddress + ":" + port);
                
                // Set connection timeout to 5 seconds
                socket.connect(new InetSocketAddress(ipAddress, port), 5000);
                isConnected = true;
                lastActivity = new Date();
                
                addLogEntry("info", "Connected successfully to " + ipAddress + ":" + port);
                
                getActivity().runOnUiThread(() -> {
                    JSObject result = new JSObject();
                    result.put("connected", true);
                    call.resolve(result);
                });
            } catch (Exception e) {
                String errorMsg = "Connection failed: " + e.getMessage();
                Log.e(TAG, errorMsg, e);
                addLogEntry("error", errorMsg);
                
                getActivity().runOnUiThread(() -> {
                    JSObject result = new JSObject();
                    result.put("connected", false);
                    result.put("error", errorMsg);
                    call.resolve(result);
                });
            }
        });
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        executor.execute(() -> {
            try {
                disconnectSocket();
                getActivity().runOnUiThread(() -> {
                    JSObject result = new JSObject();
                    result.put("disconnected", true);
                    call.resolve(result);
                });
            } catch (IOException e) {
                String errorMsg = "Disconnect failed: " + e.getMessage();
                Log.e(TAG, errorMsg, e);
                addLogEntry("error", errorMsg);
                
                getActivity().runOnUiThread(() -> {
                    JSObject result = new JSObject();
                    result.put("disconnected", false);
                    result.put("error", errorMsg);
                    call.resolve(result);
                });
            }
        });
    }

    private void disconnectSocket() throws IOException {
        if (socket != null && !socket.isClosed()) {
            addLogEntry("info", "Disconnecting from " + ipAddress + ":" + port);
            socket.close();
        }
        isConnected = false;
    }

    @PluginMethod
    public void sendHex(PluginCall call) {
        String hexCode = call.getString("hexCode");
        Integer repeatCount = call.getInt("repeatCount", 1);

        if (hexCode == null) {
            call.reject("Hex code is required");
            return;
        }

        if (!isConnected || socket == null || socket.isClosed()) {
            call.reject("Not connected to a server");
            return;
        }

        executor.execute(() -> {
            JSObject result = new JSObject();
            JSObject successResults = new JSObject();
            JSObject errorResults = new JSObject();
            boolean hasErrors = false;

            try {
                for (int i = 0; i < repeatCount; i++) {
                    try {
                        byte[] data = hexStringToByteArray(hexCode);
                        OutputStream outputStream = socket.getOutputStream();
                        InputStream inputStream = socket.getInputStream();

                        // Send the data
                        outputStream.write(data);
                        outputStream.flush();
                        lastActivity = new Date();
                        
                        String sentMsg = "Sent: " + hexCode + (repeatCount > 1 ? " (repeat " + (i+1) + "/" + repeatCount + ")" : "");
                        addLogEntry("sent", sentMsg);

                        // Read the response with a timeout
                        byte[] buffer = new byte[1024];
                        socket.setSoTimeout(2000); // 2 second timeout
                        
                        try {
                            int bytesRead = inputStream.read(buffer);
                            if (bytesRead > 0) {
                                byte[] responseData = new byte[bytesRead];
                                System.arraycopy(buffer, 0, responseData, 0, bytesRead);
                                
                                String responseHex = bytesToHex(responseData);
                                addLogEntry("received", "Received: " + responseHex);
                                
                                JSObject singleResult = new JSObject();
                                singleResult.put("sent", hexCode);
                                singleResult.put("received", responseHex);
                                successResults.put(String.valueOf(i), singleResult);
                            } else {
                                addLogEntry("info", "No response data received");
                                JSObject singleResult = new JSObject();
                                singleResult.put("sent", hexCode);
                                singleResult.put("received", "");
                                successResults.put(String.valueOf(i), singleResult);
                            }
                        } catch (IOException e) {
                            // Timeout or read error
                            addLogEntry("info", "No response or timeout: " + e.getMessage());
                            JSObject singleResult = new JSObject();
                            singleResult.put("sent", hexCode);
                            singleResult.put("received", "");
                            successResults.put(String.valueOf(i), singleResult);
                        }
                    } catch (Exception e) {
                        String errorMsg = "Send error (repeat " + (i+1) + "): " + e.getMessage();
                        Log.e(TAG, errorMsg, e);
                        addLogEntry("error", errorMsg);
                        
                        errorResults.put(String.valueOf(i), errorMsg);
                        hasErrors = true;
                    }
                }

                result.put("success", successResults);
                if (hasErrors) {
                    result.put("errors", errorResults);
                }

                getActivity().runOnUiThread(() -> call.resolve(result));
            } catch (Exception e) {
                String errorMsg = "Send operation failed: " + e.getMessage();
                Log.e(TAG, errorMsg, e);
                addLogEntry("error", errorMsg);
                
                getActivity().runOnUiThread(() -> call.reject(errorMsg));
            }
        });
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("connected", isConnected);
        
        if (isConnected) {
            result.put("connectionInfo", ipAddress + ":" + port);
            if (lastActivity != null) {
                result.put("lastActivity", new SimpleDateFormat("HH:mm:ss.SSS", Locale.US).format(lastActivity));
            }
        }
        
        JSObject[] logs = new JSObject[logEntries.size()];
        for (int i = 0; i < logEntries.size(); i++) {
            logs[i] = logEntries.get(i).toJSObject();
        }
        result.put("log", logs);
        result.put("lastUpdated", new SimpleDateFormat("HH:mm:ss.SSS", Locale.US).format(new Date()));
        
        call.resolve(result);
    }

    private void addLogEntry(String type, String message) {
        LogEntry entry = new LogEntry(type, message);
        synchronized (logEntries) {
            logEntries.add(entry);
            // Keep only the last 100 log entries
            if (logEntries.size() > 100) {
                logEntries.remove(0);
            }
        }
        Log.d(TAG, type + ": " + message);
    }

    private static byte[] hexStringToByteArray(String hexString) {
        // Remove spaces and other non-hex characters
        hexString = hexString.replaceAll("[^0-9A-Fa-f]", "");
        
        int len = hexString.length();
        byte[] data = new byte[len / 2];
        
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hexString.charAt(i), 16) << 4)
                    + Character.digit(hexString.charAt(i + 1), 16));
        }
        
        return data;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }
}