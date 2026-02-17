import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    connectionType: 'wifi',
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Dynamic import to keep Capacitor out of the main bundle on web
    import('@capacitor/core').then(({ Capacitor }) => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);
      setPlatform(Capacitor.getPlatform() as 'web' | 'ios' | 'android');

      if (native) {
        initializeNative();
      }
    }).catch(() => {
      // Capacitor not available
    });
  }, []);

  const initializeNative = async () => {
    try {
      const [
        { SplashScreen },
        { StatusBar, Style },
        { Network },
        { Keyboard },
        { App },
      ] = await Promise.all([
        import('@capacitor/splash-screen'),
        import('@capacitor/status-bar'),
        import('@capacitor/network'),
        import('@capacitor/keyboard'),
        import('@capacitor/app'),
      ]);

      // Hide splash screen after app is ready
      await SplashScreen.hide();

      // Configure status bar
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#3D1A1A' });

      // Set up network listener
      const status = await Network.getStatus();
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType,
      });

      Network.addListener('networkStatusChange', (s) => {
        setNetworkStatus({
          connected: s.connected,
          connectionType: s.connectionType,
        });
      });

      // Set up keyboard listeners
      Keyboard.addListener('keyboardWillShow', (info) => {
        setKeyboardHeight(info.keyboardHeight);
        setIsKeyboardVisible(true);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      });

      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive);
      });

      // Handle back button (Android)
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    } catch (error) {
      console.error('Error initializing native features:', error);
    }
  };

  const hideKeyboard = useCallback(async () => {
    if (isNative) {
      const { Keyboard } = await import('@capacitor/keyboard');
      await Keyboard.hide();
    }
  }, [isNative]);

  return {
    isNative,
    platform,
    networkStatus,
    keyboardHeight,
    isKeyboardVisible,
    hideKeyboard,
  };
};

export default useCapacitor;
