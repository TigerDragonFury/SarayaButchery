import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DesignTheme {
  primary: string;
  secondary: string;
  background: string;
  background_dark: string;
  foreground: string;
  foreground_dark: string;
  accent: string;
  accent_dark: string;
  card: string;
  card_dark: string;
  muted: string;
  muted_dark: string;
  border_radius: string;
  shadow_strength: 'none' | 'light' | 'medium' | 'strong' | 'dramatic';
  font_body: string;
  font_display: string;
  button_radius: string;
  header_height: string;
}

export interface SectionConfig {
  id: string;
  visible: boolean;
  order: number;
  layout?: 'grid' | 'list' | 'cards' | 'compact';
  columns_desktop?: number;
  columns_tablet?: number;
  columns_mobile?: number;
}

export interface ProductCardConfig {
  layout: 'grid' | 'list' | 'compact';
  card_shape: 'square' | 'rectangle' | 'rounded';
  columns_desktop: number;
  columns_tablet: number;
  columns_mobile: number;
  show_discount: boolean;
  show_whatsapp: boolean;
  show_add_to_cart: boolean;
  show_old_price: boolean;
  image_size: 'small' | 'medium' | 'large';
}

export interface SeasonalThemePreset {
  id: string;
  name_ar: string;
  name_en: string;
  theme: Partial<DesignTheme>;
  banner_gradient_from: string;
  banner_gradient_to: string;
  overlay_emoji?: string;
}

export interface DesignSettings {
  theme: DesignTheme;
  sections: SectionConfig[];
  product_card: ProductCardConfig;
  active_seasonal_theme: string | null;
}

const DEFAULT_THEME: DesignTheme = {
  primary: '7 100% 27%',
  secondary: '0 100% 27%',
  background: '41 30% 90%',
  background_dark: '0 40% 17%',
  foreground: '0 60% 18%',
  foreground_dark: '41 30% 92%',
  accent: '7 100% 27%',
  accent_dark: '20 80% 45%',
  card: '41 35% 94%',
  card_dark: '0 45% 14%',
  muted: '41 20% 85%',
  muted_dark: '0 30% 20%',
  border_radius: '0.5rem',
  shadow_strength: 'medium',
  font_body: 'Tajawal',
  font_display: 'Playfair Display',
  button_radius: '0.5rem',
  header_height: '64px',
};

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero', visible: true, order: 0 },
  { id: 'categories', visible: true, order: 1 },
  { id: 'best-sellers', visible: true, order: 2 },
  { id: 'boxes', visible: true, order: 3 },
  { id: 'how-to-order', visible: true, order: 4 },
  { id: 'special-offers', visible: true, order: 5 },
  { id: 'delivery-payment', visible: true, order: 6 },
  { id: 'testimonials', visible: true, order: 7 },
  { id: 'about-preview', visible: true, order: 8 },
  { id: 'catering-preview', visible: true, order: 9 },
  { id: 'menu-preview', visible: true, order: 10 },
  { id: 'recipes-preview', visible: true, order: 11 },
  { id: 'trust-stats', visible: true, order: 12 },
  { id: 'seo-content', visible: true, order: 13 },
  { id: 'final-cta', visible: true, order: 14 },
];

const DEFAULT_PRODUCT_CARD: ProductCardConfig = {
  layout: 'grid',
  card_shape: 'square',
  columns_desktop: 4,
  columns_tablet: 3,
  columns_mobile: 2,
  show_discount: true,
  show_whatsapp: true,
  show_add_to_cart: true,
  show_old_price: true,
  image_size: 'medium',
};

const DEFAULT_DESIGN: DesignSettings = {
  theme: DEFAULT_THEME,
  sections: DEFAULT_SECTIONS,
  product_card: DEFAULT_PRODUCT_CARD,
  active_seasonal_theme: null,
};

const SHADOW_MAP: Record<string, string> = {
  none: '0 0 0 transparent',
  light: '0 1px 3px rgba(0,0,0,0.08)',
  medium: '0 4px 12px rgba(0,0,0,0.1)',
  strong: '0 8px 25px rgba(0,0,0,0.15)',
  dramatic: '0 15px 40px rgba(0,0,0,0.25)',
};

