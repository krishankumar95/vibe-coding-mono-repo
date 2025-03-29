# TCP Client Android App

A TCP client application for Android that allows users to connect to a TCP server and send hex commands.

## Features

- Connect to any TCP server by IP address and port
- Send hex commands to the connected server
- Repeat commands multiple times with a single click (helps with erratic servers)
- View server responses in real-time
- Pre-defined common hex commands for quick access
- Real-time connection status and activity log
- Android support through Capacitor
- In-app server configuration (no rebuilding needed)

## Project Structure

- `client/`: Frontend React web application
- `server/`: Backend Express server for TCP client implementation
- `android/`: Android application files (generated with Capacitor)
- `shared/`: Shared code and types between client and server

## Development Setup

### Prerequisites

- Node.js and npm
- Android Studio (for building the APK)
- JDK (Java Development Kit)
- Android SDK

### Installing Dependencies

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

This will start the development server at http://localhost:5000.

## Building for Android

### 1. Build the Web Application

```bash
npm run build
```

This creates a production build in the `dist/` directory.

### 2. Sync the Android Project

```bash
npx cap sync android
```

This copies the web build to the Android project and updates plugins.

### 3. Open in Android Studio

```bash
npx cap open android
```

This will open the Android project in Android Studio.

### 4. Build the APK

Pre-req:
1. JDK 17
2. Android Studio 

In Android Studio:
1. Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
2. The APK will be built and saved to `android/app/build/outputs/apk/debug/app-debug.apk`

Direct: 
1. > npm install in project root directory
2. > Run fix-build-gradle-error.sh if required
3. > Run ./downgrade-capacitor.sh if required
4. > Run ./build-apk-direct.sh                                           




## Configure Server Connection (Important)

### Option 1: Configure in the App (Recommended)

The app now includes a server configuration screen that lets you set the server address directly:

1. Install and launch the app on your Android device
2. At the top of the app, find the "Server Configuration" section
3. Enter your server's full address (e.g., `http://192.168.1.100:5000`)
4. Tap "Save Server URL"
5. The app will now connect to your server without rebuilding

### Option 2: Configure During Build

If you prefer to hardcode the server address:

1. Open `client/src/lib/queryClient.ts`
2. Find the `getBaseUrl()` function
3. Update the IP address to your actual server's IP address:

```typescript
// Change this:
return 'http://192.168.1.100:5000'; // Default - user should change this

// To your actual server IP:
return 'http://YOUR_SERVER_IP:5000';
```

## Using the SDK Location Build Script

For an easier build process that handles Android SDK location issues, use the provided script:

```bash
./sdk-location-apk-build.sh
```

This script will:
1. Prompt for your Android SDK location
2. Configure the project with the correct SDK path
3. Build the web application
4. Generate the Android APK

For more details on TCP connection, see `tcp-connection-guide.md`.

## Troubleshooting

### Connection Issues

- Make sure your server and device are on the same network
- Verify that the server IP address is correctly set in the app
- Check that your server has CORS enabled
- Ensure no firewalls are blocking the connection

### Permissions Issues

The app requires internet permissions, which are already included in the manifest.

### Build Issues

If you encounter build issues:
- Make sure Android Studio is updated
- Verify JDK is properly installed
- Check that SDK versions match in `android/variables.gradle`

## License

MIT
