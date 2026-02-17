import { useEffect } from 'react';
import { useCapacitor } from '@/hooks/useCapacitor';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';

/**
 * Isolated component for native/push effects.
 * Lazy-loaded to keep Firebase + Capacitor out of the main bundle.
 */
export interface NativeState {
  networkConnected: boolean;
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

const MobileNativeEffects = ({ onState }: { onState: (s: NativeState) => void }) => {
  const { isNative, networkStatus, keyboardHeight, isKeyboardVisible } = useCapacitor();
  const { isRegistered } = usePushNotifications();
  const { isRegistered: isWebPushRegistered } = useWebPushNotifications();

  useEffect(() => {
    onState({ networkConnected: networkStatus.connected, keyboardHeight, isKeyboardVisible });
  }, [networkStatus.connected, keyboardHeight, isKeyboardVisible, onState]);

  useEffect(() => {
    if (isNative) {
      console.log('Running in native mode, push registered:', isRegistered);
    } else {
      console.log('Web push registered:', isWebPushRegistered);
    }
  }, [isNative, isRegistered, isWebPushRegistered]);

  return null;
};

export default MobileNativeEffects;
