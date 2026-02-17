import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ProximityAlertState {
  isNear: boolean;
  distance: number | null;
  alertShown: boolean;
}

// Calculate distance between two coordinates in meters using Haversine formula
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Play proximity alert sound using Web Audio API
function playProximityAlertSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Create an exciting arrival sound - ascending tones
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + index * 0.15;
      const duration = 0.2;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    // Add a final celebratory chord
    setTimeout(() => {
      const chord = [523.25, 659.25, 783.99];
      chord.forEach((freq) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.5);
      });
    }, 600);
  } catch (error) {
    console.warn('Failed to play proximity alert sound:', error);
  }
}

export const useProximityAlert = (
  orderId: string | null,
  driverLat: number | null,
  driverLng: number | null,
  deliveryLat: number | null,
  deliveryLng: number | null,
  soundEnabled: boolean = true
) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [state, setState] = useState<ProximityAlertState>({
    isNear: false,
    distance: null,
    alertShown: false,
  });
  const alertShownRef = useRef(false);

  // Reset alert when order changes
  useEffect(() => {
    alertShownRef.current = false;
    setState({
      isNear: false,
      distance: null,
      alertShown: false,
    });
  }, [orderId]);

  // Check proximity whenever driver location updates
  useEffect(() => {
    if (!driverLat || !driverLng || !deliveryLat || !deliveryLng) {
      return;
    }

    const distance = calculateDistance(driverLat, driverLng, deliveryLat, deliveryLng);
    const PROXIMITY_THRESHOLD = 500; // 500 meters
    const isNear = distance <= PROXIMITY_THRESHOLD;

    setState(prev => ({
      ...prev,
      distance: Math.round(distance),
      isNear,
    }));

    // Show alert only once when driver enters proximity zone
    if (isNear && !alertShownRef.current) {
      alertShownRef.current = true;
      setState(prev => ({ ...prev, alertShown: true }));

      // Play sound if enabled
      if (soundEnabled) {
        playProximityAlertSound();
      }

      // Show toast notification
      toast.success(
        isRTL 
          ? `🚗 السائق على بُعد ${Math.round(distance)} متر! استعد لاستلام طلبك`
          : `🚗 Driver is ${Math.round(distance)}m away! Get ready to receive your order`,
        {
          duration: 10000,
          icon: '🎉',
        }
      );

      // Call edge function to record the proximity alert (for analytics)
      if (orderId) {
        supabase.functions.invoke('driver-proximity-alert', {
          body: {
            orderId,
            driverLat,
            driverLng,
          },
        }).catch(err => {
          console.warn('Failed to record proximity alert:', err);
        });
      }
    }
  }, [driverLat, driverLng, deliveryLat, deliveryLng, orderId, soundEnabled, isRTL]);

  return state;
};

export default useProximityAlert;
