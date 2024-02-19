import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vyfinancetracker.app',
  appName: 'VY Finance Tracker',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
