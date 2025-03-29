import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tcpclient.app',
  appName: 'TCP Client',
  webDir: 'dist/public',
  android: {
    // Capacitor 5+ doesn't support setting SDK versions in the config directly
    // They are set in the android/app/build.gradle file instead after project creation
  },
  server: {
    allowNavigation: ['*']
  },
  plugins: {
    DirectTcpClient: {
      enabled: true
    }
  }
};

export default config;
