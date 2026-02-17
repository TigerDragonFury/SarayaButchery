import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Menu {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string | null;
  is_active: boolean;
  show_on_mobile: boolean;
  show_on_desktop: boolean;
  auto_sync: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuProduct {
  id: string;
  menu_id: string;
  product_id: string;
  sort_order: number;
  created_at: string;
}

export const useMenus = () => {
  return useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Menu[];
    },
  });
};

export const useMenuProducts = (menuId: string | null) => {
  return useQuery({
    queryKey: ['menu-products', menuId],
    queryFn: async () => {
      if (!menuId) return [];
      const { data, error } = await supabase
        .from('menu_products')
        .select('*')
        .eq('menu_id', menuId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as MenuProduct[];
    },
    enabled: !!menuId,
  });
};

export const useWebsiteMenuProducts = () => {
  return useQuery({
    queryKey: ['website-menu-products'],
    queryFn: async () => {
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .select('id')
        .eq('slug', 'website-menu')
        .eq('is_active', true)
        .maybeSingle();

      if (menuError) throw menuError;
      if (!menu) return null;

      const { data: menuProducts, error: mpError } = await supabase
        .from('menu_products')
        .select('product_id, sort_order')
        .eq('menu_id', menu.id)
        .order('sort_order', { ascending: true });

      if (mpError) throw mpError;
      return {
        menuId: menu.id,
        productIds: menuProducts.map(mp => mp.product_id),
        sortMap: Object.fromEntries(menuProducts.map(mp => [mp.product_id, mp.sort_order])),
      };
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (menu: { name_ar: string; name_en: string; slug?: string }) => {
      const { data, error } = await supabase.from('menus').insert(menu).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu created');
    },
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Menu> & { id: string }) => {
      const { error } = await supabase.from('menus').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['website-menu-products'] });
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menus').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu deleted');
    },
  });
};

// SECURE: Uses RPC function (SECURITY DEFINER) — bypasses RLS, enforces admin check server-side
export const useAttachProductsToMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuId, productIds }: { menuId: string; productIds: string[] }) => {
      console.log('[MenuAttach] Calling RPC attach_products_to_menu', { menuId, count: productIds.length });

      const { data, error } = await supabase.rpc('attach_products_to_menu', {
        p_menu_id: menuId,
        p_product_ids: productIds,
      });

      console.log('[MenuAttach] RPC response:', { data, error });

      if (error) {
        console.error('[MenuAttach] RPC error:', error.message, error.details, error.hint);
        throw new Error(error.message);
      }

      const result = data as { success: boolean; error?: string; inserted?: number; total_requested?: number };

      if (!result.success) {
        console.error('[MenuAttach] Server rejected:', result.error);
        throw new Error(result.error || 'Unknown server error');
      }

      console.log('[MenuAttach] SUCCESS:', result.inserted, 'rows inserted out of', result.total_requested);
      return result;
    },
    onSuccess: (result, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menu-products', menuId] });
      queryClient.invalidateQueries({ queryKey: ['website-menu-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`✅ ${result.inserted} products attached successfully`);
    },
    onError: (err: Error) => {
      toast.error(`❌ Attach failed: ${err.message}`);
    },
  });
};

// SECURE: Uses RPC function
export const useRemoveProductFromMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuId, productId }: { menuId: string; productId: string }) => {
      console.log('[MenuRemove] Calling RPC remove_product_from_menu', { menuId, productId });

      const { data, error } = await supabase.rpc('remove_product_from_menu', {
        p_menu_id: menuId,
        p_product_id: productId,
      });

      if (error) {
        console.error('[MenuRemove] RPC error:', error.message);
        throw new Error(error.message);
      }

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Unknown server error');
      }

      return result;
    },
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menu-products', menuId] });
      queryClient.invalidateQueries({ queryKey: ['website-menu-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product removed from menu');
    },
    onError: (err: Error) => {
      toast.error(`❌ Remove failed: ${err.message}`);
    },
  });
};

export const useReorderMenuProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuId, orderedProductIds }: { menuId: string; orderedProductIds: string[] }) => {
      const updates = orderedProductIds.map((productId, index) =>
        supabase
          .from('menu_products')
          .update({ sort_order: index })
          .eq('menu_id', menuId)
          .eq('product_id', productId)
      );
      await Promise.all(updates);
    },
    onSuccess: (_, { menuId }) => {
      queryClient.invalidateQueries({ queryKey: ['menu-products', menuId] });
      queryClient.invalidateQueries({ queryKey: ['website-menu-products'] });
    },
  });
};
