import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderConfirmation {
  id: string;
  order_id: string;
  photo_path: string;
  photo_note: string | null;
  confirmation_status: 'pending' | 'approved' | 'change_requested';
  customer_response: string | null;
  created_at: string;
  responded_at: string | null;
  created_by: string | null;
}

export function useOrderConfirmation(orderId: string | undefined) {
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Fetch confirmation
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchConfirmation = async () => {
      try {
        const { data, error } = await supabase
          .from('order_confirmations')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setConfirmation(data as OrderConfirmation | null);
      } catch (error) {
        console.error('Error fetching confirmation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmation();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-confirmation-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_confirmations',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setConfirmation(payload.new as OrderConfirmation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Upload photo and create confirmation
  const uploadPhoto = async (file: File, note?: string) => {
    if (!orderId) return null;

    setUploading(true);
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('order-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create confirmation record
      const { data, error } = await supabase
        .from('order_confirmations')
        .insert({
          order_id: orderId,
          photo_path: fileName,
          photo_note: note || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Photo uploaded',
        description: 'Customer will be notified to review.',
      });

      return data as OrderConfirmation;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Customer response
  const respondToConfirmation = async (
    confirmationId: string,
    status: 'approved' | 'change_requested',
    response?: string
  ) => {
    try {
      const { error } = await supabase
        .from('order_confirmations')
        .update({
          confirmation_status: status,
          customer_response: response || null,
          responded_at: new Date().toISOString(),
        })
        .eq('id', confirmationId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? 'Order approved!' : 'Change requested',
        description:
          status === 'approved'
            ? 'Your order will be dispatched soon.'
            : 'The butcher will review your request.',
      });

      return true;
    } catch (error: any) {
      console.error('Error responding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit response',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Get photo URL
  const getPhotoUrl = (photoPath: string) => {
    const { data } = supabase.storage.from('order-photos').getPublicUrl(photoPath);
    return data.publicUrl;
  };

  return {
    confirmation,
    loading,
    uploading,
    uploadPhoto,
    respondToConfirmation,
    getPhotoUrl,
  };
}

// Hook for fetching confirmation by order number (for tracking page)
export function useOrderConfirmationByNumber(orderNumber: string | undefined) {
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const fetchConfirmation = async () => {
      try {
        // First get order ID from order number
        const { data: orderData, error: orderError } = await supabase
          .rpc('get_order_tracking', { p_order_number: orderNumber });

        if (orderError) throw orderError;
        if (!orderData || orderData.length === 0) {
          setLoading(false);
          return;
        }

        const fetchedOrderId = orderData[0].order_id;
        setOrderId(fetchedOrderId);

        // Fetch confirmation for this order
        const { data, error } = await supabase
          .from('order_confirmations')
          .select('*')
          .eq('order_id', fetchedOrderId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setConfirmation(data as OrderConfirmation | null);
      } catch (error) {
        console.error('Error fetching confirmation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmation();
  }, [orderNumber]);

  const respondToConfirmation = async (
    confirmationId: string,
    status: 'approved' | 'change_requested',
    response?: string
  ) => {
    try {
      const { error } = await supabase
        .from('order_confirmations')
        .update({
          confirmation_status: status,
          customer_response: response || null,
          responded_at: new Date().toISOString(),
        })
        .eq('id', confirmationId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? 'Order approved!' : 'Change requested',
        description:
          status === 'approved'
            ? 'Your order will be dispatched soon.'
            : 'The butcher will review your request.',
      });

      // Refresh confirmation
      if (orderId) {
        const { data } = await supabase
          .from('order_confirmations')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setConfirmation(data as OrderConfirmation | null);
      }

      return true;
    } catch (error: any) {
      console.error('Error responding:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit response',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getPhotoUrl = (photoPath: string) => {
    const { data } = supabase.storage.from('order-photos').getPublicUrl(photoPath);
    return data.publicUrl;
  };

  return {
    confirmation,
    loading,
    respondToConfirmation,
    getPhotoUrl,
  };
}
