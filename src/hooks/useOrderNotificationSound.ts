import { useCallback, useRef, useEffect } from 'react';
import { OrderStatus } from '@/types/order';
import { useSoundSettings } from './useSoundSettings';

// Sound configuration for each status change
const STATUS_SOUNDS: Partial<Record<OrderStatus, { frequency: number; duration: number; pattern: number[] }>> = {
  confirmed: { frequency: 523.25, duration: 150, pattern: [1, 0.5, 1] }, // C5 - double beep
  preparing: { frequency: 587.33, duration: 200, pattern: [1] }, // D5 - single tone
  ready: { frequency: 659.25, duration: 150, pattern: [1, 0.5, 1, 0.5, 1] }, // E5 - triple beep
  out_for_delivery: { frequency: 783.99, duration: 200, pattern: [1, 1, 1] }, // G5 - three tones (exciting!)
  delivered: { frequency: 880, duration: 300, pattern: [1, 0.3, 1.5] }, // A5 - celebration double
};

interface UseOrderNotificationSoundResult {
  playStatusChangeSound: (newStatus: OrderStatus) => void;
  playCustomSound: (frequency: number, duration: number) => void;
  isSupported: boolean;
}

export const useOrderNotificationSound = (): UseOrderNotificationSoundResult => {
  const { isMuted } = useSoundSettings();
  const audioContextRef = useRef<AudioContext | null>(null);
  const isSupported = typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);

  // Initialize audio context on first user interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && isSupported) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, [isSupported]);

  // Play a single tone
  const playTone = useCallback((frequency: number, duration: number, startTime: number) => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    // Resume if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Smooth envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    gainNode.gain.setValueAtTime(0.3, startTime + duration / 1000 - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration / 1000);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
  }, [getAudioContext]);

  // Play a pattern of tones
  const playPattern = useCallback((frequency: number, baseDuration: number, pattern: number[]) => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    let currentTime = audioContext.currentTime;

    pattern.forEach((multiplier, index) => {
      if (multiplier > 0) {
        playTone(frequency, baseDuration * multiplier, currentTime);
      }
      currentTime += (baseDuration * Math.abs(multiplier)) / 1000 + 0.1;
    });
  }, [getAudioContext, playTone]);

  // Play sound for a status change
  const playStatusChangeSound = useCallback((newStatus: OrderStatus) => {
    if (isMuted) return; // Don't play if muted
    const soundConfig = STATUS_SOUNDS[newStatus];
    if (soundConfig) {
      playPattern(soundConfig.frequency, soundConfig.duration, soundConfig.pattern);
    }
  }, [playPattern, isMuted]);

  // Play a custom sound
  const playCustomSound = useCallback((frequency: number, duration: number) => {
    const audioContext = getAudioContext();
    if (audioContext) {
      playTone(frequency, duration, audioContext.currentTime);
    }
  }, [getAudioContext, playTone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    playStatusChangeSound,
    playCustomSound,
    isSupported,
  };
};
