#!/bin/bash
# Script to rebuild the Android app with network connectivity fixes
# and Java 17 compatibility

# Exit on error
set -e

echo "===== Rebuilding TCP Client Android App ====="
echo "This rebuild includes network security fixes and Java 17 compatibility"

# Step 1: Install compatible Capacitor versions (if needed)
echo "Do you want to install compatible Capacitor versions for Java 17? (y/n)"
read install_capacitor

if [ "$install_capacitor" = "y" ]; then
  echo "Installing compatible Capacitor versions..."
  npm install @capacitor/android@5.3.0 @capacitor/core@5.3.0 @capacitor/cli@5.3.0
fi

# Step 2: Build web app
echo "Building web application..."
npm run build

# Step 3: Update capacitor
echo "Syncing Capacitor..."
npx cap sync android

# Step 4: Ensure Java 17 compatibility
echo "Ensuring Java 17 compatibility..."
# Check and update capacitor.build.gradle
sed -i.bak 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' android/app/capacitor.build.gradle
sed -i.bak 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' android/capacitor-cordova-android-plugins/build.gradle

# Step 5: Build Android app
echo "Building Android APK..."
cd android
./gradlew assembleDebug

echo ""
echo "Build complete! Your APK should be at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "This build includes the following improvements:"
echo "✓ Added ACCESS_NETWORK_STATE permission"
echo "✓ Enhanced network_security_config.xml for local IP ranges"
echo "✓ Changed Java compatibility from 21 to 17"
echo "✓ Enabled cleartext traffic for local networks"