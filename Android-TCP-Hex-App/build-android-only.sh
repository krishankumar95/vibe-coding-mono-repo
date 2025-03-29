#!/bin/bash

echo "==========================================="
echo "Android-Only APK Builder"
echo "==========================================="

echo "🔍 Checking for Android folder..."
if [ ! -d "android" ]; then
  echo "❌ Android folder not found. Run npx cap add android first."
  exit 1
fi

echo "🔧 Updating Android configuration..."
npx cap update android

echo "📱 Setting up Android SDK location..."
SDK_PATH="/home/runner/Android/Sdk"
echo "Using SDK path: $SDK_PATH"
echo "sdk.dir=$SDK_PATH" > android/local.properties

echo "🔨 Building Android APK..."
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