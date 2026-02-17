import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Save, Loader2, Trash2, GripVertical, ShoppingBag } from 'lucide-react';

interface ProductCategory {
  id: string;
  name_ar: string;
  name_en: string;
  href: string;
  sort_order: number;
  is_active: boolean;
}

const OurProductsManager = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState({ name_ar: '', name_en: '', href: '' });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['our-products-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'our_products_categories')
        .single();
      
      if (error) throw error;
      return (data?.value as unknown as ProductCategory[]) || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updatedCategories: ProductCategory[]) => {
      const { error } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(updatedCategories)), updated_at: new Date().toISOString() })
        .eq('key', 'our_products_categories');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['our-products-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully');
    },
    onError: () => {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    },
  });

  const handleAdd = () => {
    if (!newCategory.name_ar || !newCategory.name_en) return;
    const id = newCategory.name_en.toLowerCase().replace(/\s+/g, '-');
    const href = newCategory.href || `/shop/${id}`;
    const updated = [
      ...(categories || []),
      { id, name_ar: newCategory.name_ar, name_en: newCategory.name_en, href, sort_order: (categories?.length || 0) + 1, is_active: true },
    ];
    saveMutation.mutate(updated);
    setNewCategory({ name_ar: '', name_en: '', href: '' });
  };

  const handleRemove = (id: string) => {
    const updated = (categories || []).filter((c) => c.id !== id);
    saveMutation.mutate(updated);
  };

  const handleToggle = (id: string, active: boolean) => {
    const updated = (categories || []).map((c) => c.id === id ? { ...c, is_active: active } : c);
    saveMutation.mutate(updated);
  };

  const handleUpdateField = (id: string, field: keyof ProductCategory, value: string) => {
    const updated = (categories || []).map((c) => c.id === id ? { ...c, [field]: value } : c);
    saveMutation.mutate(updated);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          {isRTL ? 'إدارة قائمة منتجاتنا' : 'Our Products Menu Manager'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'أضف أو عدل أو احذف الأقسام الفرعية لقائمة "منتجاتنا" في الهيدر' : 'Add, edit or remove subcategories for the "Our Products" dropdown in the header'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Categories */}
        <div className="space-y-3">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={cat.name_ar}
                  onChange={(e) => handleUpdateField(cat.id, 'name_ar', e.target.value)}
                  placeholder="الاسم بالعربي"
                  dir="rtl"
                  className="h-8 text-sm"
                />
                <Input
                  value={cat.name_en}
                  onChange={(e) => handleUpdateField(cat.id, 'name_en', e.target.value)}
                  placeholder="Name in English"
                  className="h-8 text-sm"
                />
                <Input
                  value={cat.href}
                  onChange={(e) => handleUpdateField(cat.id, 'href', e.target.value)}
                  placeholder="/shop/category"
                  dir="ltr"
                  className="h-8 text-sm"
                />
              </div>
              <Switch
                checked={cat.is_active}
                onCheckedChange={(checked) => handleToggle(cat.id, checked)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleRemove(cat.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Category */}
        <div className="border-t border-border pt-4">
          <Label className="text-sm font-medium mb-2 block">
            {isRTL ? 'إضافة قسم جديد' : 'Add New Subcategory'}
          </Label>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                value={newCategory.name_ar}
                onChange={(e) => setNewCategory({ ...newCategory, name_ar: e.target.value })}
                placeholder={isRTL ? "الاسم بالعربي" : "Arabic Name"}
                dir="rtl"
                className="h-9"
              />
            </div>
            <div className="flex-1">
              <Input
                value={newCategory.name_en}
                onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value })}
                placeholder="English Name"
                className="h-9"
              />
            </div>
            <div className="flex-1">
              <Input
                value={newCategory.href}
                onChange={(e) => setNewCategory({ ...newCategory, href: e.target.value })}
                placeholder="/shop/category"
                dir="ltr"
                className="h-9"
              />
            </div>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newCategory.name_ar || !newCategory.name_en || saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OurProductsManager;
