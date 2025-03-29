#!/bin/bash

echo "========================================="
echo "Fixing Gradle Version for Android Build"
echo "========================================="
echo

# Check if the gradle-wrapper.properties file exists
GRADLE_WRAPPER="android/gradle/wrapper/gradle-wrapper.properties"

if [ ! -f "$GRADLE_WRAPPER" ]; then
  echo "❌ Could not find Gradle wrapper properties file."
  echo "Make sure the Android platform is added and you're in the project root."
  exit 1
fi

# Make a backup of the file
cp "$GRADLE_WRAPPER" "$GRADLE_WRAPPER.bak"
echo "📝 Created backup of $GRADLE_WRAPPER"

# Check current Gradle version
CURRENT_VERSION=$(grep "distributionUrl" "$GRADLE_WRAPPER" | grep -o "gradle-[0-9]\+\.[0-9]\+\(.[0-9]\+\)\?")
echo "📊 Current Gradle version: $CURRENT_VERSION"

# Set a stable version of Gradle (7.6)
STABLE_VERSION="gradle-7.6"

# Replace the current version with the stable version
sed -i.tmp "s|$CURRENT_VERSION|$STABLE_VERSION|g" "$GRADLE_WRAPPER"

# Check if the replacement was successful
if grep -q "$STABLE_VERSION" "$GRADLE_WRAPPER"; then
  echo "✅ Successfully updated Gradle to version 7.6"
else
  echo "❌ Failed to update Gradle version"
  
  # Restore from backup
  cp "$GRADLE_WRAPPER.bak" "$GRADLE_WRAPPER"
  echo "🔄 Restored original Gradle wrapper properties file"
  
  # Try direct replacement of the entire URL
  echo "🔄 Trying alternative approach..."
  
  # Get the full distribution URL
  DISTRIBUTION_URL=$(grep "distributionUrl" "$GRADLE_WRAPPER")
  
  # Create a new wrapper.properties file with the correct URL
  cat > "$GRADLE_WRAPPER" << EOF
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF
  
  echo "✅ Created new gradle-wrapper.properties with Gradle 7.6"
fi

# Remove .tmp files created by sed on macOS
find android -name "*.tmp" -delete 2>/dev/null

echo
echo "✅ Gradle version fix applied successfully!"
echo
echo "Now try running the build script again:"
echo "./build-apk-direct.sh"