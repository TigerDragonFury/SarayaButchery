import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Palette, Type, Square, Sun, Moon, RotateCcw, Save, Eye, Sparkles, Flame } from 'lucide-react';
import { DEFAULT_THEME, type DesignTheme, type ProductCardConfig, DEFAULT_PRODUCT_CARD } from '@/hooks/useDesignSettings';
import { DEFAULT_EFFECTS, type BackgroundEffectsConfig } from '@/components/shared/BackgroundEffects';

const FONT_OPTIONS = [
  'Tajawal', 'Cairo', 'Almarai', 'Noto Sans Arabic', 'IBM Plex Sans Arabic',
  'Inter', 'Poppins', 'Playfair Display', 'Merriweather', 'Lora'
];

const SEASONAL_PRESETS = [
  {
    id: 'normal',
    nameAr: 'الثيم الأساسي',
    nameEn: 'Brand Default',
    theme: null, // null means use CSS defaults
  },
  {
    id: 'ramadan',
    nameAr: 'ثيم رمضان',
    nameEn: 'Ramadan Theme',
    theme: {
      primary: '45 90% 40%',
      secondary: '30 80% 30%',
      accent: '45 90% 40%',
      accent_dark: '45 85% 50%',
    },
    description_ar: 'يطبق فقط على البنرات والأقسام الموسمية - لا يغير ألوان الموقع الأساسية',
    description_en: 'Applies only to banners and seasonal sections — does not change core site colors',
  },
  {
    id: 'eid',
    nameAr: 'ثيم العيد',
    nameEn: 'Eid Theme',
    theme: {
      primary: '120 40% 35%',
      secondary: '140 35% 25%',
      accent: '45 80% 45%',
      accent_dark: '45 75% 55%',
    },
    description_ar: 'يطبق فقط على البنرات والأقسام الموسمية',
    description_en: 'Applies only to banners and seasonal sections',
  },
];

function hslToHex(hsl: string): string {
  const parts = hsl.split(' ').map(s => parseFloat(s));
  if (parts.length < 3) return '#7A0F0F';
  const h = parts[0], s = parts[1] / 100, l = parts[2] / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hsl: string) => void;
}

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <div className="flex items-center gap-3">
    <input
      type="color"
      value={hslToHex(value)}
      onChange={(e) => onChange(hexToHSL(e.target.value))}
      className="w-10 h-10 rounded-lg border border-border cursor-pointer"
    />
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{value}</p>
    </div>
  </div>
);

const AdminDesignSystemPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();

  const [theme, setTheme] = useState<DesignTheme>({ ...DEFAULT_THEME });
  const [productCard, setProductCard] = useState<ProductCardConfig>({ ...DEFAULT_PRODUCT_CARD });
  const [seasonalMode, setSeasonalMode] = useState<string>('normal');
  const [seasonalEnabled, setSeasonalEnabled] = useState(false);
  const [bgEffects, setBgEffects] = useState<BackgroundEffectsConfig>({ ...DEFAULT_EFFECTS });
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // Load current settings
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', ['design_theme', 'design_product_card', 'active_seasonal_theme', 'seasonal_mode_enabled', 'background_effects']);

      data?.forEach((row: { key: string; value: any }) => {
        if (row.key === 'design_theme') setTheme({ ...DEFAULT_THEME, ...row.value });
        if (row.key === 'design_product_card') setProductCard({ ...DEFAULT_PRODUCT_CARD, ...row.value });
        if (row.key === 'active_seasonal_theme') setSeasonalMode(row.value?.id || 'normal');
        if (row.key === 'seasonal_mode_enabled') setSeasonalEnabled(!!row.value?.enabled);
        if (row.key === 'background_effects') setBgEffects({ ...DEFAULT_EFFECTS, ...row.value });
      });
    };
    load();
  }, []);

  const updateField = (field: keyof DesignTheme, value: string) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save theme
      await supabase.from('store_settings').upsert(
        { key: 'design_theme', value: theme as any, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

      // Save product card config
      await supabase.from('store_settings').upsert(
        { key: 'design_product_card', value: productCard as any, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

      // Save seasonal settings
      await supabase.from('store_settings').upsert(
        { key: 'seasonal_mode_enabled', value: { enabled: seasonalEnabled } as any, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

      // Save background effects
      await supabase.from('store_settings').upsert(
        { key: 'background_effects', value: bgEffects as any, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

      if (seasonalMode !== 'normal') {
        await supabase.from('store_settings').upsert(
          { key: 'active_seasonal_theme', value: { id: seasonalMode } as any, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      } else {
        await supabase.from('store_settings').delete().eq('key', 'active_seasonal_theme');
      }

      queryClient.invalidateQueries({ queryKey: ['design-settings'] });
      toast.success(isRTL ? 'تم حفظ التصميم بنجاح' : 'Design saved successfully');
    } catch (err) {
      toast.error(isRTL ? 'خطأ في الحفظ' : 'Save error');
    }
    setSaving(false);
  };

  const handleReset = async () => {
    // Delete custom theme from DB to restore CSS defaults
    await supabase.from('store_settings').delete().eq('key', 'design_theme');
    await supabase.from('store_settings').delete().eq('key', 'design_product_card');
    await supabase.from('store_settings').delete().eq('key', 'active_seasonal_theme');
    await supabase.from('store_settings').delete().eq('key', 'seasonal_mode_enabled');
    await supabase.from('store_settings').delete().eq('key', 'background_effects');
    setTheme({ ...DEFAULT_THEME });
    setProductCard({ ...DEFAULT_PRODUCT_CARD });
    setSeasonalMode('normal');
    setSeasonalEnabled(false);
    setBgEffects({ ...DEFAULT_EFFECTS });
    queryClient.invalidateQueries({ queryKey: ['design-settings'] });
    toast.success(isRTL ? 'تمت استعادة الألوان الأصلية' : 'Brand colors restored');
  };

  const handlePreview = () => {
    setPreviewing(!previewing);
    if (!previewing) {
      // Temporarily apply to DOM
      const root = document.documentElement;
      root.style.setProperty('--primary', theme.primary);
      root.style.setProperty('--secondary', theme.secondary);
      root.style.setProperty('--accent', theme.accent);
      root.style.setProperty('--radius', theme.border_radius);
      toast.info(isRTL ? 'وضع المعاينة - التغييرات مؤقتة' : 'Preview mode — changes are temporary');
    } else {
      // Remove preview
      const root = document.documentElement;
      ['--primary','--secondary','--accent','--radius'].forEach(p => root.style.removeProperty(p));
      queryClient.invalidateQueries({ queryKey: ['design-settings'] });
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            {isRTL ? 'نظام التصميم' : 'Design System'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL ? 'تحكم كامل في شكل الموقع من مكان واحد' : 'Full control over site appearance from one place'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} size="sm">
            <RotateCcw className="w-4 h-4 me-1" />
            {isRTL ? 'استعادة الأصلي' : 'Reset to Default'}
          </Button>
          <Button variant="outline" onClick={handlePreview} size="sm">
            <Eye className="w-4 h-4 me-1" />
            {previewing ? (isRTL ? 'إيقاف المعاينة' : 'Stop Preview') : (isRTL ? 'معاينة' : 'Preview')}
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="w-4 h-4 me-1" />
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="colors" className="gap-1"><Palette className="w-3 h-3" /> {isRTL ? 'الألوان' : 'Colors'}</TabsTrigger>
          <TabsTrigger value="typography" className="gap-1"><Type className="w-3 h-3" /> {isRTL ? 'الخطوط' : 'Fonts'}</TabsTrigger>
          <TabsTrigger value="components" className="gap-1"><Square className="w-3 h-3" /> {isRTL ? 'العناصر' : 'Components'}</TabsTrigger>
          <TabsTrigger value="effects" className="gap-1"><Flame className="w-3 h-3" /> {isRTL ? 'المؤثرات' : 'Effects'}</TabsTrigger>
          <TabsTrigger value="seasonal" className="gap-1"><Sparkles className="w-3 h-3" /> {isRTL ? 'المواسم' : 'Seasonal'}</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{isRTL ? 'الألوان الأساسية' : 'Brand Colors'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker label={isRTL ? 'اللون الأساسي (Primary)' : 'Primary Color'} value={theme.primary} onChange={(v) => updateField('primary', v)} />
                <ColorPicker label={isRTL ? 'اللون الثانوي (Secondary)' : 'Secondary Color'} value={theme.secondary} onChange={(v) => updateField('secondary', v)} />
                <ColorPicker label={isRTL ? 'لون التمييز (Accent)' : 'Accent Color'} value={theme.accent} onChange={(v) => updateField('accent', v)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{isRTL ? 'الخلفيات' : 'Backgrounds'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker label={isRTL ? 'خلفية فاتحة' : 'Light Background'} value={theme.background} onChange={(v) => updateField('background', v)} />
                <ColorPicker label={isRTL ? 'خلفية داكنة' : 'Dark Background'} value={theme.background_dark} onChange={(v) => updateField('background_dark', v)} />
                <ColorPicker label={isRTL ? 'الكروت (فاتح)' : 'Card (Light)'} value={theme.card} onChange={(v) => updateField('card', v)} />
                <ColorPicker label={isRTL ? 'الكروت (داكن)' : 'Card (Dark)'} value={theme.card_dark} onChange={(v) => updateField('card_dark', v)} />
              </CardContent>
            </Card>
            {/* Preview Swatch */}
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">{isRTL ? 'معاينة سريعة' : 'Quick Preview'}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: 'Primary', hsl: theme.primary },
                    { label: 'Secondary', hsl: theme.secondary },
                    { label: 'Accent', hsl: theme.accent },
                    { label: 'BG Light', hsl: theme.background },
                    { label: 'BG Dark', hsl: theme.background_dark },
                  ].map(c => (
                    <div key={c.label} className="text-center">
                      <div className="w-16 h-16 rounded-lg border" style={{ backgroundColor: `hsl(${c.hsl})` }} />
                      <span className="text-xs mt-1 block">{c.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <Card>
            <CardHeader><CardTitle className="text-base">{isRTL ? 'الخطوط' : 'Typography'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{isRTL ? 'خط النصوص الأساسي' : 'Body Font'}</Label>
                <Select value={theme.font_body} onValueChange={(v) => updateField('font_body', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isRTL ? 'خط العناوين' : 'Display Font'}</Label>
                <Select value={theme.font_display} onValueChange={(v) => updateField('font_display', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-lg border bg-card mt-4">
                <p className="text-lg font-bold" style={{ fontFamily: `'${theme.font_display}', serif` }}>
                  {isRTL ? 'معاينة خط العنوان' : 'Display Font Preview'}
                </p>
                <p className="mt-2" style={{ fontFamily: `'${theme.font_body}', sans-serif` }}>
                  {isRTL ? 'هذا نص تجريبي لمعاينة خط النصوص الأساسي' : 'This is a sample text to preview the body font'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{isRTL ? 'شكل الأزرار' : 'Button Style'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{isRTL ? 'زوايا الأزرار' : 'Button Radius'}</Label>
                  <Select value={theme.button_radius} onValueChange={(v) => updateField('button_radius', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0rem">{isRTL ? 'مربع' : 'Square'}</SelectItem>
                      <SelectItem value="0.25rem">{isRTL ? 'قليل الاستدارة' : 'Slightly Rounded'}</SelectItem>
                      <SelectItem value="0.5rem">{isRTL ? 'مستدير' : 'Rounded'}</SelectItem>
                      <SelectItem value="1rem">{isRTL ? 'مستدير جداً' : 'Very Rounded'}</SelectItem>
                      <SelectItem value="9999px">{isRTL ? 'دائري' : 'Pill'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? 'قوة الظل' : 'Shadow Strength'}</Label>
                  <Select value={theme.shadow_strength} onValueChange={(v) => updateField('shadow_strength', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isRTL ? 'بدون' : 'None'}</SelectItem>
                      <SelectItem value="light">{isRTL ? 'خفيف' : 'Light'}</SelectItem>
                      <SelectItem value="medium">{isRTL ? 'متوسط' : 'Medium'}</SelectItem>
                      <SelectItem value="strong">{isRTL ? 'قوي' : 'Strong'}</SelectItem>
                      <SelectItem value="dramatic">{isRTL ? 'دراماتيكي' : 'Dramatic'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? 'حجم الهيدر' : 'Header Height'}</Label>
                  <Select value={theme.header_height} onValueChange={(v) => updateField('header_height', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="48px">{isRTL ? 'صغير' : 'Compact'}</SelectItem>
                      <SelectItem value="64px">{isRTL ? 'متوسط' : 'Normal'}</SelectItem>
                      <SelectItem value="80px">{isRTL ? 'كبير' : 'Large'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Button Preview */}
                <div className="flex gap-2 pt-3">
                  <button className="px-4 py-2 text-sm font-medium text-white" style={{ 
                    backgroundColor: `hsl(${theme.primary})`, 
                    borderRadius: theme.button_radius 
                  }}>
                    {isRTL ? 'زر أساسي' : 'Primary Button'}
                  </button>
                  <button className="px-4 py-2 text-sm font-medium border" style={{ 
                    borderColor: `hsl(${theme.primary})`,
                    color: `hsl(${theme.primary})`,
                    borderRadius: theme.button_radius 
                  }}>
                    {isRTL ? 'زر ثانوي' : 'Outline Button'}
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{isRTL ? 'كارت المنتج' : 'Product Card'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{isRTL ? 'التخطيط' : 'Layout'}</Label>
                  <Select value={productCard.layout} onValueChange={(v) => setProductCard(p => ({ ...p, layout: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? 'شكل الكارت' : 'Card Shape'}</Label>
                  <Select value={productCard.card_shape} onValueChange={(v) => setProductCard(p => ({ ...p, card_shape: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">{isRTL ? 'مربع' : 'Square'}</SelectItem>
                      <SelectItem value="rectangle">{isRTL ? 'مستطيل' : 'Rectangle'}</SelectItem>
                      <SelectItem value="rounded">{isRTL ? 'مستدير' : 'Rounded'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 pt-2">
                  {([
                    ['show_discount', isRTL ? 'إظهار نسبة الخصم' : 'Show Discount'],
                    ['show_whatsapp', isRTL ? 'إظهار زر واتساب' : 'Show WhatsApp'],
                    ['show_add_to_cart', isRTL ? 'إظهار أضف للسلة' : 'Show Add to Cart'],
                    ['show_old_price', isRTL ? 'إظهار السعر القديم' : 'Show Old Price'],
                  ] as const).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm">{label}</Label>
                      <Switch
                        checked={productCard[key]}
                        onCheckedChange={(v) => setProductCard(p => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{isRTL ? 'مؤثرات الخلفية' : 'Background Effects'}</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'أضف تأثيرات بصرية متحركة على خلفية الموقع' : 'Add animated visual effects to the site background'}
                </p>

                {/* Stars */}
                <div className="space-y-3 p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{isRTL ? '✨ النجوم المتلألئة' : '✨ Twinkling Stars'}</Label>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'نقاط مضيئة تومض بهدوء' : 'Softly blinking light points'}</p>
                    </div>
                    <Switch checked={bgEffects.stars_enabled} onCheckedChange={(v) => setBgEffects(p => ({ ...p, stars_enabled: v }))} />
                  </div>
                  {bgEffects.stars_enabled && (
                    <div className="flex items-center gap-3">
                      <Label className="text-xs w-16">{isRTL ? 'العدد' : 'Count'}</Label>
                      <Input type="number" min={10} max={200} value={bgEffects.stars_count} onChange={(e) => setBgEffects(p => ({ ...p, stars_count: parseInt(e.target.value) || 60 }))} className="w-24 h-8" />
                      <ColorPicker label={isRTL ? 'اللون' : 'Color'} value={bgEffects.stars_color} onChange={(v) => setBgEffects(p => ({ ...p, stars_color: v }))} />
                    </div>
                  )}
                </div>

                {/* Particles */}
                <div className="space-y-3 p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{isRTL ? '🔴 الجزيئات العائمة' : '🔴 Floating Particles'}</Label>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'دوائر صغيرة تتحرك ببطء' : 'Small circles drifting slowly'}</p>
                    </div>
                    <Switch checked={bgEffects.particles_enabled} onCheckedChange={(v) => setBgEffects(p => ({ ...p, particles_enabled: v }))} />
                  </div>
                  {bgEffects.particles_enabled && (
                    <div className="flex items-center gap-3">
                      <Label className="text-xs w-16">{isRTL ? 'العدد' : 'Count'}</Label>
                      <Input type="number" min={5} max={100} value={bgEffects.particles_count} onChange={(e) => setBgEffects(p => ({ ...p, particles_count: parseInt(e.target.value) || 30 }))} className="w-24 h-8" />
                      <ColorPicker label={isRTL ? 'اللون' : 'Color'} value={bgEffects.particles_color} onChange={(v) => setBgEffects(p => ({ ...p, particles_color: v }))} />
                    </div>
                  )}
                </div>

                {/* Embers */}
                <div className="space-y-3 p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{isRTL ? '🔥 الجمرات الصاعدة' : '🔥 Rising Embers'}</Label>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'شرارات ذهبية ترتفع من الأسفل' : 'Golden sparks rising from below'}</p>
                    </div>
                    <Switch checked={bgEffects.embers_enabled} onCheckedChange={(v) => setBgEffects(p => ({ ...p, embers_enabled: v }))} />
                  </div>
                  {bgEffects.embers_enabled && (
                    <div className="flex items-center gap-3">
                      <Label className="text-xs w-16">{isRTL ? 'العدد' : 'Count'}</Label>
                      <Input type="number" min={5} max={80} value={bgEffects.embers_count} onChange={(e) => setBgEffects(p => ({ ...p, embers_count: parseInt(e.target.value) || 20 }))} className="w-24 h-8" />
                      <ColorPicker label={isRTL ? 'اللون' : 'Color'} value={bgEffects.embers_color} onChange={(v) => setBgEffects(p => ({ ...p, embers_color: v }))} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader><CardTitle className="text-base">{isRTL ? 'معاينة المؤثرات' : 'Effects Preview'}</CardTitle></CardHeader>
              <CardContent>
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border" style={{ backgroundColor: `hsl(${theme.background_dark})` }}>
                  {(bgEffects.stars_enabled || bgEffects.particles_enabled || bgEffects.embers_enabled) ? (
                    <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                      {isRTL ? 'احفظ التغييرات لرؤية المؤثرات على الموقع' : 'Save changes to see effects on site'}
                    </p>
                  ) : (
                    <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                      {isRTL ? 'فعّل مؤثراً واحداً على الأقل' : 'Enable at least one effect'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seasonal Tab */}
        <TabsContent value="seasonal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{isRTL ? 'الأوضاع الموسمية' : 'Seasonal Themes'}</span>
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-normal">{isRTL ? 'تفعيل الوضع الموسمي' : 'Enable Seasonal Mode'}</Label>
                  <Switch checked={seasonalEnabled} onCheckedChange={setSeasonalEnabled} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {isRTL 
                  ? '⚠️ الثيم الموسمي يؤثر فقط على البنرات والأقسام الموسمية — لا يغير ألوان الموقع الأساسية'
                  : '⚠️ Seasonal theme only affects banners and seasonal sections — does not change core brand colors'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SEASONAL_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setSeasonalMode(preset.id)}
                    disabled={!seasonalEnabled && preset.id !== 'normal'}
                    className={`p-4 rounded-lg border-2 transition-all text-start ${
                      seasonalMode === preset.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-muted-foreground'
                    } ${!seasonalEnabled && preset.id !== 'normal' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-bold text-sm">{isRTL ? preset.nameAr : preset.nameEn}</div>
                    {preset.theme && (
                      <div className="flex gap-1 mt-2">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(${preset.theme.primary})` }} />
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(${preset.theme.secondary})` }} />
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(${preset.theme.accent})` }} />
                      </div>
                    )}
                    {'description_ar' in preset && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {isRTL ? preset.description_ar : preset.description_en}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDesignSystemPage;
