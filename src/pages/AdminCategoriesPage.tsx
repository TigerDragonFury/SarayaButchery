import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, FolderTree, GripVertical, Eye, EyeOff,
  Upload, X, Loader2, AlertTriangle, ArrowRightLeft, Package
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import { useRef } from 'react';

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string | null;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const AdminCategoriesPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'move' | 'unlink'>('soft');
  const [moveToCategoryId, setMoveToCategoryId] = useState<string>('');

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    description_ar: '',
    description_en: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_deleted', false)
        .order('sort_order', { ascending: true });
      if (error) throw error;

      // Get product counts per category
      const { data: pcData } = await supabase
        .from('product_categories')
        .select('category_id');

      const countMap: Record<string, number> = {};
      (pcData || []).forEach((pc: any) => {
        countMap[pc.category_id] = (countMap[pc.category_id] || 0) + 1;
      });

      // Also count from products.category field (legacy)
      const { data: legacyProducts } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

      const cats = (data || []).map((c: any) => {
        const legacyCount = (legacyProducts || []).filter(
          (p: any) => p.category && c.slug && p.category === c.slug
        ).length;
        return {
          ...c,
          product_count: (countMap[c.id] || 0) + legacyCount,
        };
      });

      setCategories(cats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({
      name_ar: '', name_en: '', slug: '', description_ar: '', description_en: '',
      image_url: '', is_active: true, sort_order: categories.length + 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name_ar: cat.name_ar,
      name_en: cat.name_en,
      slug: cat.slug || '',
      description_ar: cat.description_ar || '',
      description_en: cat.description_en || '',
      image_url: cat.image_url || '',
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleNameEnChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name_en: value,
      slug: !editingCategory ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!formData.name_ar || !formData.name_en || !formData.slug) {
      toast.error(isRTL ? 'الاسم والـ Slug مطلوبين' : 'Name and slug are required');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        slug: formData.slug,
        description_ar: formData.description_ar || null,
        description_en: formData.description_en || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success(isRTL ? 'تم تحديث القسم' : 'Category updated');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([payload]);
        if (error) throw error;
        toast.success(isRTL ? 'تم إضافة القسم' : 'Category added');
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteMode('soft');
    setMoveToCategoryId('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      if (deleteMode === 'soft') {
        // Soft delete
        const { error } = await supabase
          .from('categories')
          .update({ is_deleted: true, is_active: false })
          .eq('id', categoryToDelete.id);
        if (error) throw error;
      } else if (deleteMode === 'move' && moveToCategoryId) {
        // Move products to another category, then delete
        const { error: moveErr } = await supabase
          .from('product_categories')
          .update({ category_id: moveToCategoryId })
          .eq('category_id', categoryToDelete.id);
        if (moveErr) throw moveErr;
        // Also update legacy category field
        if (categoryToDelete.slug) {
          const targetCat = categories.find(c => c.id === moveToCategoryId);
          if (targetCat?.slug) {
            await supabase
              .from('products')
              .update({ category: targetCat.slug })
              .eq('category', categoryToDelete.slug);
          }
        }
        const { error } = await supabase
          .from('categories')
          .update({ is_deleted: true, is_active: false })
          .eq('id', categoryToDelete.id);
        if (error) throw error;
      } else if (deleteMode === 'unlink') {
        // Remove product links then soft delete
        await supabase
          .from('product_categories')
          .delete()
          .eq('category_id', categoryToDelete.id);
        const { error } = await supabase
          .from('categories')
          .update({ is_deleted: true, is_active: false })
          .eq('id', categoryToDelete.id);
        if (error) throw error;
      }
      toast.success(isRTL ? 'تم حذف القسم' : 'Category deleted');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const toggleActive = async (cat: Category) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id);
    if (error) {
      toast.error('Failed to toggle');
    } else {
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
    }
  };

  // Drag & drop reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = async (idx: number) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newList = [...categories];
    const [moved] = newList.splice(dragIdx, 1);
    newList.splice(idx, 0, moved);
    // Update sort_order
    const updated = newList.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCategories(updated);
    setDragIdx(null);
    setDragOverIdx(null);

    // Persist
    for (const cat of updated) {
      await supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', cat.id);
    }
    toast.success(isRTL ? 'تم تحديث الترتيب' : 'Order updated');
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true,
        fileType: 'image/webp' as const, initialQuality: 0.75,
      });
      const filename = `cat-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filename, compressed, { cacheControl: '3600', contentType: 'image/webp' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const otherCategories = categories.filter(c => c.id !== categoryToDelete?.id);

  return (
    <AdminLayout title="Categories Management" titleAr="إدارة الأقسام">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-primary" />
              {isRTL ? 'إدارة الأقسام' : 'Categories Management'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isRTL ? `${categories.length} قسم` : `${categories.length} categories`}
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 me-2" />
            {isRTL ? 'إضافة قسم جديد' : 'Add Category'}
          </Button>
        </div>

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {isRTL
                ? '💡 اسحب الأقسام لإعادة ترتيبها. يمكنك ربط كل منتج بأكثر من قسم.'
                : '💡 Drag categories to reorder. Products can be linked to multiple categories.'}
            </p>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8" />
                      <TableHead className="w-14">{isRTL ? 'صورة' : 'Image'}</TableHead>
                      <TableHead>{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</TableHead>
                      <TableHead>{isRTL ? 'الاسم بالإنجليزية' : 'English Name'}</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>{isRTL ? 'المنتجات' : 'Products'}</TableHead>
                      <TableHead>{isRTL ? 'الترتيب' : 'Order'}</TableHead>
                      <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="w-24">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat, idx) => (
                      <TableRow
                        key={cat.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                        className={cn(
                          dragOverIdx === idx && 'bg-primary/10',
                          dragIdx === idx && 'opacity-50'
                        )}
                      >
                        <TableCell>
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          {cat.image_url ? (
                            <img src={cat.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <FolderTree className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{cat.name_ar}</TableCell>
                        <TableCell>{cat.name_en}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{cat.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cat.product_count || 0}</Badge>
                        </TableCell>
                        <TableCell>{cat.sort_order}</TableCell>
                        <TableCell>
                          <Badge
                            variant={cat.is_active ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => toggleActive(cat)}
                          >
                            {cat.is_active ? (isRTL ? 'مفعّل' : 'Active') : (isRTL ? 'مخفي' : 'Hidden')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(cat)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? (isRTL ? 'تعديل القسم' : 'Edit Category') : (isRTL ? 'إضافة قسم جديد' : 'Add New Category')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الاسم بالعربية *' : 'Arabic Name *'}</Label>
                <Input value={formData.name_ar} onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))} dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الاسم بالإنجليزية *' : 'English Name *'}</Label>
                <Input value={formData.name_en} onChange={(e) => handleNameEnChange(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                dir="ltr"
                placeholder="lamb-meat"
              />
              <p className="text-xs text-muted-foreground">{isRTL ? 'يُستخدم في الروابط — يتم توليده تلقائياً' : 'Used in URLs — auto-generated'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف بالعربية' : 'Arabic Description'}</Label>
                <Textarea value={formData.description_ar} onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))} dir="rtl" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف بالإنجليزية' : 'English Description'}</Label>
                <Textarea value={formData.description_en} onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))} dir="ltr" rows={2} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'صورة القسم' : 'Category Image'}</Label>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Upload className="w-4 h-4 me-1" />}
                  {isRTL ? 'رفع صورة' : 'Upload'}
                </Button>
                {formData.image_url && (
                  <>
                    <img src={formData.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                    <Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'ترتيب العرض' : 'Sort Order'}</Label>
                <Input type="number" value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} min="0" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_active: c }))} />
                <Label>{isRTL ? 'مفعّل' : 'Active'}</Label>
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
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {isRTL ? 'حذف القسم' : 'Delete Category'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? `حذف "${categoryToDelete?.name_ar}" — يحتوي على ${categoryToDelete?.product_count || 0} منتج`
                : `Delete "${categoryToDelete?.name_en}" — contains ${categoryToDelete?.product_count || 0} products`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Soft delete */}
            <label className={cn(
              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
              deleteMode === 'soft' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            )} onClick={() => setDeleteMode('soft')}>
              <input type="radio" checked={deleteMode === 'soft'} onChange={() => setDeleteMode('soft')} className="mt-1" />
              <div>
                <p className="font-medium text-sm">{isRTL ? 'إخفاء القسم (Soft Delete)' : 'Hide Category (Soft Delete)'}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'يبقى في قاعدة البيانات لكن لا يظهر في الموقع' : 'Stays in database but hidden from site'}</p>
              </div>
            </label>

            {/* Move products */}
            {(categoryToDelete?.product_count || 0) > 0 && (
              <label className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                deleteMode === 'move' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              )} onClick={() => setDeleteMode('move')}>
                <input type="radio" checked={deleteMode === 'move'} onChange={() => setDeleteMode('move')} className="mt-1" />
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-sm flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    {isRTL ? 'نقل المنتجات لقسم آخر ثم حذف' : 'Move products to another category then delete'}
                  </p>
                  {deleteMode === 'move' && (
                    <Select value={moveToCategoryId} onValueChange={setMoveToCategoryId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={isRTL ? 'اختر القسم الهدف' : 'Select target category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {otherCategories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{isRTL ? c.name_ar : c.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </label>
            )}

            {/* Unlink */}
            {(categoryToDelete?.product_count || 0) > 0 && (
              <label className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                deleteMode === 'unlink' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              )} onClick={() => setDeleteMode('unlink')}>
                <input type="radio" checked={deleteMode === 'unlink'} onChange={() => setDeleteMode('unlink')} className="mt-1" />
                <div>
                  <p className="font-medium text-sm">{isRTL ? 'فك ربط المنتجات وحذف القسم' : 'Unlink products and delete category'}</p>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'المنتجات تبقى بدون قسم' : 'Products remain without category'}</p>
                </div>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMode === 'move' && !moveToCategoryId}
            >
              {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
