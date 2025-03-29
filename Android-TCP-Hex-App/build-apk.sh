#!/bin/bash

# Script to build an Android APK for the TCP Client app

# Ensure we're in the project directory
cd "$(dirname "$0")"

echo "====================================="
echo "TCP Client Android APK Builder Script"
echo "====================================="
echo

# Step 1: Build the web application
echo "Building web application..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Web build failed!"
    exit 1
fi
echo "✓ Web build successful"
echo

# Step 2: Add Android platform if not already added
if [ ! -d "android" ]; then
    echo "Adding Android platform..."
    npx cap add android
    if [ $? -ne 0 ]; then
        echo "Error: Failed to add Android platform!"
        exit 1
    fi
fi
echo "✓ Android platform is ready"
echo

# Step 3: Sync Android project with latest web build
echo "Syncing Android project with web build..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "Error: Failed to sync Android project!"
    exit 1
fi
echo "✓ Android project synced successfully"
echo

# Check if we have the Android SDK build tools
if command -v ./android/gradlew &> /dev/null; then
    echo "Building APK using Gradle..."
    
    # Navigate to the Android directory
    cd android
    
    # Build the debug APK
    ./gradlew assembleDebug
    
    if [ $? -ne 0 ]; then
        echo "Error: APK build failed!"
        cd ..
        exit 1
    fi
    
    # Return to the project root
    cd ..
    
    # Copy the APK to the project root for convenience
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        cp android/app/build/outputs/apk/debug/app-debug.apk ./tcp-client.apk
        echo "✓ APK built successfully!"
        echo "APK location: ./tcp-client.apk"
    else
        echo "Warning: APK was not found in the expected location."
        echo "Check android/app/build/outputs/apk/debug/ directory manually."
    fi
else
    echo "To build the APK, you need to:"
    echo "1. Open the Android project in Android Studio:"
    echo "   npx cap open android"
    echo
    echo "2. In Android Studio, select:"
    echo "   Build > Build Bundle(s) / APK(s) > Build APK(s)"
    echo
    echo "3. The APK will be available at:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
fi

echo
echo "Remember to update the server address in client/src/lib/queryClient.ts"
echo "before installing the APK on your device if you're connecting to a custom server."
echo