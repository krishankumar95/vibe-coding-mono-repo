#!/bin/bash

echo "==========================================="
echo "Direct APK Build Command"
echo "==========================================="

echo "📱 Setting up Android SDK location..."
SDK_PATH="/home/runner/Android/Sdk"
echo "Using SDK path: $SDK_PATH"
echo "sdk.dir=$SDK_PATH" > android/local.properties

echo "🔨 Building Android APK directly with Gradle..."
cd android && ./gradlew assembleDebug

if [ $? -eq 0 ]; then
  echo "✅ APK built successfully!"
  echo "📱 APK file location:"
  find . -name "*.apk" -type f
  cp ./app/build/outputs/apk/debug/app-debug.apk ../tcpclient.apk
  echo "📋 APK copied to ./tcpclient.apk"
else
  echo "❌ APK build failed. Check the logs above for errors."
  exit 1
fi