import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, Link2, Unlink, Search, CheckCircle2, AlertCircle, 
  Sparkles, ArrowRightLeft, ChevronDown, ChevronUp, ExternalLink, Menu, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IikoProduct {
  id: string;
  name: string;
  groupName?: string;
  price?: number;
  code?: string;
  description?: string;
}

interface IikoGroup {
  id: string;
  name: string;
}

interface ExternalMenu {
  id: string;
  name: string;
}

// Simple string similarity (Dice coefficient)
function similarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
  const sa = normalize(a);
  const sb = normalize(b);
  if (sa === sb) return 1;
  if (sa.length < 2 || sb.length < 2) return 0;
  const bigrams = new Map<string, number>();
  for (let i = 0; i < sa.length - 1; i++) {
    const bi = sa.substring(i, i + 2);
    bigrams.set(bi, (bigrams.get(bi) || 0) + 1);
  }
  let hits = 0;
  for (let i = 0; i < sb.length - 1; i++) {
    const bi = sb.substring(i, i + 2);
    const count = bigrams.get(bi) || 0;
    if (count > 0) {
      bigrams.set(bi, count - 1);
      hits++;
    }
  }
  return (2 * hits) / (sa.length - 1 + sb.length - 1);
}

const AdminIikoMenuLinkPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const { data: localProducts, isLoading: productsLoading } = useProducts();

  const [iikoProducts, setIikoProducts] = useState<IikoProduct[]>([]);
  const [iikoGroups, setIikoGroups] = useState<IikoGroup[]>([]);
  const [externalMenus, setExternalMenus] = useState<ExternalMenu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [selectedMenuName, setSelectedMenuName] = useState<string | null>(null);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [searchLocal, setSearchLocal] = useState('');
  const [searchIiko, setSearchIiko] = useState('');
  const [selectedLocalId, setSelectedLocalId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Fetch full product data with iiko_id
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  
  const fetchDbProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name_ar, name_en, iiko_id, price, image_url, category, is_active')
      .eq('is_active', true)
      .order('name_ar');
    setDbProducts(data || []);
  };

  useEffect(() => {
    fetchDbProducts();
  }, []);

  // STEP 1: Fetch list of external menus
  const fetchExternalMenus = async () => {
    setLoadingMenus(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(isRTL ? 'يجب تسجيل الدخول' : 'Must be logged in');
        return;
      }

      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/iiko-fetch-menu-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'list_menus' })
      });

      if (!response.ok) throw new Error('Failed to fetch menus');
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to fetch menus');
        return;
      }

      setExternalMenus(result.externalMenus || []);
      
      if ((result.externalMenus || []).length === 0) {
        toast.warning(isRTL ? 'لا توجد قوائم خارجية' : 'No external menus found');
      } else {
        toast.success(
          isRTL 
            ? `تم جلب ${result.externalMenus.length} قائمة خارجية` 
            : `Found ${result.externalMenus.length} external menu(s)`
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Error fetching menus');
    } finally {
      setLoadingMenus(false);
    }
  };

  // STEP 2: Fetch products from selected external menu
  const fetchMenuProducts = async (menuId: string, menuName: string) => {
    setLoadingProducts(true);
    setSelectedMenuId(menuId);
    setSelectedMenuName(menuName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(isRTL ? 'يجب تسجيل الدخول' : 'Must be logged in');
        return;
      }

      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/iiko-fetch-menu-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'fetch_menu', externalMenuId: menuId })
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed');
        return;
      }

      setIikoProducts(result.products || []);
      setIikoGroups(result.groups || []);
      setFetched(true);
      // Auto-expand all groups
      const allGroupNames = new Set<string>((result.groups || []).map((g: IikoGroup) => g.name));
      setExpandedGroups(allGroupNames);

      toast.success(
        isRTL 
          ? `تم جلب ${result.totalProducts || 0} منتج من "${menuName}"` 
          : `Fetched ${result.totalProducts || 0} products from "${menuName}"`
      );
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Auto-match suggestions for a local product
  const getSuggestions = (localProduct: any): { iikoProduct: IikoProduct; score: number }[] => {
    if (!iikoProducts.length) return [];
    const nameAr = localProduct.name_ar || '';
    const nameEn = localProduct.name_en || '';
    
    return iikoProducts
      .map(ip => {
        const scoreAr = similarity(nameAr, ip.name);
        const scoreEn = nameEn ? similarity(nameEn, ip.name) : 0;
        return { iikoProduct: ip, score: Math.max(scoreAr, scoreEn) };
      })
      .filter(s => s.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const linkProduct = async (localId: string, iikoId: string) => {
    setLinkingId(localId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ iiko_id: iikoId })
        .eq('id', localId);

      if (error) throw error;
      
      toast.success(isRTL ? 'تم الربط بنجاح' : 'Linked successfully');
      await fetchDbProducts();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLinkingId(null);
    }
  };

  const unlinkProduct = async (localId: string) => {
    setLinkingId(localId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ iiko_id: null })
        .eq('id', localId);

      if (error) throw error;
      
      toast.success(isRTL ? 'تم إلغاء الربط' : 'Unlinked');
      await fetchDbProducts();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLinkingId(null);
    }
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  // Filter local products
  const filteredLocal = useMemo(() => {
    if (!dbProducts.length) return [];
    let list = dbProducts;
    if (searchLocal) {
      const q = searchLocal.toLowerCase();
      list = list.filter(p => 
        p.name_ar?.toLowerCase().includes(q) || 
        p.name_en?.toLowerCase().includes(q) ||
        p.iiko_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dbProducts, searchLocal]);

  // Filter iiko products
  const filteredIiko = useMemo(() => {
    if (!iikoProducts.length) return [];
    if (!searchIiko) return iikoProducts;
    const q = searchIiko.toLowerCase();
    return iikoProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q)
    );
  }, [iikoProducts, searchIiko]);

  // Group iiko products
  const groupedIiko = useMemo(() => {
    const map = new Map<string, IikoProduct[]>();
    filteredIiko.forEach(p => {
      const group = p.groupName || 'Other';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(p);
    });
    return map;
  }, [filteredIiko]);

  // Stats
  const linkedCount = dbProducts.filter(p => p.iiko_id).length;
  const totalCount = dbProducts.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'منتجات مربوطة' : 'Linked Products'}
                </p>
                <p className="text-2xl font-bold">{linkedCount}/{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <ExternalLink className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'منتجات iiko' : 'iiko Products'}
                </p>
                <p className="text-2xl font-bold">{iikoProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'القائمة المحددة' : 'Selected Menu'}
                </p>
                <p className="text-sm font-medium truncate max-w-[140px]">
                  {selectedMenuName || (isRTL ? 'لم يتم التحديد' : 'None selected')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 1: External Menu Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="w-5 h-5" />
            {isRTL ? 'الخطوة ١: اختر القائمة الخارجية' : 'Step 1: Select External Menu'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {externalMenus.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? 'اضغط لجلب القوائم الخارجية من نظام iiko' 
                  : 'Click to fetch external menus from iiko system'}
              </p>
              <Button onClick={fetchExternalMenus} disabled={loadingMenus}>
                <RefreshCw className={cn("w-4 h-4 me-2", loadingMenus && "animate-spin")} />
                {isRTL ? 'جلب القوائم' : 'Fetch Menus'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `تم العثور على ${externalMenus.length} قائمة. اختر واحدة لعرض المنتجات:` 
                    : `Found ${externalMenus.length} menu(s). Select one to load products:`}
                </p>
                <Button variant="ghost" size="sm" onClick={fetchExternalMenus} disabled={loadingMenus}>
                  <RefreshCw className={cn("w-3 h-3 me-1", loadingMenus && "animate-spin")} />
                  {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {externalMenus.map(menu => (
                  <button
                    key={menu.id}
                    onClick={() => fetchMenuProducts(menu.id, menu.name)}
                    disabled={loadingProducts}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-start",
                      selectedMenuId === menu.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50",
                      loadingProducts && selectedMenuId === menu.id && "opacity-70"
                    )}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Menu className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{menu.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">ID: {menu.id.substring(0, 12)}...</p>
                    </div>
                    {loadingProducts && selectedMenuId === menu.id && (
                      <RefreshCw className="w-4 h-4 animate-spin text-primary shrink-0" />
                    )}
                    {selectedMenuId === menu.id && !loadingProducts && fetched && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Product Linking (only shown after menu is selected) */}
      {fetched && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Local Products */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBagIcon />
                  {isRTL ? 'الخطوة ٢: ربط المنتجات' : 'Step 2: Link Products'}
                </CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={isRTL ? 'بحث...' : 'Search...'}
                    value={searchLocal}
                    onChange={e => setSearchLocal(e.target.value)}
                    className="ps-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {productsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : filteredLocal.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {isRTL ? 'لا توجد منتجات' : 'No products found'}
                  </p>
                ) : (
                  filteredLocal.map(product => {
                    const isLinked = !!product.iiko_id;
                    const isSelected = selectedLocalId === product.id;
                    const suggestions = isSelected && fetched ? getSuggestions(product) : [];

                    return (
                      <div key={product.id} className="space-y-1">
                        <button
                          onClick={() => setSelectedLocalId(isSelected ? null : product.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-start",
                            isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                            isLinked && "border-green-500/30"
                          )}
                        >
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt="" 
                              className="w-10 h-10 rounded object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name_ar}</p>
                            {product.name_en && (
                              <p className="text-xs text-muted-foreground truncate">{product.name_en}</p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {isLinked ? (
                              <Badge variant="outline" className="text-green-600 border-green-600/30 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 me-1" />
                                {isRTL ? 'مربوط' : 'Linked'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                <AlertCircle className="w-3 h-3 me-1" />
                                {isRTL ? 'غير مربوط' : 'Not linked'}
                              </Badge>
                            )}
                          </div>
                        </button>

                        {isSelected && (
                          <div className="ms-4 p-3 rounded-lg bg-muted/50 space-y-2">
                            {isLinked && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  iiko ID: <code className="text-foreground">{product.iiko_id}</code>
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-destructive"
                                  onClick={() => unlinkProduct(product.id)}
                                  disabled={linkingId === product.id}
                                >
                                  <Unlink className="w-3 h-3 me-1" />
                                  {isRTL ? 'إلغاء' : 'Unlink'}
                                </Button>
                              </div>
                            )}

                            {suggestions.length > 0 && !isLinked && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium flex items-center gap-1 text-primary">
                                  <Sparkles className="w-3 h-3" />
                                  {isRTL ? 'اقتراحات تلقائية' : 'Auto-match suggestions'}
                                </p>
                                {suggestions.map(({ iikoProduct, score }) => (
                                  <div 
                                    key={iikoProduct.id} 
                                    className="flex items-center justify-between gap-2 p-2 rounded bg-background border"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium truncate">{iikoProduct.name}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {Math.round(score * 100)}% match
                                        {iikoProduct.groupName && ` · ${iikoProduct.groupName}`}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs shrink-0"
                                      onClick={() => linkProduct(product.id, iikoProduct.id)}
                                      disabled={linkingId === product.id}
                                    >
                                      <Link2 className="w-3 h-3 me-1" />
                                      {isRTL ? 'ربط' : 'Link'}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!isLinked && (
                              <p className="text-[10px] text-muted-foreground">
                                {isRTL 
                                  ? 'أو اختر من قائمة iiko على اليمين' 
                                  : 'Or pick from iiko menu on the right'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Right: iiko Products */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5" />
                  {isRTL ? 'قائمة iiko' : 'iiko Menu'}{selectedMenuName ? `: ${selectedMenuName}` : ''}
                </CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={isRTL ? 'بحث في iiko...' : 'Search iiko...'}
                    value={searchIiko}
                    onChange={e => setSearchIiko(e.target.value)}
                    className="ps-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {iikoProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {isRTL ? 'لا توجد منتجات في هذه القائمة' : 'No products in this menu'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Array.from(groupedIiko.entries()).map(([groupName, items]) => {
                      const isExpanded = expandedGroups.has(groupName);
                      const linkedIikoIds = new Set(dbProducts.filter(p => p.iiko_id).map(p => p.iiko_id));

                      return (
                        <div key={groupName}>
                          <button
                            onClick={() => toggleGroup(groupName)}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="font-medium text-sm">{groupName} ({items.length})</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="space-y-1 ms-2 mt-1">
                              {items.map(item => {
                                const isUsed = linkedIikoIds.has(item.id);
                                const linkedTo = isUsed 
                                  ? dbProducts.find(p => p.iiko_id === item.id)
                                  : null;

                                return (
                                  <div 
                                    key={item.id} 
                                    className={cn(
                                      "flex items-center justify-between gap-2 p-2 rounded border text-sm",
                                      isUsed ? "border-green-500/30 bg-green-500/5" : "border-border"
                                    )}
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium truncate">{item.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">
                                        ID: {item.id.substring(0, 12)}...
                                        {item.price != null && ` · ${item.price} AED`}
                                      </p>
                                      {linkedTo && (
                                        <p className="text-[10px] text-green-600">
                                          → {linkedTo.name_ar}
                                        </p>
                                      )}
                                    </div>
                                    {selectedLocalId && !isUsed && (
                                      <Button
                                        size="sm"
                                        className="h-7 text-xs shrink-0"
                                        onClick={() => linkProduct(selectedLocalId, item.id)}
                                        disabled={!!linkingId}
                                      >
                                        <Link2 className="w-3 h-3 me-1" />
                                        {isRTL ? 'ربط' : 'Link'}
                                      </Button>
                                    )}
                                    {isUsed && (
                                      <Badge variant="outline" className="text-green-600 text-[10px] shrink-0">
                                        <CheckCircle2 className="w-3 h-3" />
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{isRTL ? 'كيفية الربط' : 'How to Link'}</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{isRTL ? 'اضغط "جلب القوائم" لتحميل القوائم الخارجية من iiko' : 'Click "Fetch Menus" to load external menus from iiko'}</li>
                <li>{isRTL ? 'اختر القائمة المناسبة (مثل "Al Saraya") لعرض منتجاتها' : 'Select the appropriate menu (e.g., "Al Saraya") to load its products'}</li>
                <li>{isRTL ? 'اختر منتج من قائمتك (يسار)' : 'Select a product from your list (left)'}</li>
                <li>{isRTL ? 'استخدم الاقتراحات التلقائية أو اختر يدوياً من قائمة iiko (يمين)' : 'Use auto-suggestions or manually pick from iiko menu (right)'}</li>
                <li>{isRTL ? 'اضغط "ربط" لحفظ العلاقة' : 'Click "Link" to save the mapping'}</li>
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// Small helper icon component
const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

export default AdminIikoMenuLinkPage;
