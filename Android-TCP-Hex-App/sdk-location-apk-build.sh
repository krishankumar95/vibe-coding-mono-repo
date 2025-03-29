#!/bin/bash

# This script automates the process of setting the Android SDK location
# and building the APK in one step

echo "========================================="
echo "TCP Client Android APK Builder"
echo "========================================="
echo

# Get SDK path from user
read -p "Enter your Android SDK path (e.g., /Users/username/Library/Android/sdk): " sdk_path

# Validate input
if [ -z "$sdk_path" ]; then
  echo "Error: SDK path cannot be empty"
  exit 1
fi

echo
echo "Creating local.properties with SDK path..."
echo "sdk.dir=$sdk_path" > android/local.properties
echo "✅ Created local.properties file"

# Build the web application first
echo
echo "Building web application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Web build failed. Aborting APK build."
  exit 1
fi
echo "✅ Web build completed"

# Run the Capacitor sync
echo
echo "Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
  echo "❌ Capacitor sync failed. Aborting APK build."
  exit 1
fi
echo "✅ Capacitor sync completed"

# Build the APK
echo
echo "Building Android APK..."
cd android && ./gradlew assembleDebug

if [ $? -ne 0 ]; then
  echo "❌ APK build failed."
  exit 1
fi

echo
echo "✅ APK build completed successfully!"
echo
echo "Your APK is located at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo
echo "Installation Instructions:"
echo "1. Transfer the APK to your Android device"
echo "2. Enable 'Install from Unknown Sources' in your device settings"
echo "3. Tap on the APK file to install"
echo
echo "Remember: For TCP connections to work properly on your device,"
echo "configure the server URL in the app settings after installation."
echo