import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.examenconciencia.app',
  appName: 'Examen de Conciencia',
  versionName: '1.2.6',
  versionCode: 19,
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#141415',
      showSpinner: false
    }
  }
};

export default config;
