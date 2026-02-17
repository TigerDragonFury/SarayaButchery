import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderUpdate, DriverLocation, OrderStatus } from '@/types/order';
import { useOrderNotificationSound } from './useOrderNotificationSound';

// Polling interval for iiko status sync (30 seconds)
const IIKO_POLL_INTERVAL = 30 * 1000;

// Realtime location update interval (for manual refresh fallback) - 10 seconds
const LOCATION_REFRESH_INTERVAL = 10 * 1000;

interface UseOrderTrackingResult {
  order: Order | null;
  updates: OrderUpdate[];
  driverLocation: DriverLocation | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  soundEnabled: boolean;
  toggleSound: () => void;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  isLocationLive: boolean;
}

export const useOrderTracking = (orderNumber: string): UseOrderTrackingResult => {
  const [order, setOrder] = useState<Order | null>(null);
  const [updates, setUpdates] = useState<OrderUpdate[]>([]);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLocationLive, setIsLocationLive] = useState(false);
  
  const { playStatusChangeSound } = useOrderNotificationSound();
  const previousStatusRef = useRef<OrderStatus | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationPollRef = useRef<NodeJS.Timeout | null>(null);
  const driverIdRef = useRef<string | null>(null);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First try to find by iiko_order_number (official POS number)
      let { data: trackingData, error: trackingError } = await supabase
        .rpc('get_order_tracking', { p_order_number: orderNumber });

      // If not found, try searching by iiko_order_number (with or without # prefix)
      if (!trackingData || trackingData.length === 0) {
        const searchVariants = [orderNumber, `#${orderNumber}`, orderNumber.replace('#', '')];
        
        for (const variant of searchVariants) {
          const { data: orderByIiko } = await supabase
            .from('orders' as any)
            .select('order_number')
            .eq('iiko_order_number', variant)
            .maybeSingle();

          if (orderByIiko) {
            const result = await supabase
              .rpc('get_order_tracking', { p_order_number: (orderByIiko as any).order_number });
            trackingData = result.data;
            trackingError = result.error;
            break;
          }
        }
      }

      if (trackingError) {
        console.error('Tracking error:', trackingError);
        throw trackingError;
      }

      if (!trackingData || trackingData.length === 0) {
        setError('Order not found');
        return;
      }

      const trackingResult = trackingData[0];

      // Fetch full order data (RLS will filter based on permissions)
      // First try by order_number, then by iiko_order_number
      let { data: orderData, error: orderError } = await supabase
        .from('orders' as any)
        .select('*')
        .eq('order_number', trackingResult.order_number)
        .single();

      if (orderError) {
        // If RLS blocks direct access, build order from tracking data
        if (orderError.code === 'PGRST116') {
          // Create minimal order object from secure tracking function
          const minimalOrder: Order = {
            id: trackingResult.order_id,
            order_number: trackingResult.order_number,
            status: trackingResult.status,
            customer_id: null,
            customer_name: '',
            customer_phone: '',
            customer_email: null,
            driver_id: null,
            items: [],
            subtotal: 0,
            delivery_fee: 0,
            discount: 0,
            total: 0,
            total_weight: 0,
            delivery_address: '',
            delivery_city: '',
            delivery_notes: null,
            estimated_arrival: null,
            delivered_at: null,
            iiko_order_id: null,
            iiko_synced: false,
            source: 'website',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setOrder(minimalOrder);
        } else {
          throw orderError;
        }
      } else {
        // Parse items from JSONB
        const parsedOrder: Order = {
          ...(orderData as any),
          items: typeof (orderData as any).items === 'string' 
            ? JSON.parse((orderData as any).items) 
            : (orderData as any).items || [],
        };
        setOrder(parsedOrder);
      }

      // Fetch order updates (will be filtered by RLS)
      const { data: updatesData, error: updatesError } = await supabase
        .from('order_updates' as any)
        .select('*')
        .eq('order_id', trackingResult.order_id)
        .order('created_at', { ascending: true });

      if (!updatesError && updatesData) {
        setUpdates(updatesData as unknown as OrderUpdate[]);
      }

      // Use secure tracking data for driver location (no personal data exposed)
      if (trackingResult.driver_lat && trackingResult.driver_lng) {
        setDriverLocation({
          id: 'tracking-location',
          driver_id: 'hidden', // Driver ID not exposed for security
          latitude: trackingResult.driver_lat,
          longitude: trackingResult.driver_lng,
          heading: trackingResult.heading || 0,
          speed: trackingResult.speed || 0,
          accuracy: 10,
          created_at: trackingResult.location_updated_at || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  // Sync status from iiko POS
  const syncFromIiko = useCallback(async () => {
    if (!orderNumber || !order) return;
    
    // Don't sync if already delivered or cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      console.log('[iiko-poll] Order completed, stopping sync');
      return;
    }

    setIsSyncing(true);
    try {
      console.log(`[iiko-poll] Syncing status for: ${orderNumber}`);
      
      const { data, error } = await supabase.functions.invoke('iiko-order-status', {
        body: null,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Use query param for GET request
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iiko-order-status?order_number=${encodeURIComponent(orderNumber)}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('[iiko-poll] Sync result:', result);
        
        if (result.success && result.updated) {
          // Status was updated, refetch to get latest data
          console.log(`[iiko-poll] Status updated to: ${result.status}`);
          await fetchOrder();
        }
        
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('[iiko-poll] Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [orderNumber, order, fetchOrder]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // iiko polling every 30 seconds for active orders
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') {
      // Clear interval if order is completed
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Initial sync after order loads
    const initialSyncTimeout = setTimeout(() => {
      syncFromIiko();
    }, 2000);

    // Set up polling interval
    pollIntervalRef.current = setInterval(() => {
      syncFromIiko();
    }, IIKO_POLL_INTERVAL);

    console.log(`[iiko-poll] Started polling every ${IIKO_POLL_INTERVAL / 1000}s`);

    return () => {
      clearTimeout(initialSyncTimeout);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [order?.id, order?.status, syncFromIiko]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!order?.id) return;

    // Subscribe to order changes
    const orderChannel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          console.log('Order updated:', payload);
          const updatedOrder = {
            ...payload.new,
            items: typeof payload.new.items === 'string'
              ? JSON.parse(payload.new.items)
              : payload.new.items || [],
          } as Order;
          
          // Play notification sound on status change
          const newStatus = updatedOrder.status;
          if (soundEnabled && previousStatusRef.current && newStatus !== previousStatusRef.current) {
            console.log(`🔔 Status changed: ${previousStatusRef.current} → ${newStatus}`);
            playStatusChangeSound(newStatus);
          }
          previousStatusRef.current = newStatus;
          
          setOrder(updatedOrder);
        }
      )
      .subscribe();

    // Subscribe to new order updates
    const updatesChannel = supabase
      .channel(`order-updates-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_updates',
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          console.log('New order update:', payload);
          setUpdates((prev) => [...prev, payload.new as OrderUpdate]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, [order?.id]);

  // Subscribe to driver location updates when out for delivery using Realtime
  useEffect(() => {
    // We need the order to be out for delivery and have a driver
    if (!order?.id || order?.status !== 'out_for_delivery') {
      setIsLocationLive(false);
      if (locationPollRef.current) {
        clearInterval(locationPollRef.current);
        locationPollRef.current = null;
      }
      return;
    }

    console.log('[Realtime] Setting up driver location subscription for order:', order.order_number);

    // Fetch latest location using the secure RPC function
    const fetchLatestLocation = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_order_tracking', { p_order_number: order.order_number });
        
        if (!error && data && data.length > 0) {
          const result = data[0];
          if (result.driver_lat && result.driver_lng) {
            console.log('[Location] Updated from RPC:', result.driver_lat, result.driver_lng);
            setDriverLocation({
              id: 'tracking-location',
              driver_id: driverIdRef.current || 'hidden',
              latitude: result.driver_lat,
              longitude: result.driver_lng,
              heading: result.heading || 0,
              speed: result.speed || 0,
              accuracy: 10,
              created_at: result.location_updated_at || new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn('[Location] Fetch error:', err);
      }
    };

    // If we have a driver_id, subscribe to realtime updates
    if (order.driver_id && order.driver_id !== 'hidden') {
      driverIdRef.current = order.driver_id;
      
      const locationChannel = supabase
        .channel(`driver-location-${order.driver_id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'driver_locations',
            filter: `driver_id=eq.${order.driver_id}`,
          },
          (payload) => {
            console.log('[Realtime] 📍 Driver location updated:', payload.new);
            setDriverLocation(payload.new as DriverLocation);
            setIsLocationLive(true);
          }
        )
        .subscribe((status) => {
          console.log('[Realtime] Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsLocationLive(true);
          }
        });

      // Also poll as fallback every 10 seconds
      fetchLatestLocation();
      locationPollRef.current = setInterval(fetchLatestLocation, LOCATION_REFRESH_INTERVAL);

      return () => {
        console.log('[Realtime] Cleaning up location subscription');
        supabase.removeChannel(locationChannel);
        if (locationPollRef.current) {
          clearInterval(locationPollRef.current);
          locationPollRef.current = null;
        }
      };
    } else {
      // No driver_id available (RLS restriction), use polling only
      console.log('[Location] Using polling fallback (no driver_id available)');
      fetchLatestLocation();
      locationPollRef.current = setInterval(fetchLatestLocation, LOCATION_REFRESH_INTERVAL);
      setIsLocationLive(true);

      return () => {
        if (locationPollRef.current) {
          clearInterval(locationPollRef.current);
          locationPollRef.current = null;
        }
      };
    }
  }, [order?.id, order?.driver_id, order?.status, order?.order_number]);

  // Track initial status
  useEffect(() => {
    if (order?.status && !previousStatusRef.current) {
      previousStatusRef.current = order.status;
    }
  }, [order?.status]);

  return {
    order,
    updates,
    driverLocation,
    loading,
    error,
    refetch: fetchOrder,
    soundEnabled,
    toggleSound,
    lastSyncTime,
    isSyncing,
    isLocationLive,
  };
};

// Hook for simulated/demo tracking
export const useDemoOrderTracking = () => {
  const [demoOrder, setDemoOrder] = useState<Order | null>(null);
  const [demoLocation, setDemoLocation] = useState<DriverLocation | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  const startDemo = useCallback(() => {
    const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    
    // Create demo order
    const order: Order = {
      id: 'demo-order',
      order_number: 'ORD-DEMO-2024',
      customer_id: null,
      customer_name: 'عميل تجريبي',
      customer_phone: '0501234567',
      customer_email: null,
      driver_id: 'demo-driver',
      status: 'pending',
      items: [
        {
          productId: 'demo-1',
          productName: 'ريش غنم',
          quantity: 1.5,
          unit: 'kg',
          pricePerUnit: 120,
          totalPrice: 180,
        },
      ],
      subtotal: 180,
      delivery_fee: 15,
      discount: 0,
      total: 195,
      total_weight: 1.5,
      delivery_address: 'أبوظبي، شارع الكورنيش',
      delivery_city: 'Abu Dhabi',
      delivery_notes: null,
      estimated_arrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      delivered_at: null,
      iiko_order_id: null,
      iiko_synced: false,
      source: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setDemoOrder(order);
    setStatusIndex(0);

    // Simulate status progression
    const interval = setInterval(() => {
      setStatusIndex((prev) => {
        const next = prev + 1;
        if (next >= statuses.length) {
          clearInterval(interval);
          return prev;
        }
        
        setDemoOrder((prevOrder) => 
          prevOrder ? { ...prevOrder, status: statuses[next] } : null
        );
        
        // Start location simulation when out for delivery
        if (statuses[next] === 'out_for_delivery') {
          simulateDriverMovement();
        }
        
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const simulateDriverMovement = useCallback(() => {
    // Simulate driver moving towards destination
    let lat = 24.4539; // Starting near Abu Dhabi
    let lng = 54.3773;
    const destLat = 24.4839;
    const destLng = 54.3573;
    
    const moveInterval = setInterval(() => {
      lat += (destLat - lat) * 0.1;
      lng += (destLng - lng) * 0.1;
      
      setDemoLocation({
        id: 'demo-location',
        driver_id: 'demo-driver',
        latitude: lat,
        longitude: lng,
        heading: 45,
        speed: 35,
        accuracy: 10,
        created_at: new Date().toISOString(),
      });
      
      // Stop when close to destination
      if (Math.abs(lat - destLat) < 0.001 && Math.abs(lng - destLng) < 0.001) {
        clearInterval(moveInterval);
      }
    }, 3000);
  }, []);

  return {
    demoOrder,
    demoLocation,
    startDemo,
  };
};
