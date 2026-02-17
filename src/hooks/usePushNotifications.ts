import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushNotificationState {
  isRegistered: boolean;
  token: string | null;
  error: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isRegistered: false,
    token: null,
    error: null,
  });

  const registerPushNotifications = useCallback(async () => {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return;
      }

      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        setState(prev => ({ ...prev, error: 'Push notification permission denied' }));
        return;
      }

      // Register with FCM/APNS
      await PushNotifications.register();
    } catch (error) {
      console.error('Error registering push notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to register' 
      }));
    }
  }, []);

  useEffect(() => {
    let cleanup = false;

    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform() || cleanup) return;

        const { PushNotifications } = await import('@capacitor/push-notifications');

        // Registration success
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token:', token.value);
          setState({ isRegistered: true, token: token.value, error: null });

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const platform = Capacitor.getPlatform();
            await supabase
              .from('push_tokens')
              .upsert(
                { user_id: user.id, token: token.value, platform, is_active: true },
                { onConflict: 'token' }
              );
          }
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error);
          setState(prev => ({ ...prev, error: error.error }));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification);
          toast(notification.title || 'إشعار جديد', {
            description: notification.body || '',
            duration: 5000,
            action: notification.data?.route ? {
              label: 'عرض',
              onClick: () => { window.location.href = notification.data.route; },
            } : undefined,
          });
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          const data = action.notification.data;
          if (data?.orderId) {
            window.location.href = `/track/${data.orderId}`;
          } else if (data?.route) {
            window.location.href = data.route;
          }
        });

        registerPushNotifications();
      } catch {
        // Capacitor not available on web
      }
    })();

    return () => {
      cleanup = true;
      import('@capacitor/core').then(({ Capacitor }) => {
        if (Capacitor.isNativePlatform()) {
          import('@capacitor/push-notifications').then(({ PushNotifications }) => {
            PushNotifications.removeAllListeners();
          }).catch(() => {});
        }
      }).catch(() => {});
    };
  }, [registerPushNotifications]);

  return {
    ...state,
    registerPushNotifications,
  };
};

export default usePushNotifications;
