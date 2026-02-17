import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderMessage {
  id: string;
  order_id: string;
  product_id: string | null;
  sender_type: 'butcher' | 'customer';
  message_type: 'text' | 'voice';
  content: string | null;
  storage_path: string | null;
  duration_seconds: number;
  is_read: boolean;
  created_at: string;
}

interface UseOrderMessagesReturn {
  messages: OrderMessage[];
  loading: boolean;
  error: string | null;
  sendTextMessage: (params: {
    orderId: string;
    productId?: string;
    content: string;
    senderType: 'butcher' | 'customer';
  }) => Promise<boolean>;
  sendVoiceMessage: (params: {
    orderId: string;
    productId?: string;
    storagePath: string;
    durationSeconds: number;
    senderType: 'butcher' | 'customer';
  }) => Promise<boolean>;
  markAsRead: (messageId: string) => Promise<void>;
  fetchMessages: (orderId: string, productId?: string) => Promise<void>;
  unreadCount: number;
}

export const useOrderMessages = (
  orderId?: string,
  productId?: string,
  autoSubscribe: boolean = true
): UseOrderMessagesReturn => {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (fetchOrderId: string, fetchProductId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', fetchOrderId)
        .order('created_at', { ascending: true });

      if (fetchProductId) {
        query = query.or(`product_id.eq.${fetchProductId},product_id.is.null`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setMessages((data || []) as OrderMessage[]);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTextMessage = useCallback(async ({
    orderId: msgOrderId,
    productId: msgProductId,
    content,
    senderType,
  }: {
    orderId: string;
    productId?: string;
    content: string;
    senderType: 'butcher' | 'customer';
  }): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from('order_messages')
        .insert({
          order_id: msgOrderId,
          product_id: msgProductId || null,
          sender_type: senderType,
          message_type: 'text',
          content: content.trim(),
        });

      if (insertError) {
        console.error('Error sending text message:', insertError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending text message:', err);
      return false;
    }
  }, []);

  const sendVoiceMessage = useCallback(async ({
    orderId: msgOrderId,
    productId: msgProductId,
    storagePath,
    durationSeconds,
    senderType,
  }: {
    orderId: string;
    productId?: string;
    storagePath: string;
    durationSeconds: number;
    senderType: 'butcher' | 'customer';
  }): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from('order_messages')
        .insert({
          order_id: msgOrderId,
          product_id: msgProductId || null,
          sender_type: senderType,
          message_type: 'voice',
          storage_path: storagePath,
          duration_seconds: durationSeconds,
        });

      if (insertError) {
        console.error('Error sending voice message:', insertError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending voice message:', err);
      return false;
    }
  }, []);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (orderId) {
      fetchMessages(orderId, productId);
    }
  }, [orderId, productId, fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!orderId || !autoSubscribe) return;

    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMessage = payload.new as OrderMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as OrderMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, autoSubscribe]);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return {
    messages,
    loading,
    error,
    sendTextMessage,
    sendVoiceMessage,
    markAsRead,
    fetchMessages,
    unreadCount,
  };
};

export default useOrderMessages;
