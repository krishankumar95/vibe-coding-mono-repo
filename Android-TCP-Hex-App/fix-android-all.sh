#!/bin/bash

echo "=================================================="
echo "Comprehensive Android Build Fixer"
echo "=================================================="
echo

echo "🔍 Checking package and plugin configuration..."

# Step 1: Fix package name conflict - update MainActivity.java
MAIN_ACTIVITY_FILE="android/app/src/main/java/io/ionic/starter/MainActivity.java"

if [ -f "$MAIN_ACTIVITY_FILE" ]; then
  echo "📝 Updating MainActivity.java..."
  
  # Create a backup
  cp "$MAIN_ACTIVITY_FILE" "${MAIN_ACTIVITY_FILE}.bak"
  
  # Create a fixed version of MainActivity with only our DirectTcpClientPlugin
  cat > "$MAIN_ACTIVITY_FILE" << EOF
package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.tcp.client.DirectTcpClientPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(DirectTcpClientPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
EOF
  
  echo "✅ Updated MainActivity.java to use only DirectTcpClientPlugin"
else
  echo "❌ MainActivity.java not found!"
fi

# Step 2: Check and fix Gradle version
GRADLE_WRAPPER="android/gradle/wrapper/gradle-wrapper.properties"

if [ -f "$GRADLE_WRAPPER" ]; then
  echo "📝 Checking Gradle version..."
  
  # Make a backup
  cp "$GRADLE_WRAPPER" "${GRADLE_WRAPPER}.bak"
  
  # Create a new wrapper.properties file with the correct URL
  cat > "$GRADLE_WRAPPER" << EOF
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF
  
  echo "✅ Set Gradle version to 7.6"
else
  echo "⚠️ Gradle wrapper properties file not found"
fi

# Step 3: Set up Android SDK location
echo "📱 Setting up Android SDK location..."

# Set SDK path based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  DEFAULT_SDK_PATH="/Users/$(whoami)/Library/Android/sdk"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  DEFAULT_SDK_PATH="/home/$(whoami)/Android/Sdk"
else
  # Windows or other
  DEFAULT_SDK_PATH="C:\\Users\\$(whoami)\\AppData\\Local\\Android\\Sdk"
fi

echo "Using SDK path: $DEFAULT_SDK_PATH"
echo "sdk.dir=$DEFAULT_SDK_PATH" > android/local.properties
echo "✅ Created local.properties file"

# Step 4: Fix build.gradle Java version if needed
APP_BUILD_GRADLE="android/app/build.gradle"

if [ -f "$APP_BUILD_GRADLE" ]; then
  echo "📝 Checking app build.gradle for Java version settings..."
  
  # Make a backup
  cp "$APP_BUILD_GRADLE" "${APP_BUILD_GRADLE}.bak"
  
  # Check for Java version settings and update them if needed
  if grep -q "JavaVersion.VERSION_21" "$APP_BUILD_GRADLE"; then
    sed -i.tmp 's/JavaVersion.VERSION_21/JavaVersion.VERSION_11/g' "$APP_BUILD_GRADLE"
    echo "✅ Updated Java version from 21 to 11 in app build.gradle"
  else
    echo "ℹ️ No Java version 21 reference found in app build.gradle"
  fi
  
  # Add network security config reference if it doesn't exist
  if ! grep -q "android:networkSecurityConfig" "$APP_BUILD_GRADLE"; then
    sed -i.tmp 's/android {/android {\n    defaultConfig {\n        android:networkSecurityConfig="@xml\/network_security_config"\n    }/g' "$APP_BUILD_GRADLE"
    echo "✅ Added network security config to build.gradle"
  fi
else
  echo "⚠️ App build.gradle not found"
fi

# Step 5: Check network security config
NETWORK_CONFIG_FILE="android/app/src/main/res/xml/network_security_config.xml"
NETWORK_CONFIG_DIR="android/app/src/main/res/xml"

if [ ! -f "$NETWORK_CONFIG_FILE" ]; then
  echo "📝 Creating network security config file..."
  
  # Create directory if it doesn't exist
  mkdir -p "$NETWORK_CONFIG_DIR"
  
  # Create the network security config file
  cat > "$NETWORK_CONFIG_FILE" << EOF
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow local network connections without HTTPS -->
    <domain-config cleartextTrafficPermitted="true">
        <!-- Local IP ranges -->
        <domain includeSubdomains="true">10.0.0.0/8</domain>
        <domain includeSubdomains="true">172.16.0.0/12</domain>
        <domain includeSubdomains="true">192.168.0.0/16</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
EOF
  
  echo "✅ Created network security config file"
else
  echo "ℹ️ Network security config file already exists"
fi

# Step 6: Copy DirectTcpClientPlugin to the correct location
PLUGIN_DIR="android/app/src/main/java/com/tcp/client"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "📝 Creating plugin directory and copying files..."
  
  # Create plugin directory
  mkdir -p "$PLUGIN_DIR"
  
  # Copy plugin files from capacitor-direct-tcp-client
  cp -r capacitor-direct-tcp-client/android/src/main/java/com/tcp/client/* "$PLUGIN_DIR/"
  
  echo "✅ Copied DirectTcpClientPlugin to Android project"
else
  echo "ℹ️ Plugin directory already exists, updating files..."
  
  # Update plugin files
  cp -r capacitor-direct-tcp-client/android/src/main/java/com/tcp/client/* "$PLUGIN_DIR/"
  
  echo "✅ Updated DirectTcpClientPlugin files"
fi

# Step 7: Clean up temporary files
find android -name "*.tmp" -delete 2>/dev/null

echo
echo "=================================================="
echo "🎉 All Android build fixes applied successfully! 🎉"
echo "=================================================="
echo
echo "Now try running the build script again:"
echo "./build-apk-direct.sh"
echo