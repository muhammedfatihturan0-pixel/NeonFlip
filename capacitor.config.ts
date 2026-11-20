import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mfturan.neonflip',
  appName: 'ZYPHOR',
  webDir: 'dist',
  backgroundColor: '#000612',
  android: {
    backgroundColor: '#000612',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#000612',
      showSpinner: false,
    },
  },
};

export default config;
