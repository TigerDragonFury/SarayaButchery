import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseProduct {
  id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  price_per: string | null;
  category: string | null;
  image_url: string | null;
  is_active: boolean | null;
  is_box: boolean | null;
  sort_order: number | null;
  iiko_id: string | null;
  allow_add_to_cart: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// Transform database product to frontend format
export const transformProduct = (product: DatabaseProduct) => {
  const compareAtPrice = (product as any).compare_at_price as number | null;
  const discountPercent = compareAtPrice && compareAtPrice > product.price
    ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100)
    : 0;

  return {
    id: product.id,
    name: product.name_ar,
    nameEn: product.name_en || product.name_ar,
    description: product.description_ar || '',
    price: product.price,
    compareAtPrice: compareAtPrice && compareAtPrice > product.price ? compareAtPrice : undefined,
    discountPercent,
    unit: product.price_per || 'kg',
    image: product.image_url || '/placeholder.svg',
    category: product.category || 'other',
    isNew: false,
    isOnSale: discountPercent > 0,
    isBox: product.is_box || false,
    allowAddToCart: product.allow_add_to_cart ?? true,
  };
};

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      // Check if website-menu exists and has products
      const { data: menu } = await supabase
        .from('menus')
        .select('id')
        .eq('slug', 'website-menu')
        .eq('is_active', true)
        .maybeSingle();

      let productIds: string[] | null = null;
      let sortMap: Record<string, number> = {};

      if (menu) {
        const { data: menuProducts } = await supabase
          .from('menu_products')
          .select('product_id, sort_order')
          .eq('menu_id', menu.id)
          .order('sort_order', { ascending: true });

        if (menuProducts && menuProducts.length > 0) {
          productIds = menuProducts.map(mp => mp.product_id);
          sortMap = Object.fromEntries(menuProducts.map(mp => [mp.product_id, mp.sort_order]));
        }
      }

      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (productIds) {
        query = query.in('id', productIds);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      const transformed = (data || []).map(transformProduct);

      // Sort by menu order if available, otherwise by sort_order/name
      if (productIds && Object.keys(sortMap).length > 0) {
        transformed.sort((a, b) => (sortMap[a.id] ?? 9999) - (sortMap[b.id] ?? 9999));
      } else {
        transformed.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      }

      return transformed;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      // Get unique categories with count
      const categoryCount: Record<string, number> = {};
      data?.forEach(p => {
        if (p.category) {
          categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        }
      });

      return Object.entries(categoryCount).map(([id, count]) => ({
        id,
        count,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useBoxProducts = () => {
  return useQuery({
    queryKey: ['box-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_box', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching box products:', error);
        throw error;
      }

      return (data || []).map(transformProduct);
    },
    staleTime: 1000 * 60 * 5,
  });
};
