#!/bin/bash

# This script automates the process of building a direct TCP client Android APK
# It handles all the necessary steps to prepare the environment and generate the APK

echo "========================================="
echo "Direct TCP Client APK Builder"
echo "========================================="
echo

# Step 1: Build the web application
echo "🔨 Building web application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Web build failed. Please check the errors and try again."
  exit 1
fi
echo "✅ Web build completed successfully!"
echo

# Step 2: Copy the custom Android plugin to the project
echo "🔄 Preparing native Android TCP client plugin..."
mkdir -p android/app/src/main/java/com/tcp/client/
if [ $? -ne 0 ]; then
  echo "❌ Failed to create plugin directory structure."
  exit 1
fi

# Copy plugin files
cp -r capacitor-direct-tcp-client/android/src/main/java/com/tcp/client/* android/app/src/main/java/com/tcp/client/
if [ $? -ne 0 ]; then
  echo "❌ Failed to copy plugin files."
  exit 1
fi
echo "✅ Native plugin prepared successfully!"
echo

# Step 3: Synchronize Capacitor
echo "🔄 Synchronizing with Capacitor..."
npx cap sync android
if [ $? -ne 0 ]; then
  echo "❌ Capacitor sync failed. Please check the errors and try again."
  exit 1
fi
echo "✅ Capacitor sync completed successfully!"
echo

# Step 4: Set up Android SDK location
echo "📱 Setting up Android SDK location..."
./sdk-location-apk-build.sh
if [ $? -ne 0 ]; then
  echo "❌ Failed to set up Android SDK location."
  exit 1
fi
echo "✅ Android SDK location set up successfully!"
echo

# Step 5: Build debug APK
echo "🔨 Building Debug APK..."
cd android && ./gradlew assembleDebug
if [ $? -ne 0 ]; then
  echo "❌ APK build failed. Please check the errors and try again."
  cd ..
  exit 1
fi
cd ..
echo "✅ APK built successfully!"
echo

# Step 6: Check if the APK exists
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo "📱 APK file created at: $APK_PATH"
  APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
  echo "📊 APK size: $APK_SIZE"
  echo
  echo "🎉 Build completed successfully! 🎉"
  echo
  echo "To install the APK on your device:"
  echo "1. Connect your Android device via USB"
  echo "2. Enable USB debugging on your device"
  echo "3. Run: adb install $APK_PATH"
  echo
  echo "Or download the APK from the Files tab in Replit and install it manually."
else
  echo "❌ APK file not found. Build might have failed."
  exit 1
fi