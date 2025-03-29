#!/bin/bash

echo "========================================="
echo "Fixing All Android Build Issues"
echo "========================================="
echo

# Function to fix Java version
fix_java_version() {
  echo "🔧 Fixing Java version issues..."
  
  # Locate the capacitor build gradle file
  CAPACITOR_GRADLE="android/app/capacitor.build.gradle"
  
  if [ ! -f "$CAPACITOR_GRADLE" ]; then
    echo "ℹ️ Could not find Capacitor build gradle file, skipping."
    return
  fi
  
  echo "📝 Modifying $CAPACITOR_GRADLE..."
  
  # Replace JavaVersion.VERSION_21 with JavaVersion.VERSION_11
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
  
  echo "✅ Java version fixes applied successfully!"
  echo
}

# Function to fix Gradle version
fix_gradle_version() {
  echo "🔧 Fixing Gradle version issues..."
  
  # Check if the gradle-wrapper.properties file exists
  GRADLE_WRAPPER="android/gradle/wrapper/gradle-wrapper.properties"
  
  if [ ! -f "$GRADLE_WRAPPER" ]; then
    echo "ℹ️ Could not find Gradle wrapper properties file, skipping."
    return
  fi
  
  echo "📝 Checking $GRADLE_WRAPPER..."
  
  # Make a backup of the file
  cp "$GRADLE_WRAPPER" "$GRADLE_WRAPPER.bak"
  
  # Check current Gradle version
  CURRENT_VERSION=$(grep "distributionUrl" "$GRADLE_WRAPPER" | grep -o "gradle-[0-9]\+\.[0-9]\+\(.[0-9]\+\)\?")
  echo "📊 Current Gradle version: $CURRENT_VERSION"
  
  # Set a stable version of Gradle (7.6)
  STABLE_VERSION="gradle-7.6"
  
  # Replace the current version with the stable version
  sed -i.tmp "s/$CURRENT_VERSION/$STABLE_VERSION/g" "$GRADLE_WRAPPER"
  
  echo "✅ Updated Gradle to version 7.6 in $GRADLE_WRAPPER"
  echo "✅ Gradle version fixes applied successfully!"
  echo
}

# Function to setup Android SDK location
setup_sdk_location() {
  echo "🔧 Setting up Android SDK location..."
  
  # Detect OS for SDK path suggestions
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
  
  echo "Enter your Android SDK path (or press Enter to use '$DEFAULT_SDK_PATH'):"
  read SDK_PATH
  
  if [ -z "$SDK_PATH" ]; then
    SDK_PATH="$DEFAULT_SDK_PATH"
  fi
  
  echo "Using SDK path: $SDK_PATH"
  
  # Create local.properties file
  echo "sdk.dir=$SDK_PATH" > android/local.properties
  
  echo "✅ Created android/local.properties with SDK path: $SDK_PATH"
  echo
}

# Function to downgrade Capacitor if needed
downgrade_capacitor() {
  echo "🔧 Checking Capacitor version..."
  
  # Get the current Capacitor version
  CURRENT_VERSION=$(grep '"@capacitor/core"' package.json | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
  
  if [ -z "$CURRENT_VERSION" ]; then
    echo "ℹ️ Could not determine current Capacitor version, skipping."
    return
  fi
  
  MAJOR_VERSION=$(echo $CURRENT_VERSION | cut -d. -f1)
  
  echo "📊 Current Capacitor version: $CURRENT_VERSION (major: $MAJOR_VERSION)"
  
  if [ "$MAJOR_VERSION" -ge "7" ]; then
    echo "🔄 Downgrading Capacitor from v$CURRENT_VERSION to v5.3.0 for better compatibility..."
    
    # Install specific versions of Capacitor packages
    npm install @capacitor/core@5.3.0 @capacitor/cli@5.3.0 @capacitor/android@5.3.0 --save
    
    if [ $? -eq 0 ]; then
      echo "✅ Successfully downgraded Capacitor to v5.3.0"
    else
      echo "❌ Failed to downgrade Capacitor"
    fi
  else
    echo "ℹ️ Capacitor version is already compatible ($CURRENT_VERSION)"
  fi
  
  echo
}

# Run all fix functions
fix_java_version
fix_gradle_version
setup_sdk_location
downgrade_capacitor

# Remove .tmp files created by sed on macOS
find android -name "*.tmp" -delete 2>/dev/null

echo "🎉 All fixes applied successfully!"
echo
echo "Now try running the build script again:"
echo "./build-apk-direct.sh"