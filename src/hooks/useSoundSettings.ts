import { useState, useCallback } from 'react';

interface SoundSettings {
  isMuted: boolean;
}

const STORAGE_KEY = 'admin_sound_settings';

export const useSoundSettings = () => {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).isMuted : false;
  });

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newState = !prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isMuted: newState }));
      return newState;
    });
  }, []);

  return { isMuted, toggleMute };
};
