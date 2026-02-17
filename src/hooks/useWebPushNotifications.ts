import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WebPushState {
  isRegistered: boolean;
  token: string | null;
  error: string | null;
  isSupported: boolean;
}

export const useWebPushNotifications = () => {
  const [state, setState] = useState<WebPushState>({
    isRegistered: false,
    token: null,
    error: null,
    isSupported: false,
  });

  const registerWebPush = useCallback(async () => {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) return;
    } catch {
      // continue on web
    }

    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, error: 'Notification permission denied' }));
        return;
      }

      const { requestWebPushToken } = await import('@/lib/firebase-web');
      const token = await requestWebPushToken();
      if (!token) {
        setState(prev => ({ ...prev, error: 'Failed to get push token' }));
        return;
      }

      setState({ isRegistered: true, token, error: null, isSupported: true });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('push_tokens')
          .upsert(
            { user_id: user.id, token, platform: 'web', is_active: true },
            { onConflict: 'token' }
          );
      }
    } catch (error) {
      console.error('Web push registration error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to register',
      }));
    }
  }, []);

  useEffect(() => {
    let cleanup = false;

    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform() || cleanup) return;
      } catch {
        // continue on web
      }

      try {
        const { onForegroundMessage } = await import('@/lib/firebase-web');
        onForegroundMessage((payload) => {
          const title = payload.notification?.title || 'إشعار جديد';
          const body = payload.notification?.body || '';
          const route = payload.data?.route;

          toast(title, {
            description: body,
            duration: 5000,
            action: route ? {
              label: 'عرض',
              onClick: () => { window.location.href = route; },
            } : undefined,
          });
        });
      } catch {
        // Firebase not configured
      }
    })();

    return () => { cleanup = true; };
  }, [registerWebPush]);

  return { ...state, registerWebPush };
};
