import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroImageConfig {
  page: string;
  label_ar: string;
  label_en: string;
  image_url: string;
  /** secondary image for mobile (HomeHero only) */
  mobile_image_url?: string;
}

export const defaultHeroImages: HeroImageConfig[] = [
  {
    page: 'home',
    label_ar: 'الصفحة الرئيسية',
    label_en: 'Home Page',
    image_url: '/hero-background.jpg',
    mobile_image_url: '/hero-background-mobile.jpg',
  },
  {
    page: 'about',
    label_ar: 'من نحن',
    label_en: 'About Us',
    image_url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=1920&h=600&fit=crop',
  },
  {
    page: 'menu',
    label_ar: 'القائمة',
    label_en: 'Menu',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&h=600&fit=crop',
  },
  {
    page: 'restaurant',
    label_ar: 'المطعم',
    label_en: 'Restaurant',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=600&fit=crop',
  },
  {
    page: 'shop',
    label_ar: 'المتجر',
    label_en: 'Shop',
    image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=1920&h=600&fit=crop',
  },
  {
    page: 'blog',
    label_ar: 'المدونة',
    label_en: 'Blog',
    image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1920&h=600&fit=crop',
  },
  {
    page: 'catering',
    label_ar: 'التموين',
    label_en: 'Catering',
    image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1920&h=600&fit=crop',
  },
  {
    page: 'recipes',
    label_ar: 'الوصفات',
    label_en: 'Recipes',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=600&fit=crop',
  },
  {
    page: 'boxes',
    label_ar: 'البوكسات',
    label_en: 'Boxes',
    image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1920&h=600&fit=crop',
  },
  {
    page: 'track',
    label_ar: 'تتبع الطلب',
    label_en: 'Track Order',
    image_url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1920&h=600&fit=crop',
  },
];

export function useHeroImages() {
  const query = useQuery({
    queryKey: ['hero-images'],
    queryFn: async (): Promise<HeroImageConfig[]> => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'hero_images')
        .maybeSingle();

      if (error) {
        console.warn('[useHeroImages] Error:', error);
        return defaultHeroImages;
      }

      if (!data?.value) return defaultHeroImages;

      const saved = data.value as unknown as HeroImageConfig[];
      // Merge with defaults to ensure new pages are included
      return defaultHeroImages.map((def) => {
        const override = saved.find((s) => s.page === def.page);
        return override ? { ...def, ...override } : def;
      });
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const getHeroImage = (page: string): string => {
    const images = query.data || defaultHeroImages;
    return images.find((h) => h.page === page)?.image_url || '';
  };

  const getMobileHeroImage = (page: string): string | undefined => {
    const images = query.data || defaultHeroImages;
    return images.find((h) => h.page === page)?.mobile_image_url;
  };

  return {
    heroImages: query.data || defaultHeroImages,
    getHeroImage,
    getMobileHeroImage,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
