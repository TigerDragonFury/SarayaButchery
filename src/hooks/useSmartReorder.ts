import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCart, CartItem } from '@/contexts/CartContext';

export interface OrderPreference {
  id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  product_name_en: string | null;
  preferred_quantity: number;
  preferred_unit: 'kg' | 'piece' | 'box';
  preferred_notes: string | null;
  last_voice_note_path: string | null;
  last_voice_note_duration: number | null;
  order_count: number;
  last_ordered_at: string;
  created_at: string;
  updated_at: string;
}

export function useSmartReorder() {
  const [preferences, setPreferences] = useState<OrderPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { addItem } = useCart();

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setPreferences([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customer_order_preferences')
        .select('*')
        .eq('customer_id', userId)
        .order('order_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPreferences((data || []) as OrderPreference[]);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Save preference when customer orders a product
  const savePreference = async (
    item: CartItem,
    voiceNotePath?: string,
    voiceNoteDuration?: number
  ) => {
    if (!userId) return;

    try {
      // Check if preference exists
      const { data: existing } = await supabase
        .from('customer_order_preferences')
        .select('id, order_count')
        .eq('customer_id', userId)
        .eq('product_id', item.id)
        .maybeSingle();

      if (existing) {
        // Update existing preference
        await supabase
          .from('customer_order_preferences')
          .update({
            preferred_quantity: item.quantity,
            preferred_unit: (item.unit as 'kg' | 'piece' | 'box') || 'kg',
            preferred_notes: item.notes || null,
            last_voice_note_path: voiceNotePath || null,
            last_voice_note_duration: voiceNoteDuration || null,
            last_ordered_at: new Date().toISOString(),
            order_count: (existing.order_count || 0) + 1,
          })
          .eq('id', existing.id);
      } else {
        // Insert new preference
        await supabase
          .from('customer_order_preferences')
          .insert({
            customer_id: userId,
            product_id: item.id,
            product_name: item.name,
            product_name_en: item.nameEn || null,
            preferred_quantity: item.quantity,
            preferred_unit: (item.unit as 'kg' | 'piece' | 'box') || 'kg',
            preferred_notes: item.notes || null,
            last_voice_note_path: voiceNotePath || null,
            last_voice_note_duration: voiceNoteDuration || null,
            order_count: 1,
          });
      }
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

  // Reorder a product with saved preferences
  const reorderProduct = async (preference: OrderPreference, productImage?: string) => {
    const item: Omit<CartItem, 'quantity'> = {
      id: preference.product_id,
      name: preference.product_name,
      nameEn: preference.product_name_en || undefined,
      price: 0, // Will be updated when product is found
      image: productImage || '/placeholder.svg',
      unit: preference.preferred_unit,
      notes: preference.preferred_notes || undefined,
    };

    addItem(item, preference.preferred_quantity, preference.preferred_notes || undefined);

    toast({
      title: 'Added to cart',
      description: `${preference.product_name} (${preference.preferred_quantity} ${preference.preferred_unit})`,
    });
  };

  // Get voice note URL for a preference
  const getVoiceNoteUrl = async (storagePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('voice-notes')
        .createSignedUrl(storagePath, 3600);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting voice note URL:', error);
      return null;
    }
  };

  // Delete a preference
  const deletePreference = async (preferenceId: string) => {
    try {
      const { error } = await supabase
        .from('customer_order_preferences')
        .delete()
        .eq('id', preferenceId);

      if (error) throw error;

      setPreferences((prev) => prev.filter((p) => p.id !== preferenceId));
      toast({
        title: 'Preference removed',
        description: 'Product removed from your favorites',
      });
    } catch (error: any) {
      console.error('Error deleting preference:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove preference',
        variant: 'destructive',
      });
    }
  };

  return {
    preferences,
    loading,
    isAuthenticated: !!userId,
    savePreference,
    reorderProduct,
    getVoiceNoteUrl,
    deletePreference,
    refreshPreferences: fetchPreferences,
  };
}
