import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import {
  Plus, Search, Pencil, Trash2, Package, Image as ImageIcon,
  RefreshCw, Eye, EyeOff, Upload, X, Loader2, CheckSquare, Tags
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';

interface Product {
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
  compare_at_price: number | null;
  created_at: string | null;
}

interface DbCategory {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string | null;
  is_active: boolean;
}

const AdminProductsPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [productCategoryMap, setProductCategoryMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name_ar: '', name_en: '', description_ar: '', description_en: '',
    price: 0, compare_at_price: '', price_per: 'kg', category: '',
    image_url: '', is_active: true, is_box: false, sort_order: 0,
  });
  const [formCategoryIds, setFormCategoryIds] = useState<string[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>('');

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Image
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk selection
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'add' | 'remove'>('add');
  const [bulkCategoryIds, setBulkCategoryIds] = useState<string[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: prods }, { data: cats }, { data: pcs }] = await Promise.all([
        supabase.from('products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name_ar, name_en, slug, is_active').eq('is_deleted', false).order('sort_order'),
        supabase.from('product_categories').select('product_id, category_id, is_primary'),
      ]);
      setProducts(prods || []);
      setDbCategories((cats as DbCategory[]) || []);

      const map: Record<string, string[]> = {};
      (pcs || []).forEach((pc: any) => {
        if (!map[pc.product_id]) map[pc.product_id] = [];
        map[pc.product_id].push(pc.category_id);
      });
      setProductCategoryMap(map);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.name_en?.toLowerCase().includes(searchQuery.toLowerCase()));
      let matchesCategory = selectedCategory === 'all';
      if (!matchesCategory) {
        // Check junction table
        const catIds = productCategoryMap[product.id] || [];
        const selectedCat = dbCategories.find(c => c.id === selectedCategory);
        matchesCategory = catIds.includes(selectedCategory) ||
          (product.category === selectedCat?.slug) ||
          (product.category === selectedCategory);
      }
      const matchesDiscount = !showDiscountedOnly || (product.compare_at_price != null && product.compare_at_price > product.price);
      return matchesSearch && matchesCategory && matchesDiscount;
    });
  }, [products, searchQuery, selectedCategory, showDiscountedOnly, productCategoryMap, dbCategories]);

  const getCategoryNames = (product: Product): string => {
    const catIds = productCategoryMap[product.id] || [];
    if (catIds.length > 0) {
      return catIds.map(id => {
        const c = dbCategories.find(cat => cat.id === id);
        return c ? (isRTL ? c.name_ar : c.name_en) : '';
      }).filter(Boolean).join(', ');
    }
    if (product.category) {
      const c = dbCategories.find(cat => cat.slug === product.category);
      return c ? (isRTL ? c.name_ar : c.name_en) : product.category;
    }
    return '-';
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      name_ar: '', name_en: '', description_ar: '', description_en: '',
      price: 0, compare_at_price: '', price_per: 'kg', category: '',
      image_url: '', is_active: true, is_box: false, sort_order: 0,
    });
    setFormCategoryIds([]);
    setPrimaryCategoryId('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_ar: product.name_ar, name_en: product.name_en || '',
      description_ar: product.description_ar || '', description_en: product.description_en || '',
      price: product.price, compare_at_price: product.compare_at_price ? String(product.compare_at_price) : '',
      price_per: product.price_per || 'kg', category: product.category || '',
      image_url: product.image_url || '', is_active: product.is_active ?? true,
      is_box: product.is_box ?? false, sort_order: product.sort_order || 0,
    });
    setFormCategoryIds(productCategoryMap[product.id] || []);
    setPrimaryCategoryId('');
    setIsDialogOpen(true);
  };

  const toggleFormCategory = (catId: string) => {
    setFormCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSave = async () => {
    if (!formData.name_ar || !formData.price) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'الاسم والسعر مطلوبين' : 'Name and price required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const compareAt = formData.compare_at_price ? parseFloat(formData.compare_at_price as string) : null;
      // Determine legacy category from primary or first selected
      const primaryCat = primaryCategoryId || formCategoryIds[0];
      const legacySlug = primaryCat ? dbCategories.find(c => c.id === primaryCat)?.slug : formData.category;

      const productData = {
        name_ar: formData.name_ar, name_en: formData.name_en || null,
        description_ar: formData.description_ar || null, description_en: formData.description_en || null,
        price: formData.price, compare_at_price: compareAt && compareAt > formData.price ? compareAt : null,
        price_per: formData.price_per, category: legacySlug || null,
        image_url: formData.image_url || null, is_active: formData.is_active,
        is_box: formData.is_box, sort_order: formData.sort_order,
      };

      let productId: string;
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        productId = editingProduct.id;
      } else {
        const { data, error } = await supabase.from('products').insert([productData]).select('id').single();
        if (error) throw error;
        productId = data.id;
      }

      // Sync product_categories
      await supabase.from('product_categories').delete().eq('product_id', productId);
      if (formCategoryIds.length > 0) {
        const rows = formCategoryIds.map(catId => ({
          product_id: productId,
          category_id: catId,
          is_primary: catId === (primaryCategoryId || formCategoryIds[0]),
        }));
        const { error: pcErr } = await supabase.from('product_categories').insert(rows);
        if (pcErr) throw pcErr;
      }

      toast({
        title: editingProduct ? (isRTL ? 'تم التحديث' : 'Updated') : (isRTL ? 'تمت الإضافة' : 'Added'),
        description: editingProduct ? (isRTL ? 'تم تحديث المنتج' : 'Product updated') : (isRTL ? 'تم إضافة المنتج' : 'Product added'),
      });
      setIsDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await supabase.from('product_categories').delete().eq('product_id', productToDelete.id);
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
      if (error) throw error;
      toast({ title: isRTL ? 'تم الحذف' : 'Deleted', description: isRTL ? 'تم حذف المنتج' : 'Product deleted' });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const toggleProductStatus = async (product: Product) => {
    const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
    }
  };

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const openBulkDialog = (action: 'add' | 'remove') => {
    setBulkAction(action);
    setBulkCategoryIds([]);
    setBulkDialogOpen(true);
  };

  const handleBulkAction = async () => {
    if (bulkCategoryIds.length === 0 || selectedProductIds.size === 0) return;
    try {
      const ids = Array.from(selectedProductIds);
      if (bulkAction === 'add') {
        const rows: { product_id: string; category_id: string }[] = [];
        for (const pid of ids) {
          for (const cid of bulkCategoryIds) {
            if (!(productCategoryMap[pid] || []).includes(cid)) {
              rows.push({ product_id: pid, category_id: cid });
            }
          }
        }
        if (rows.length > 0) {
          const { error } = await supabase.from('product_categories').insert(rows);
          if (error) throw error;
        }
        sonnerToast.success(isRTL ? `تم إضافة ${ids.length} منتج إلى الأقسام` : `Added ${ids.length} products to categories`);
      } else {
        for (const cid of bulkCategoryIds) {
          await supabase.from('product_categories').delete().in('product_id', ids).eq('category_id', cid);
        }
        sonnerToast.success(isRTL ? `تم إزالة ${ids.length} منتج من الأقسام` : `Removed ${ids.length} products from categories`);
      }
      setBulkDialogOpen(false);
      setSelectedProductIds(new Set());
      fetchAll();
    } catch (err: any) {
      sonnerToast.error(err.message);
    }
  };

  return (
    <AdminLayout title="Products Management" titleAr="إدارة المنتجات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              {isRTL ? 'إدارة المنتجات' : 'Products Management'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL ? `${products.length} منتج` : `${products.length} products`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={fetchAll} disabled={loading}>
              <RefreshCw className={`w-4 h-4 me-2 ${loading ? 'animate-spin' : ''}`} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 me-2" />
              {isRTL ? 'إضافة منتج' : 'Add Product'}
            </Button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedProductIds.size > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-medium">
                {isRTL ? `تم تحديد ${selectedProductIds.size} منتج` : `${selectedProductIds.size} products selected`}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openBulkDialog('add')}>
                  <Tags className="w-4 h-4 me-1" />
                  {isRTL ? 'إضافة لأقسام' : 'Add to Categories'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openBulkDialog('remove')}>
                  <X className="w-4 h-4 me-1" />
                  {isRTL ? 'إزالة من أقسام' : 'Remove from Categories'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedProductIds(new Set())}>
                  {isRTL ? 'إلغاء التحديد' : 'Clear'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={isRTL ? 'بحث بالاسم...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pe-10" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={isRTL ? 'جميع الأقسام' : 'All Categories'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع الأقسام' : 'All Categories'}</SelectItem>
                  {dbCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{isRTL ? cat.name_ar : cat.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant={showDiscountedOnly ? 'default' : 'outline'} onClick={() => setShowDiscountedOnly(!showDiscountedOnly)} className="whitespace-nowrap">
                🏷️ {isRTL ? 'العروض فقط' : 'Discounted'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-16">{isRTL ? 'صورة' : 'Image'}</TableHead>
                      <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead>{isRTL ? 'الأقسام' : 'Categories'}</TableHead>
                      <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                      <TableHead>{isRTL ? 'الخصم' : 'Discount'}</TableHead>
                      <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="w-24">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {isRTL ? 'لا توجد منتجات' : 'No products found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map(product => (
                        <TableRow key={product.id} className={cn(selectedProductIds.has(product.id) && 'bg-primary/5')}>
                          <TableCell>
                            <Checkbox checked={selectedProductIds.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                          </TableCell>
                          <TableCell>
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name_ar} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{product.name_ar}</p>
                            {product.name_en && <p className="text-sm text-muted-foreground">{product.name_en}</p>}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(productCategoryMap[product.id] || []).map(catId => {
                                const c = dbCategories.find(cat => cat.id === catId);
                                return c ? (
                                  <Badge key={catId} variant="outline" className="text-[10px]">
                                    {isRTL ? c.name_ar : c.name_en}
                                  </Badge>
                                ) : null;
                              })}
                              {!(productCategoryMap[product.id]?.length) && product.category && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {getCategoryNames(product)}
                                </Badge>
                              )}
                              {!(productCategoryMap[product.id]?.length) && !product.category && (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold">{product.price}</span>
                            <span className="text-sm text-muted-foreground ms-1">
                              {isRTL ? 'د.إ' : 'AED'}/{product.price_per || 'kg'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {product.compare_at_price && product.compare_at_price > product.price ? (
                              <Badge variant="destructive" className="text-xs">
                                {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                              </Badge>
                            ) : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => toggleProductStatus(product)}>
                              {product.is_active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                                onClick={() => { setProductToDelete(product); setDeleteDialogOpen(true); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? (isRTL ? 'تعديل المنتج' : 'Edit Product') : (isRTL ? 'إضافة منتج جديد' : 'Add New Product')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'الاسم بالعربية *' : 'Arabic Name *'}</Label>
              <Input value={formData.name_ar} onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))} dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
              <Input value={formData.name_en} onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'الوصف بالعربية' : 'Arabic Description'}</Label>
              <Textarea value={formData.description_ar} onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))} dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'الوصف بالإنجليزية' : 'English Description'}</Label>
              <Textarea value={formData.description_en} onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'السعر (درهم) *' : 'Price (AED) *'}</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} min="0" step="0.5" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'السعر قبل الخصم' : 'Compare at Price'}</Label>
              <Input type="number" value={formData.compare_at_price}
                onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))} min="0" step="0.5"
                placeholder={isRTL ? 'فارغ = بدون خصم' : 'Empty = no discount'} />
              {formData.compare_at_price && parseFloat(formData.compare_at_price as string) > formData.price && (
                <p className="text-xs text-green-600">
                  {isRTL ? 'خصم' : 'Discount'}: {Math.round(((parseFloat(formData.compare_at_price as string) - formData.price) / parseFloat(formData.compare_at_price as string)) * 100)}%
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'وحدة السعر' : 'Price Unit'}</Label>
              <Select value={formData.price_per} onValueChange={(v) => setFormData(prev => ({ ...prev, price_per: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">{isRTL ? 'كيلو' : 'KG'}</SelectItem>
                  <SelectItem value="piece">{isRTL ? 'قطعة' : 'Piece'}</SelectItem>
                  <SelectItem value="box">{isRTL ? 'بوكس' : 'Box'}</SelectItem>
                  <SelectItem value="tray">{isRTL ? 'صينية' : 'Tray'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'ترتيب العرض' : 'Sort Order'}</Label>
              <Input type="number" value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} min="0" />
            </div>

            {/* Multi-category selection */}
            <div className="md:col-span-2 space-y-2">
              <Label className="flex items-center gap-1">
                <Tags className="w-4 h-4" />
                {isRTL ? 'الأقسام (اختر أكثر من قسم)' : 'Categories (multi-select)'}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border bg-muted/20 max-h-[200px] overflow-y-auto">
                {dbCategories.map(cat => (
                  <label key={cat.id} className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors text-sm",
                    formCategoryIds.includes(cat.id) ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                  )}>
                    <Checkbox checked={formCategoryIds.includes(cat.id)} onCheckedChange={() => toggleFormCategory(cat.id)} />
                    <span>{isRTL ? cat.name_ar : cat.name_en}</span>
                  </label>
                ))}
              </div>
              {formCategoryIds.length > 1 && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{isRTL ? 'القسم الأساسي (للـ SEO)' : 'Primary Category (for SEO)'}</Label>
                  <Select value={primaryCategoryId} onValueChange={setPrimaryCategoryId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={isRTL ? 'تلقائي (الأول)' : 'Auto (first)'} />
                    </SelectTrigger>
                    <SelectContent>
                      {formCategoryIds.map(id => {
                        const c = dbCategories.find(cat => cat.id === id);
                        return c ? <SelectItem key={id} value={id}>{isRTL ? c.name_ar : c.name_en}</SelectItem> : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Image upload */}
            <div className="md:col-span-2 space-y-2">
              <Label>{isRTL ? 'صورة المنتج' : 'Product Image'}</Label>
              <div className="flex items-center gap-4">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    try {
                      const compressed = await imageCompression(file, {
                        maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true,
                        fileType: 'image/webp' as const, initialQuality: 0.75,
                      });
                      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
                      const { data, error } = await supabase.storage.from('product-images').upload(filename, compressed, { cacheControl: '3600', contentType: 'image/webp' });
                      if (error) throw error;
                      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
                      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
                    } catch (err: any) {
                      sonnerToast.error(err.message);
                    } finally {
                      setIsUploading(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                  }} />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex-1">
                  {isUploading ? <><Loader2 className="w-4 h-4 me-2 animate-spin" />{isRTL ? 'جاري الرفع...' : 'Uploading...'}</> :
                    <><Upload className="w-4 h-4 me-2" />{isRTL ? 'اختر صورة' : 'Choose Image'}</>}
                </Button>
                {formData.image_url && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {formData.image_url && <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded border mt-2" />}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_active: c }))} />
                <Label>{isRTL ? 'مفعّل' : 'Active'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_box} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_box: c }))} />
                <Label>{isRTL ? 'بوكس' : 'Is Box'}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {isRTL
              ? `هل أنت متأكد من حذف "${productToDelete?.name_ar}"؟`
              : `Are you sure you want to delete "${productToDelete?.name_ar}"?`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleDelete}>{isRTL ? 'حذف' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Category Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5" />
              {bulkAction === 'add'
                ? (isRTL ? `إضافة ${selectedProductIds.size} منتج لأقسام` : `Add ${selectedProductIds.size} products to categories`)
                : (isRTL ? `إزالة ${selectedProductIds.size} منتج من أقسام` : `Remove ${selectedProductIds.size} products from categories`)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>{isRTL ? 'اختر الأقسام' : 'Select categories'}</Label>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {dbCategories.map(cat => (
                <label key={cat.id} className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm border",
                  bulkCategoryIds.includes(cat.id) ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted border-transparent'
                )}>
                  <Checkbox
                    checked={bulkCategoryIds.includes(cat.id)}
                    onCheckedChange={() => setBulkCategoryIds(prev =>
                      prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                    )}
                  />
                  <span>{isRTL ? cat.name_ar : cat.name_en}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleBulkAction} disabled={bulkCategoryIds.length === 0}>
              {bulkAction === 'add' ? (isRTL ? 'إضافة' : 'Add') : (isRTL ? 'إزالة' : 'Remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProductsPage;
