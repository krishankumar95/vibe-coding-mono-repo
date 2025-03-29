#!/bin/bash

echo "========================================="
echo "Downgrading Capacitor for Better Compatibility"
echo "========================================="
echo

# Check current installed Capacitor version
echo "📊 Checking current Capacitor version..."
CAPACITOR_VERSION=$(grep '"@capacitor/core"' package.json | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

if [ -z "$CAPACITOR_VERSION" ]; then
  echo "❌ Could not determine Capacitor version in package.json"
  exit 1
fi

echo "👉 Current Capacitor version: $CAPACITOR_VERSION"

# Downgrade to a stable version (5.3.0) that is known to work
echo "🔄 Downgrading Capacitor to v5.3.0..."

# Install specific versions of Capacitor packages
npm install @capacitor/core@5.3.0 @capacitor/cli@5.3.0 @capacitor/android@5.3.0 --save

if [ $? -ne 0 ]; then
  echo "❌ Failed to downgrade Capacitor"
  exit 1
fi

# Ensure the android folder is present
if [ ! -d "android" ]; then
  echo "🔄 Android platform not found. Adding it now..."
  npx cap add android
  
  if [ $? -ne 0 ]; then
    echo "❌ Failed to add Android platform"
    exit 1
  fi
fi

# Sync changes to Android project
echo "🔄 Syncing changes to Android project..."
npx cap sync android

if [ $? -ne 0 ]; then
  echo "❌ Failed to sync with Android"
  exit 1
fi

echo "✅ Successfully downgraded Capacitor to v5.3.0"
echo
echo "Now run the fix script to address any remaining issues:"
echo "./fix-all-build-issues.sh"