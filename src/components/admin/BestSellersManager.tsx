import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Flame, Save, Loader2, X, Search, GripVertical, Plus } from 'lucide-react';

const BestSellersManager = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch current best_sellers setting
  const { data: currentSetting } = useQuery({
    queryKey: ['best-sellers-setting-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'best_sellers')
        .single();
      if (error) return [];
      return (data?.value as string[]) || [];
    },
  });

  // Fetch all active products
  const { data: allProducts } = useQuery({
    queryKey: ['all-products-for-bestsellers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_ar, name_en, price, image_url, category')
        .eq('is_active', true)
        .order('name_ar');
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (currentSetting) {
      setSelectedIds(currentSetting);
    }
  }, [currentSetting]);

  const saveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(ids)) })
        .eq('key', 'best_sellers');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['best-sellers-setting'] });
      queryClient.invalidateQueries({ queryKey: ['best-sellers-setting-admin'] });
      queryClient.invalidateQueries({ queryKey: ['best-sellers-products'] });
      toast.success(isRTL ? 'تم حفظ اختياراتنا المميزة' : 'Best sellers saved');
    },
    onError: () => {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    },
  });

  const addProduct = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 8) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedIds(prev => prev.filter(p => p !== id));
  };

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newIds = [...selectedIds];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newIds.length) return;
    [newIds[index], newIds[swapIndex]] = [newIds[swapIndex], newIds[index]];
    setSelectedIds(newIds);
  };

  const selectedProducts = selectedIds.map(id => allProducts?.find(p => p.id === id)).filter(Boolean);

  const filteredProducts = allProducts?.filter(p => 
    !selectedIds.includes(p.id) && 
    (p.name_ar.includes(searchQuery) || (p.name_en || '').toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          {isRTL ? 'اختياراتنا المميزة' : 'Best Sellers'}
        </CardTitle>
        <CardDescription>
          {isRTL ? 'اختر المنتجات التي تظهر في قسم اختياراتنا المميزة على الصفحة الرئيسية (حتى 8 منتجات)' : 'Select products to show in the best sellers section on the homepage (up to 8)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Products */}
        <div>
          <h4 className="text-sm font-medium mb-3">{isRTL ? 'المنتجات المختارة' : 'Selected Products'} ({selectedIds.length}/8)</h4>
          {selectedProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              {isRTL ? 'لم يتم اختيار أي منتج بعد' : 'No products selected yet'}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedProducts.map((product, index) => product && (
                <div key={product.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name_ar}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{isRTL ? product.name_ar : (product.name_en || product.name_ar)}</p>
                    <p className="text-xs text-muted-foreground">{product.price} AED</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveProduct(index, 'up')} disabled={index === 0}>
                      ↑
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveProduct(index, 'down')} disabled={index === selectedProducts.length - 1}>
                      ↓
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeProduct(product.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search & Add Products */}
        <div>
          <h4 className="text-sm font-medium mb-3">{isRTL ? 'إضافة منتج' : 'Add Product'}</h4>
          <div className="relative mb-3">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 border rounded-lg p-2">
            {filteredProducts.slice(0, 20).map(product => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => addProduct(product.id)}
              >
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name_ar}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{isRTL ? product.name_ar : (product.name_en || product.name_ar)}</p>
                  <p className="text-xs text-muted-foreground">{product.category} • {product.price} AED</p>
                </div>
                <Plus className="w-4 h-4 text-primary shrink-0" />
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isRTL ? 'لا توجد نتائج' : 'No results'}
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={() => saveMutation.mutate(selectedIds)} 
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
          <Save className="w-4 h-4 me-2" />
          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BestSellersManager;
