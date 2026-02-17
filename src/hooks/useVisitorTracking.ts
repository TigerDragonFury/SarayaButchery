import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'saraya_visitor_sid';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

function getOrCreateSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function isMobileDevice(): boolean {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

export const useVisitorTracking = () => {
  const location = useLocation();
  const sessionId = useRef(getOrCreateSessionId());
  const initialized = useRef(false);

  useEffect(() => {
    const upsertSession = async (page: string) => {
      const payload = {
        session_id: sessionId.current,
        current_page: page,
        page_title: document.title,
        last_seen: new Date().toISOString(),
        is_mobile: isMobileDevice(),
        referrer: initialized.current ? undefined : document.referrer || null,
      };

      await supabase
        .from('visitor_sessions' as any)
        .upsert(payload, { onConflict: 'session_id' });

      initialized.current = true;
    };

    upsertSession(location.pathname);

    const interval = setInterval(() => {
      upsertSession(location.pathname);
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [location.pathname]);

  // Cleanup on unload
  useEffect(() => {
    const handleUnload = async () => {
      await supabase
        .from('visitor_sessions' as any)
        .delete()
        .eq('session_id', sessionId.current);
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
};
