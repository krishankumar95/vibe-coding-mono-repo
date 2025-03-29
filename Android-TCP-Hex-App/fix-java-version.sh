#!/bin/bash

echo "========================================="
echo "Fixing Java Version in Capacitor Build Files"
echo "========================================="
echo

# Locate the capacitor build gradle file
CAPACITOR_GRADLE="android/app/capacitor.build.gradle"

if [ ! -f "$CAPACITOR_GRADLE" ]; then
  echo "❌ Could not find Capacitor build gradle file. Make sure you're in the project root."
  exit 1
fi

echo "📝 Modifying $CAPACITOR_GRADLE..."

# Replace JavaVersion.VERSION_21 with JavaVersion.VERSION_17 or VERSION_11
if grep -q "VERSION_21" "$CAPACITOR_GRADLE"; then
  # Make a backup of the file
  cp "$CAPACITOR_GRADLE" "$CAPACITOR_GRADLE.bak"
  
  # Replace JavaVersion.VERSION_21 with JavaVersion.VERSION_11
  sed -i.tmp 's/VERSION_21/VERSION_11/g' "$CAPACITOR_GRADLE"
  
  echo "✅ Updated Java version from 21 to 11 in $CAPACITOR_GRADLE"
else
  echo "ℹ️ No reference to VERSION_21 found in $CAPACITOR_GRADLE"
fi

# Also check the android/build.gradle file
ANDROID_GRADLE="android/build.gradle"

if [ -f "$ANDROID_GRADLE" ]; then
  echo "📝 Checking $ANDROID_GRADLE..."
  
  if grep -q "JavaVersion.VERSION_21" "$ANDROID_GRADLE"; then
    # Make a backup of the file
    cp "$ANDROID_GRADLE" "$ANDROID_GRADLE.bak"
    
    # Replace JavaVersion.VERSION_21 with JavaVersion.VERSION_11
    sed -i.tmp 's/JavaVersion.VERSION_21/JavaVersion.VERSION_11/g' "$ANDROID_GRADLE"
    
    echo "✅ Updated Java version from 21 to 11 in $ANDROID_GRADLE"
  else
    echo "ℹ️ No reference to VERSION_21 found in $ANDROID_GRADLE"
  fi
fi

# Remove .tmp files created by sed on macOS
find android -name "*.tmp" -delete

echo
echo "✅ Java version fixes applied successfully!"
echo
echo "Now try running the build script again:"
echo "./build-apk-direct.sh"