function applyThemeToDOM(theme: DesignTheme, hasCustomTheme: boolean) {
  // Only apply DOM overrides if there's a custom theme stored in DB
  // Otherwise, let CSS in index.css define the brand colors
  if (!hasCustomTheme) {
    // Clean up any previously applied inline styles
    const root = document.documentElement;
    const props = ['--primary', '--secondary', '--accent', '--radius', '--shadow-card', 
      '--font-body', '--font-display', '--button-radius', '--background', '--foreground', 
      '--card', '--muted'];
    props.forEach(p => root.style.removeProperty(p));
    document.body.style.removeProperty('font-family');
    const darkStyle = document.getElementById('dynamic-dark-theme');
    if (darkStyle) darkStyle.remove();
    return;
  }

  const root = document.documentElement;

  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--radius', theme.border_radius);
  root.style.setProperty('--shadow-card', SHADOW_MAP[theme.shadow_strength] || SHADOW_MAP.medium);
  root.style.setProperty('--font-body', theme.font_body);
  root.style.setProperty('--font-display', theme.font_display);
  document.body.style.fontFamily = `'${theme.font_body}', sans-serif`;
  root.style.setProperty('--button-radius', theme.button_radius);
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--foreground', theme.foreground);
  root.style.setProperty('--card', theme.card);
  root.style.setProperty('--muted', theme.muted);

  let darkStyle = document.getElementById('dynamic-dark-theme');
  if (!darkStyle) {
    darkStyle = document.createElement('style');
    darkStyle.id = 'dynamic-dark-theme';
    document.head.appendChild(darkStyle);
  }
  darkStyle.textContent = `
    .dark {
      --primary: ${theme.primary};
      --secondary: ${theme.secondary || theme.primary};
      --accent: ${theme.accent_dark || theme.accent};
      --background: ${theme.background_dark};
      --foreground: ${theme.foreground_dark};
      --card: ${theme.card_dark};
      --muted: ${theme.muted_dark};
    }
  `;
}

export function useDesignSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['design-settings'],
    queryFn: async (): Promise<DesignSettings & { _hasCustomTheme: boolean }> => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', ['design_theme', 'design_sections', 'design_product_card', 'active_seasonal_theme']);

      if (error) {
        console.warn('[useDesignSettings] Error:', error);
        return { ...DEFAULT_DESIGN, _hasCustomTheme: false };
      }

      let hasCustomTheme = false;
      const settings: Partial<DesignSettings> = {};
      data?.forEach((row: { key: string; value: unknown }) => {
        switch (row.key) {
          case 'design_theme':
            settings.theme = { ...DEFAULT_THEME, ...(row.value as Partial<DesignTheme>) };
            hasCustomTheme = true;
            break;
          case 'design_sections':
            settings.sections = row.value as SectionConfig[];
            break;
          case 'design_product_card':
            settings.product_card = { ...DEFAULT_PRODUCT_CARD, ...(row.value as Partial<ProductCardConfig>) };
            break;
          case 'active_seasonal_theme':
            settings.active_seasonal_theme = (row.value as any)?.id || null;
            break;
        }
      });

      return {
        theme: settings.theme || DEFAULT_THEME,
        sections: settings.sections || DEFAULT_SECTIONS,
        product_card: settings.product_card || DEFAULT_PRODUCT_CARD,
        active_seasonal_theme: settings.active_seasonal_theme || null,
        _hasCustomTheme: hasCustomTheme,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const designSettings = query.data || { ...DEFAULT_DESIGN, _hasCustomTheme: false };
  const hasCustomTheme = designSettings._hasCustomTheme;

  // Apply theme to DOM only when custom theme exists in DB
  useEffect(() => {
    applyThemeToDOM(designSettings.theme, hasCustomTheme);
  }, [designSettings.theme, hasCustomTheme]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('design-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_settings',
          filter: 'key=in.(design_theme,design_sections,design_product_card,active_seasonal_theme)',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['design-settings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    design: designSettings,
    theme: designSettings.theme,
    sections: designSettings.sections,
    productCard: designSettings.product_card,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// Export defaults for use in edge function
export { DEFAULT_THEME, DEFAULT_SECTIONS, DEFAULT_PRODUCT_CARD, DEFAULT_DESIGN };
