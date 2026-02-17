import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { transformProduct } from '@/hooks/useProducts';
import {
  useMenus,
  useMenuProducts,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useAttachProductsToMenu,
  useRemoveProductFromMenu,
  useReorderMenuProducts,
} from '@/hooks/useMenus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  GripVertical,
  Monitor,
  Smartphone,
  Eye,
  EyeOff,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Bug,
} from 'lucide-react';

// Fetch ALL active products without menu filtering (for admin use)
const useAllActiveProducts = () => {
  return useQuery({
    queryKey: ['all-active-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching all products:', error);
        throw error;
      }

      return (data || []).map(transformProduct);
    },
    staleTime: 1000 * 60 * 2,
  });
};

const AdminMenusPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const queryClient = useQueryClient();
  const { data: menus, isLoading: menusLoading } = useMenus();
  const { data: allProducts, isLoading: productsLoading } = useAllActiveProducts();
  const createMenu = useCreateMenu();
  const updateMenu = useUpdateMenu();
  const deleteMenu = useDeleteMenu();
  const attachProducts = useAttachProductsToMenu();
  const removeProduct = useRemoveProductFromMenu();
  const reorderProducts = useReorderMenuProducts();

  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newMenuNameAr, setNewMenuNameAr] = useState('');
  const [newMenuNameEn, setNewMenuNameEn] = useState('');
  const [showDebug, setShowDebug] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  // Auto-select first menu (usually website-menu) on load
  useEffect(() => {
    if (menus && menus.length > 0 && !selectedMenuId) {
      const websiteMenu = menus.find(m => m.slug === 'website-menu');
      setSelectedMenuId(websiteMenu?.id || menus[0].id);
    }
  }, [menus, selectedMenuId]);

  const { data: menuProducts, isLoading: menuProductsLoading } = useMenuProducts(selectedMenuId);

  const selectedMenu = menus?.find(m => m.id === selectedMenuId);
  const linkedProductIds = useMemo(() => new Set((menuProducts || []).map(mp => mp.product_id)), [menuProducts]);

  const linkedProducts = useMemo(() => {
    if (!allProducts || !menuProducts) return [];
    const sortMap = Object.fromEntries(menuProducts.map(mp => [mp.product_id, mp.sort_order]));
    return allProducts
      .filter(p => linkedProductIds.has(p.id))
      .sort((a, b) => (sortMap[a.id] ?? 0) - (sortMap[b.id] ?? 0));
  }, [allProducts, menuProducts, linkedProductIds]);

  const unlinkedProducts = useMemo(() => {
    if (!allProducts) return [];
    const filtered = allProducts.filter(p => !linkedProductIds.has(p.id));
    if (!searchQuery) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }, [allProducts, linkedProductIds, searchQuery]);

  const handleCreateMenu = () => {
    if (!newMenuNameAr || !newMenuNameEn) return;
    createMenu.mutate(
      { name_ar: newMenuNameAr, name_en: newMenuNameEn, slug: newMenuNameEn.toLowerCase().replace(/\s+/g, '-') },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setNewMenuNameAr('');
          setNewMenuNameEn('');
        },
      }
    );
  };

  const handleAttachSelected = () => {
    if (!selectedMenuId || selectedProductIds.size === 0) {
      toast.error(isRTL ? 'اختر منتجات أولاً' : 'Select products first');
      return;
    }
    setLastError(null);
    const count = selectedProductIds.size;
    toast.loading(isRTL ? `جاري ربط ${count} منتج...` : `Attaching ${count} products...`, { id: 'attach-bulk' });
    console.log('[MenuAttach] Bulk attach', count, 'products to menu', selectedMenuId);
    attachProducts.mutate(
      { menuId: selectedMenuId, productIds: Array.from(selectedProductIds) },
      {
        onSuccess: (result) => {
          setSelectedProductIds(new Set());
          setLastError(null);
          toast.success(isRTL ? `تم ربط ${result.inserted} منتج ✅` : `${result.inserted} products attached ✅`, { id: 'attach-bulk' });
          console.log('[MenuAttach] Bulk attach success:', result);
        },
        onError: (err: any) => {
          const msg = err?.message || JSON.stringify(err);
          setLastError(msg);
          toast.error(`❌ Attach failed: ${msg}`, { id: 'attach-bulk' });
          console.error('Attach error:', err);
        },
      }
    );
  };

  const handleToggleProduct = (productId: string) => {
    if (!selectedMenuId) {
      toast.error(isRTL ? 'اختر قائمة أولاً' : 'Select a menu first');
      return;
    }
    setLastError(null);
    if (linkedProductIds.has(productId)) {
      console.log('[MenuToggle] Removing product', productId, 'from menu', selectedMenuId);
      removeProduct.mutate(
        { menuId: selectedMenuId, productId },
        { onError: (err: any) => { setLastError(err?.message); console.error('Remove error:', err); } }
      );
    } else {
      console.log('[MenuToggle] Attaching product', productId, 'to menu', selectedMenuId);
      toast.loading(isRTL ? 'جاري الربط...' : 'Attaching...', { id: 'attach-single' });
      attachProducts.mutate(
        { menuId: selectedMenuId, productIds: [productId] },
        {
          onSuccess: (result) => {
            toast.success(isRTL ? 'تم ربط المنتج ✅' : 'Product attached ✅', { id: 'attach-single' });
            console.log('[MenuToggle] Single attach success:', result);
          },
          onError: (err: any) => {
            setLastError(err?.message);
            toast.error(`❌ ${err?.message}`, { id: 'attach-single' });
            console.error('Attach error:', err);
          },
        }
      );
    }
  };

  const handleMoveProduct = (productId: string, direction: 'up' | 'down') => {
    if (!selectedMenuId || !menuProducts) return;
    const sorted = [...menuProducts].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(mp => mp.product_id === productId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newOrder = sorted.map(mp => mp.product_id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    reorderProducts.mutate({ menuId: selectedMenuId, orderedProductIds: newOrder });
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === unlinkedProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(unlinkedProducts.map(p => p.id)));
    }
  };

  const handleAutoSync = () => {
    if (!selectedMenuId || !allProducts) return;
    setLastError(null);
    const activeIds = allProducts.map(p => p.id);
    attachProducts.mutate(
      { menuId: selectedMenuId, productIds: activeIds },
      {
        onSuccess: () => toast.success(isRTL ? 'تم المزامنة التلقائية' : 'Auto-synced all active products'),
        onError: (err: any) => { setLastError(err?.message); console.error('Auto-sync error:', err); },
      }
    );
  };

  if (menusLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold">{isRTL ? 'إدارة القوائم' : 'Menu Management'}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowDebug(!showDebug)} title="Debug">
            <Bug className="w-4 h-4" />
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 me-1" /> {isRTL ? 'قائمة جديدة' : 'New Menu'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isRTL ? 'إنشاء قائمة جديدة' : 'Create New Menu'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>{isRTL ? 'الاسم بالعربي' : 'Name (AR)'}</Label><Input value={newMenuNameAr} onChange={e => setNewMenuNameAr(e.target.value)} /></div>
                <div><Label>{isRTL ? 'الاسم بالإنجليزي' : 'Name (EN)'}</Label><Input value={newMenuNameEn} onChange={e => setNewMenuNameEn(e.target.value)} /></div>
                <Button onClick={handleCreateMenu} disabled={createMenu.isPending} className="w-full">
                  {isRTL ? 'إنشاء' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-4 text-xs font-mono space-y-1">
            <p>selectedMenuId: {selectedMenuId || 'null'}</p>
            <p>menus count: {menus?.length ?? 0}</p>
            <p>allProducts count: {allProducts?.length ?? 0}</p>
            <p>menuProducts count: {menuProducts?.length ?? 0}</p>
            <p>linkedProductIds: {linkedProductIds.size}</p>
            <p>unlinkedProducts: {unlinkedProducts.length}</p>
            <p>attachPending: {String(attachProducts.isPending)}</p>
            {lastError && <p className="text-red-600">Last Error: {lastError}</p>}
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  console.log('[Debug] Current user:', user?.id, user?.email);
                  
                  const { data: isAdminResult } = await supabase.rpc('is_admin');
                  console.log('[Debug] is_admin() =', isAdminResult);
                  
                  if (!user) {
                    toast.error('❌ Not authenticated! Please login first.');
                    return;
                  }
                  if (!isAdminResult) {
                    toast.error('❌ User is NOT admin. RPC will fail.');
                    return;
                  }
                  
                  toast.success(`✅ Auth OK: ${user.email}, isAdmin=${isAdminResult}`);
                  
                  // Test with first product
                  if (selectedMenuId && allProducts && allProducts.length > 0) {
                    const testId = allProducts[0].id;
                    console.log('[Debug] Testing RPC with menuId=', selectedMenuId, 'productId=', testId);
                    const { data, error } = await supabase.rpc('attach_products_to_menu', {
                      p_menu_id: selectedMenuId,
                      p_product_ids: [testId],
                    });
                    console.log('[Debug] RPC result:', JSON.stringify(data), 'error:', error);
                    if (error) {
                      toast.error(`RPC Error: ${error.message}`);
                      setLastError(error.message);
                    } else {
                      toast.success(`RPC OK: ${JSON.stringify(data)}`);
                      // Manually trigger refetch
                      queryClient.invalidateQueries({ queryKey: ['menu-products', selectedMenuId] });
                      queryClient.invalidateQueries({ queryKey: ['website-menu-products'] });
                    }
                  }
                } catch (e: any) {
                  console.error('[Debug] Test failed:', e);
                  toast.error(`Test failed: ${e.message}`);
                }
              }}
            >
              🧪 Test Auth + RPC
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Menu List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus?.map(menu => (
          <Card
            key={menu.id}
            className={`cursor-pointer transition-all ${selectedMenuId === menu.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            onClick={() => setSelectedMenuId(menu.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{isRTL ? menu.name_ar : menu.name_en}</CardTitle>
                <div className="flex gap-1">
                  {menu.show_on_desktop && <Monitor className="w-4 h-4 text-muted-foreground" />}
                  {menu.show_on_mobile && <Smartphone className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                    {menu.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                  </Badge>
                  {menu.slug === 'website-menu' && (
                    <Badge variant="outline" className="text-xs">{isRTL ? 'الرئيسي' : 'Primary'}</Badge>
                  )}
                </div>
                {menu.slug !== 'website-menu' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={e => { e.stopPropagation(); deleteMenu.mutate(menu.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Menu Details */}
      {selectedMenu && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>{isRTL ? selectedMenu.name_ar : selectedMenu.name_en}</CardTitle>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">{isRTL ? 'نشط' : 'Active'}</Label>
                  <Switch
                    checked={selectedMenu.is_active}
                    onCheckedChange={checked => updateMenu.mutate({ id: selectedMenu.id, is_active: checked })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <Switch
                    checked={selectedMenu.show_on_desktop}
                    onCheckedChange={checked => updateMenu.mutate({ id: selectedMenu.id, show_on_desktop: checked })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <Switch
                    checked={selectedMenu.show_on_mobile}
                    onCheckedChange={checked => updateMenu.mutate({ id: selectedMenu.id, show_on_mobile: checked })}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleAutoSync} disabled={attachProducts.isPending}>
                  <RefreshCw className={`w-4 h-4 me-1 ${attachProducts.isPending ? 'animate-spin' : ''}`} />
                  {isRTL ? 'مزامنة تلقائية' : 'Auto-Sync'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Linked Products */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                {isRTL ? `المنتجات المرتبطة (${linkedProducts.length})` : `Linked Products (${linkedProducts.length})`}
              </h3>
              {menuProductsLoading ? (
                <Skeleton className="h-32" />
              ) : linkedProducts.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <p className="text-muted-foreground text-sm mb-2">
                    {isRTL ? 'لا توجد منتجات مرتبطة بهذه القائمة' : 'No products linked to this menu'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {isRTL ? 'اختر منتجات من الأسفل واضغط "ربط"' : 'Select products below and click "Attach"'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {linkedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                      {product.image && product.image !== '/placeholder.svg' && (
                        <img src={product.image} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{isRTL ? product.name : product.nameEn}</p>
                        <p className="text-xs text-muted-foreground">{product.category} · {product.price} AED</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0}
                          onClick={() => handleMoveProduct(product.id, 'up')}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === linkedProducts.length - 1}
                          onClick={() => handleMoveProduct(product.id, 'down')}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => handleToggleProduct(product.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attach Products */}
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  {isRTL ? `المنتجات الغير مرتبطة (${unlinkedProducts.length})` : `Unlinked Products (${unlinkedProducts.length})`}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute start-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={isRTL ? 'بحث...' : 'Search...'}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="ps-8 h-9 w-48"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedProductIds.size === unlinkedProducts.length && unlinkedProducts.length > 0
                      ? (isRTL ? 'إلغاء الكل' : 'Deselect All')
                      : (isRTL ? 'تحديد الكل' : 'Select All')}
                  </Button>
                  <Button size="sm" onClick={handleAttachSelected} disabled={selectedProductIds.size === 0 || attachProducts.isPending}>
                    <Plus className="w-4 h-4 me-1" />
                    {isRTL ? `ربط (${selectedProductIds.size})` : `Attach (${selectedProductIds.size})`}
                  </Button>
                </div>
              </div>

              {productsLoading ? (
                <Skeleton className="h-32" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                  {unlinkedProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        const next = new Set(selectedProductIds);
                        next.has(product.id) ? next.delete(product.id) : next.add(product.id);
                        setSelectedProductIds(next);
                      }}
                    >
                      <Checkbox checked={selectedProductIds.has(product.id)} />
                      {product.image && product.image !== '/placeholder.svg' && (
                        <img src={product.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{isRTL ? product.name : product.nameEn}</p>
                        <p className="text-xs text-muted-foreground">{product.category} · {product.price} AED</p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="shrink-0 h-7 px-3 text-xs"
                        disabled={attachProducts.isPending}
                        onClick={e => { e.stopPropagation(); handleToggleProduct(product.id); }}
                      >
                        <Plus className="w-3 h-3 me-1" />
                        {isRTL ? 'ربط' : 'Attach'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMenusPage;
