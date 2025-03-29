# TCP Connection Guide for Android App

This guide explains how the TCP connection works in the Direct TCP Client Android app and provides troubleshooting tips.

## How the Direct TCP Client Works

The Direct TCP Client app establishes direct TCP socket connections from your Android device to specified TCP servers without any server-side proxy or HTTP layer in between. This allows for raw hex code communication over TCP/IP networks.

### Key Features

1. **Direct Socket Connection**: Uses native Android socket implementation for reliable TCP connections
2. **Hex Code Sending**: Sends raw hex codes directly to the server
3. **Multiple Request Support**: Can send the same request multiple times with a single tap
4. **Status Monitoring**: Provides detailed connection status and logs
5. **Network Security**: Configured to work with local network IP addresses (10.x.x.x, 172.16.x.x, 192.168.x.x)

## Establishing a Connection

To establish a TCP connection:

1. Enter the IP address of your TCP server
2. Enter the port number
3. Click "Connect"
4. Once connected, the status will change to "Connected"

## Sending Hex Codes

To send hex codes:

1. Enter a valid hex code in the input field (can include spaces: "FF 00 A1" or without: "FF00A1")
2. Optionally, select a repeat count from the dropdown (send the same code multiple times)
3. Click "Send" to transmit the hex code
4. View the server's response in the Status & Response section

## Troubleshooting Connection Issues

### Connection Refused

If you see "Connection refused" errors:

1. Verify the TCP server is running and listening on the specified port
2. Ensure there are no firewalls blocking the connection
3. Check if the device and server are on the same network
4. Try pinging the server IP from another device to verify network connectivity

### Connection Timeout

If connections are timing out:

1. Verify the server IP address is correct
2. Check network settings on both the Android device and server
3. Ensure the server isn't overloaded with requests

### Android 10+ Network Security

Android 10 and above have stricter network security policies. The app has been configured with cleartext traffic allowed for local networks, but if you're having issues:

1. Ensure your server IP is in a standard private network range (10.x.x.x, 172.16.x.x, 192.168.x.x)
2. For other IP ranges, you may need a custom network security configuration

## Advanced: How It Works Internally

The app uses a custom Capacitor plugin that wraps Android's native Socket implementation. Here's how it works:

1. The plugin creates a Socket connection to the specified IP and port
2. For sending hex, it converts the hex string to a byte array and writes to the output stream
3. It then reads from the input stream to capture any response
4. All operations happen on a background thread to prevent UI freezing
5. Detailed logs are maintained and displayed in the app

## Technical Support

If you're experiencing issues:

1. Check the app logs in the Status section
2. Verify your TCP server is correctly configured
3. Try connecting from a different device to rule out network issues
4. For Android-specific issues, check system logs for more details