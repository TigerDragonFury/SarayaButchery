import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alsarayabutchery.app',
  appName: 'ملحمة السرايا',
  webDir: 'dist',
  server: {
    url: 'https://b58590dc-1309-4244-a272-dee84725ba0d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#3D1A1A',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'splash',
    },
    StatusBar: {
      backgroundColor: '#3D1A1A',
      style: 'LIGHT',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'alsaraya',
    backgroundColor: '#3D1A1A',
  },
  android: {
    backgroundColor: '#3D1A1A',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  }
};

export default config;
