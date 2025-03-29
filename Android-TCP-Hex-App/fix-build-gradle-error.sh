#!/bin/bash

echo "=================================================="
echo "Fixing Android Build Gradle Error"
echo "=================================================="
echo

# Step 1: Check for Android manifest and update it
ANDROID_MANIFEST="android/app/src/main/AndroidManifest.xml"

if [ -f "$ANDROID_MANIFEST" ]; then
  echo "📝 Checking $ANDROID_MANIFEST for network security config..."
  
  # Create backup
  cp "$ANDROID_MANIFEST" "${ANDROID_MANIFEST}.bak"
  
  # Check if network security config is already declared
  if ! grep -q "android:networkSecurityConfig" "$ANDROID_MANIFEST"; then
    echo "Adding network security config to AndroidManifest.xml"
    
    # Update the manifest to include the network security config
    sed -i.tmp 's/<application /<application android:networkSecurityConfig="@xml\/network_security_config" /g' "$ANDROID_MANIFEST"
    
    echo "✅ Added network security config reference to AndroidManifest.xml"
  else
    echo "ℹ️ Network security config already added to AndroidManifest.xml"
  fi
else
  echo "❌ Android manifest file not found!"
fi

# Step 2: Create the network security config file if needed
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

# Step 3: Fix Java version in capacitor.build.gradle
CAPACITOR_GRADLE="android/app/capacitor.build.gradle"

if [ -f "$CAPACITOR_GRADLE" ]; then
  echo "📝 Checking Java version in $CAPACITOR_GRADLE..."
  
  # Make a backup
  cp "$CAPACITOR_GRADLE" "${CAPACITOR_GRADLE}.bak"
  
  # Check and fix Java version
  if grep -q "VERSION_21" "$CAPACITOR_GRADLE"; then
    sed -i.tmp 's/VERSION_21/VERSION_17/g' "$CAPACITOR_GRADLE"
    echo "✅ Updated Java version from 21 to 17 in $CAPACITOR_GRADLE"
  elif grep -q "VERSION_1_8" "$CAPACITOR_GRADLE"; then
    sed -i.tmp 's/VERSION_1_8/VERSION_17/g' "$CAPACITOR_GRADLE"
    echo "✅ Updated Java version from 1.8 to 17 in $CAPACITOR_GRADLE"
  else
    echo "ℹ️ No problematic Java version found in $CAPACITOR_GRADLE"
  fi
else
  echo "❌ Capacitor build gradle file not found!"
fi

# Step 4: Clean up tmp files
find android -name "*.tmp" -delete 2>/dev/null

echo
echo "=================================================="
echo "🎉 Build gradle error fixes applied!"
echo "=================================================="
echo
echo "Now try running the build script again:"
echo "./build-apk-direct.sh"