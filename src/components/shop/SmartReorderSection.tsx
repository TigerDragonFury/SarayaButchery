import { useState, useEffect } from 'react';
import { RefreshCw, ShoppingCart, Trash2, Mic, Clock, Star, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSmartReorder, OrderPreference } from '@/hooks/useSmartReorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Import products to get images and prices
import { allProducts } from '@/data/menuProducts';

interface SmartReorderSectionProps {
  className?: string;
}

export function SmartReorderSection({ className }: SmartReorderSectionProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const {
    preferences,
    loading,
    isAuthenticated,
    reorderProduct,
    deletePreference,
  } = useSmartReorder();

  // Get product details by ID
  const getProductDetails = (productId: string) => {
    return allProducts.find((p) => p.id === productId);
  };

  // Format date
  const formatLastOrdered = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return isRTL ? 'اليوم' : 'Today';
    if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday';
    if (diffDays < 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return isRTL ? `منذ ${weeks} أسابيع` : `${weeks} weeks ago`;
    }
    const months = Math.floor(diffDays / 30);
    return isRTL ? `منذ ${months} أشهر` : `${months} months ago`;
  };

  // Don't show if not authenticated or no preferences
  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (preferences.length === 0) return null;

  const handleReorder = (preference: OrderPreference) => {
    const product = getProductDetails(preference.product_id);
    reorderProduct(preference, product?.image);
  };

  return (
    <Card className={`${className} border-primary/20 bg-gradient-to-br from-primary/5 to-transparent`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="w-5 h-5 text-primary" />
          {isRTL ? 'اطلب مرة أخرى' : 'Order Again'}
          <Badge variant="secondary" className="ms-auto">
            {preferences.length} {isRTL ? 'منتج' : 'items'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isRTL
            ? 'قطعك المفضلة جاهزة للطلب السريع'
            : 'Your favorite cuts ready for quick reorder'}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {preferences.slice(0, 5).map((preference) => {
          const product = getProductDetails(preference.product_id);

          return (
            <div
              key={preference.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
            >
              {/* Product Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                {product?.image ? (
                  <img
                    src={product.image}
                    alt={preference.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">
                  {isRTL ? preference.product_name : preference.product_name_en || preference.product_name}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-primary">
                    {preference.preferred_quantity} {preference.preferred_unit === 'kg' ? (isRTL ? 'كجم' : 'KG') : preference.preferred_unit === 'piece' ? (isRTL ? 'قطعة' : 'pcs') : (isRTL ? 'صندوق' : 'box')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatLastOrdered(preference.last_ordered_at)}
                  </span>
                </div>

                {/* Saved notes indicator */}
                {preference.preferred_notes && (
                  <p className="text-xs text-muted-foreground mt-1 truncate italic">
                    "{preference.preferred_notes}"
                  </p>
                )}

                {/* Voice note indicator */}
                {preference.last_voice_note_path && (
                  <div className="flex items-center gap-1 mt-1">
                    <Mic className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {isRTL ? 'ملاحظة صوتية محفوظة' : 'Voice note saved'}
                    </span>
                  </div>
                )}

                {/* Order count badge */}
                {preference.order_count > 1 && (
                  <Badge variant="outline" className="mt-1 text-xs py-0">
                    <Star className="w-3 h-3 me-1 fill-current" />
                    {isRTL ? `${preference.order_count} طلبات` : `Ordered ${preference.order_count}x`}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleReorder(preference)}
                  className="h-8"
                >
                  <ShoppingCart className="w-4 h-4 me-1" />
                  {isRTL ? 'اطلب' : 'Add'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isRTL ? 'إزالة من المفضلة؟' : 'Remove from favorites?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isRTL
                          ? 'سيتم حذف تفضيلات هذا المنتج نهائياً'
                          : 'This will permanently remove your preferences for this product'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deletePreference(preference.id)}>
                        {isRTL ? 'حذف' : 'Remove'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}

        {preferences.length > 5 && (
          <Button variant="ghost" className="w-full text-sm">
            {isRTL ? `عرض ${preferences.length - 5} منتجات أخرى` : `View ${preferences.length - 5} more items`}
            <ChevronRight className="w-4 h-4 ms-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
