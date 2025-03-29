# Building an APK for Android

This document outlines the steps to build an Android APK for the TCP Client application.

## Prerequisites

- Android Studio installed on your development machine
- Java Development Kit (JDK) installed
- Android SDK installed and configured

## Steps to Build the APK

### 1. Build the Web Application

First, build the web application:

```bash
npm run build
```

This will create a production build of the web application in the `client/dist` directory.

### 2. Add Android Platform to Capacitor

```bash
npx cap add android
```

This command adds the Android platform to your Capacitor project.

### 3. Update Android Project with Latest Web Build

```bash
npx cap sync android
```

This synchronizes your web application with the Android project.

### 4. Open in Android Studio

```bash
npx cap open android
```

This will open the Android project in Android Studio.

### 5. Configure Android Project (if needed)

In Android Studio:

- Update the SDK versions in `android/app/build.gradle` if needed:
  ```gradle
  android {
      compileSdkVersion 33
      defaultConfig {
          minSdkVersion 22
          targetSdkVersion 33
          // other settings...
      }
  }
  ```

### 6. Add Network Security Configuration

Create a network security configuration file to allow clear text traffic (if needed):

1. Create a file at `android/app/src/main/res/xml/network_security_config.xml` with:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <base-config cleartextTrafficPermitted="true">
           <trust-anchors>
               <certificates src="system" />
           </trust-anchors>
       </base-config>
   </network-security-config>
   ```

2. Update `android/app/src/main/AndroidManifest.xml` to reference this configuration:
   ```xml
   <application
       android:networkSecurityConfig="@xml/network_security_config"
       ...
   >
   ```

### 7. Build the APK

In Android Studio:

- Select `Build > Build Bundle(s) / APK(s) > Build APK(s)`
- Wait for the build to complete
- The APK will be available at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 8. Testing on a Device

- Enable USB debugging on your Android device
- Connect your device to your computer
- In Android Studio, select `Run > Run 'app'` to install and run the app on your device

## Important Notes

### Configuring the Server Address

When testing on a real device, you'll need to update the server address in the `client/src/lib/queryClient.ts` file:

```typescript
// Change this line:
return 'http://10.0.2.2:5000'; // Android emulator special IP for localhost

// To your actual server IP address:
return 'http://YOUR_SERVER_IP:5000';
```

### Debugging

If you encounter issues with the app connecting to the server:

1. Make sure CORS is properly configured on the server
2. Verify that the server is accessible from the device
3. Check that the server IP address is correctly set in the app
4. Ensure that your Android device and server are on the same network

### Troubleshooting Common Issues

- **Network Connection Issues**: Check that the app has proper network permissions in the AndroidManifest.xml
- **CORS Issues**: Verify that CORS is properly configured on the server
- **Certificate Issues**: If using HTTPS, make sure the device trusts the certificate