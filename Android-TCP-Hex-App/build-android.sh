#!/bin/bash
# Script to build Android APK

# Build the web app
echo "Building web application..."
npm run build

# Add Android platform if not already added
echo "Adding Android platform..."
npx cap add android

# Update Android project with latest web build
echo "Syncing Android project with web build..."
npx cap sync android

echo "Android project is ready to be built."
echo "To build an APK, run 'npx cap open android' to open in Android Studio,"
echo "then use Android Studio to build the APK."