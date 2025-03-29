# TCP Client Android APK Build Instructions

Follow these steps to build the Android APK for your Direct TCP Client app.

## Step 1: Downgrade Capacitor for Compatibility

The first step is to downgrade Capacitor to a version that's known to work with Android:

```bash
# Make the script executable (if not already)
chmod +x ./downgrade-capacitor.sh

# Run the downgrade script
./downgrade-capacitor.sh
```

This will:
- Install Capacitor v5.3.0 packages (core, CLI, and Android)
- Add the Android platform if needed
- Sync the changes to the Android project

## Step 2: Fix All Build Issues

Next, run the comprehensive fix script to address Java and Gradle compatibility issues:

```bash
# Make the script executable (if not already)
chmod +x ./fix-all-build-issues.sh

# Run the fix script
./fix-all-build-issues.sh
```

This script will:
- Fix Java version references in build files
- Fix Gradle version issues
- Set up the Android SDK location (you'll need to enter your SDK path)
- And perform other necessary compatibility fixes

## Step 3: Build the APK

Finally, build the APK with the direct build script:

```bash
# Make the script executable (if not already)
chmod +x ./build-apk-direct.sh

# Run the build script
./build-apk-direct.sh
```

The APK will be built and placed in:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

If you encounter any specific errors:

1. **Java Version Issues**: Run just the Java version fix script:
   ```bash
   ./fix-java-version.sh
   ```

2. **Gradle Issues**: You might need to modify the Gradle version manually in:
   ```
   android/gradle/wrapper/gradle-wrapper.properties
   ```
   Change to a stable version like 7.6.

3. **Capacitor Plugin Issues**: Make sure your custom TCP plugin is properly synced:
   ```bash
   cp -r capacitor-direct-tcp-client/android/src/main/java/com/tcp/client/* android/app/src/main/java/com/tcp/client/
   ```

4. **SDK Location Issues**: Create a `local.properties` file in the `android` directory:
   ```
   sdk.dir=/path/to/your/android/sdk
   ```

5. **Build Failed on MacOS**: Try using Gradle 7.6 and Java 11 for better compatibility.