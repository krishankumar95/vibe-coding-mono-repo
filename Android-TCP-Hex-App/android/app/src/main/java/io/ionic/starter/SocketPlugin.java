package io.ionic.starter;

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
import java.net.SocketTimeoutException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Capacitor plugin that implements TCP socket connections for the app
 * This handles direct TCP connections from the Android device
 */
@CapacitorPlugin(name = "SocketPlugin")
public class SocketPlugin extends Plugin {

    private static final String TAG = "SocketPlugin";
    private Socket socket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private boolean isConnected = false;

    /**
     * Connect to a TCP server
     * @param call The plugin call with host and port parameters
     */
    @PluginMethod
    public void connect(final PluginCall call) {
        String host = call.getString("host");
        Integer port = call.getInt("port");

        if (host == null || port == null) {
            call.reject("Host and port are required");
            return;
        }

        // Use background thread for network operations
        executor.execute(() -> {
            try {
                // Create socket and connect with timeout
                socket = new Socket();
                socket.connect(new InetSocketAddress(host, port), 10000); // 10 seconds timeout
                socket.setSoTimeout(5000); // Read timeout

                // Get I/O streams
                inputStream = socket.getInputStream();
                outputStream = socket.getOutputStream();
                isConnected = true;

                // Return success
                JSObject ret = new JSObject();
                ret.put("connected", true);
                call.resolve(ret);
            } catch (SocketTimeoutException e) {
                Log.e(TAG, "Connection timeout", e);
                call.reject("Connection timeout: " + e.getMessage());
            } catch (IOException e) {
                Log.e(TAG, "Connection error", e);
                call.reject("Connection error: " + e.getMessage());
            } catch (Exception e) {
                Log.e(TAG, "Unexpected error", e);
                call.reject("Unexpected error: " + e.getMessage());
            }
        });
    }

    /**
     * Disconnect from the TCP server
     * @param call The plugin call
     */
    @PluginMethod
    public void disconnect(final PluginCall call) {
        executor.execute(() -> {
            try {
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
                isConnected = false;
                JSObject ret = new JSObject();
                ret.put("disconnected", true);
                call.resolve(ret);
            } catch (IOException e) {
                Log.e(TAG, "Disconnect error", e);
                call.reject("Disconnect error: " + e.getMessage());
            }
        });
    }

    /**
     * Send hex data to the TCP server
     * @param call The plugin call with hex parameter
     */
    @PluginMethod
    public void sendHex(final PluginCall call) {
        String hexString = call.getString("hex");

        if (hexString == null) {
            call.reject("Hex string is required");
            return;
        }

        // Clean the hex string (remove spaces)
        hexString = hexString.replace(" ", "");

        if (!isConnected || socket == null || socket.isClosed()) {
            call.reject("Not connected to a TCP server");
            return;
        }

        final String finalHexString = hexString;
        executor.execute(() -> {
            try {
                // Convert hex string to bytes
                byte[] hexBytes = hexStringToByteArray(finalHexString);

                // Send the data
                outputStream.write(hexBytes);
                outputStream.flush();

                // Try to read response with timeout
                byte[] buffer = new byte[1024];
                StringBuilder response = new StringBuilder();
                
                try {
                    // Wait a short time for response
                    Thread.sleep(500);
                    
                    // Read any available data
                    int bytesAvailable = inputStream.available();
                    if (bytesAvailable > 0) {
                        int bytesRead = inputStream.read(buffer, 0, Math.min(bytesAvailable, buffer.length));
                        if (bytesRead > 0) {
                            // Convert bytes to hex string
                            response.append(bytesToHex(buffer, bytesRead));
                        }
                    }
                } catch (Exception e) {
                    Log.w(TAG, "Error reading response", e);
                    // Continue without response
                }

                // Return result
                JSObject ret = new JSObject();
                ret.put("success", true);
                if (response.length() > 0) {
                    ret.put("response", response.toString());
                }
                call.resolve(ret);
            } catch (IOException e) {
                Log.e(TAG, "Send error", e);
                call.reject("Send error: " + e.getMessage());
            } catch (Exception e) {
                Log.e(TAG, "Unexpected error", e);
                call.reject("Unexpected error: " + e.getMessage());
            }
        });
    }

    /**
     * Convert a hex string to byte array
     */
    private byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    /**
     * Convert bytes to hex string
     */
    private String bytesToHex(byte[] bytes, int length) {
        StringBuilder hexString = new StringBuilder();
        for (int i = 0; i < length; i++) {
            String hex = Integer.toHexString(0xff & bytes[i]);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
            // Add space every two characters for readability
            if (i < length - 1) {
                hexString.append(" ");
            }
        }
        return hexString.toString();
    }

    /**
     * Clean up resources when the app is closed
     */
    @Override
    protected void handleOnDestroy() {
        try {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
        } catch (IOException e) {
            Log.e(TAG, "Error closing socket", e);
        }
        executor.shutdown();
        super.handleOnDestroy();
    }
}