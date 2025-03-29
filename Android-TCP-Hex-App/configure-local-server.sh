#!/bin/bash

# This script automatically detects the local IP address and configures 
# the app to use it for the server connection

echo "========================================="
echo "TCP Client Server Configuration"
echo "========================================="
echo

# Detect operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  LOCAL_IP=$(hostname -I | awk '{print $1}')
else
  # Windows or other
  echo "Automatic IP detection not supported on this OS."
  echo "Please enter your local IP address manually:"
  read LOCAL_IP
fi

if [ -z "$LOCAL_IP" ]; then
  echo "Could not automatically detect your local IP address."
  echo "Please enter your local IP address manually:"
  read LOCAL_IP
fi

if [ -z "$LOCAL_IP" ]; then
  echo "Error: No IP address provided. Exiting."
  exit 1
fi

echo "Detected local IP: $LOCAL_IP"
echo

# Ask for port number
read -p "Enter the port your server is running on (default: 5000): " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-5000}

# Update the default server address in the queryClient.ts file
SERVER_URL="http://$LOCAL_IP:$SERVER_PORT"

echo
echo "Configuring server URL to: $SERVER_URL"

# Replace the default server URL in the queryClient.ts file
sed -i.bak "s|return 'http://192.168.1.100:5000'; // Default - user should change this|return '$SERVER_URL'; // Automatically configured|g" client/src/lib/queryClient.ts

echo "✅ Server URL configured successfully!"
echo
echo "Next steps:"
echo "1. Rebuild your application with: npm run build"
echo "2. Sync with Capacitor: npx cap sync android"
echo "3. Build the APK with: ./sdk-location-apk-build.sh"
echo
echo "Or use the all-in-one script: ./build-apk-direct.sh"
echo