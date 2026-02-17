import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tag, ShoppingCart, MessageCircle, Percent } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';

const CATEGORIES = [
  { id: 'all', nameAr: 'الكل', nameEn: 'All' },
  { id: 'lamb', nameAr: 'لحم غنم', nameEn: 'Lamb' },
  { id: 'beef', nameAr: 'لحم عجل', nameEn: 'Beef' },
  { id: 'local-veal', nameAr: 'لحم عجل محلي', nameEn: 'Local Veal' },
  { id: 'steak', nameAr: 'ستيك وقطعيات', nameEn: 'Steak' },
  { id: 'marinated', nameAr: 'لحوم متبلة', nameEn: 'Marinated' },
  { id: 'skewers', nameAr: 'مشاكيك', nameEn: 'Skewers' },
  { id: 'chicken', nameAr: 'دجاج', nameEn: 'Chicken' },
  { id: 'ready-to-cook', nameAr: 'جاهز للطهي', nameEn: 'Ready to Cook' },
  { id: 'frozen', nameAr: 'مفرزنات', nameEn: 'Frozen' },
  { id: 'offal', nameAr: 'أحشاء', nameEn: 'Offal' },
  { id: 'boxes', nameAr: 'بوكسات', nameEn: 'Boxes' },
];

const OffersPage = () => {
  const { isRTL } = useLanguage();
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: products, isLoading } = useQuery({
    queryKey: ['discounted-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('compare_at_price', 'is', null)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return (data || []).filter(p => p.compare_at_price && p.compare_at_price > p.price);
    },
    staleTime: 1000 * 60 * 5,
  });

  const filtered = selectedCategory === 'all'
    ? products
    : products?.filter(p => p.category === selectedCategory);

  const getWeight = (id: string) => weights[id] || 1;
  const setWeight = (id: string, w: number) => setWeights(prev => ({ ...prev, [id]: Math.max(0.5, w) }));

  const handleAddToCart = (product: any) => {
    const w = getWeight(product.id);
    addItem({
      id: product.id,
      name: product.name_ar,
      nameEn: product.name_en || product.name_ar,
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      unit: product.price_per || 'kg',
    }, w, notes[product.id]?.trim() || undefined);
    setNotes(prev => ({ ...prev, [product.id]: '' }));
  };

  const handleWhatsApp = (product: any) => {
    const w = getWeight(product.id);
    const productNote = notes[product.id]?.trim();
    const noteText = productNote ? (isRTL ? `\nملاحظات: ${productNote}` : `\nNotes: ${productNote}`) : '';
    const msg = isRTL
      ? `أريد طلب ${product.name_ar} - ${w} ${product.price_per || 'kg'}${noteText}`
      : `I'd like to order ${product.name_en || product.name_ar} - ${w} ${product.price_per || 'kg'}${noteText}`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Count products per category
  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === 'all'
      ? products?.length || 0
      : products?.filter(p => p.category === cat.id).length || 0,
  })).filter(cat => cat.count > 0 || cat.id === 'all');

  return (
    <PageLayout>
      <SEOHead
        title={isRTL ? 'العروض الخاصة | السرايا للحوم' : 'Special Offers | Al Saraya Butchery'}
        description={isRTL ? 'تصفح جميع العروض والخصومات على اللحوم الطازجة' : 'Browse all special offers and discounts on fresh meat'}
      />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Percent className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold font-playfair">
              {isRTL ? 'العروض الخاصة' : 'Special Offers'}
            </h1>
          </div>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            {isRTL
              ? 'أفضل العروض والخصومات على اللحوم الطازجة - وفّر أكثر مع السرايا'
              : 'Best deals and discounts on fresh meat - Save more with Al Saraya'}
          </p>
          {products && (
            <Badge variant="secondary" className="mt-4 text-base px-4 py-1">
              {products.length} {isRTL ? 'منتج بخصم' : 'discounted products'}
            </Badge>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
          {categoryCounts.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="gap-1"
            >
              {isRTL ? cat.nameAr : cat.nameEn}
              <span className="text-xs opacity-70">({cat.count})</span>
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => {
              const discount = Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100);
              const w = getWeight(product.id);
              const unit = product.price_per || 'kg';

              return (
                <div
                  key={product.id}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name_ar}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <Badge variant="destructive" className="absolute top-2 start-2 text-sm font-bold">
                      -{discount}%
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-bold text-sm line-clamp-2">
                      {isRTL ? product.name_ar : (product.name_en || product.name_ar)}
                    </h3>

                    {/* Prices */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-primary">
                        {(product.price * w).toFixed(0)} {isRTL ? 'د.إ' : 'AED'}
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        {(product.compare_at_price! * w).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {product.price} {isRTL ? 'د.إ' : 'AED'}/{unit}
                    </p>

                    {/* Weight Selector */}
                    {(unit === 'kg' || unit === 'piece') && (
                      <div className="flex items-center gap-1 justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 text-xs"
                          onClick={() => setWeight(product.id, w - 0.5)}
                        >
                          -
                        </Button>
                        <span className="text-sm font-medium w-16 text-center">
                          {w} {unit}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 text-xs"
                          onClick={() => setWeight(product.id, w + 0.5)}
                        >
                          +
                        </Button>
                      </div>
                    )}

                    {/* Preparation Notes */}
                    <Textarea
                      value={notes[product.id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [product.id]: e.target.value }))}
                      placeholder={isRTL ? 'ملاحظات التجهيز (تقطيع، تتبيل...)' : 'Preparation notes (cutting, marination...)'}
                      className="min-h-[44px] text-xs resize-none mb-2"
                      maxLength={200}
                    />

                    {/* Actions */}
                    {(product.allow_add_to_cart !== false) ? (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="flex-1 text-xs gap-1"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {isRTL ? 'أضف' : 'Add'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => handleWhatsApp(product)}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full text-xs gap-1"
                        onClick={() => handleWhatsApp(product)}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {isRTL ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {isRTL ? 'لا توجد عروض في هذا القسم حالياً' : 'No offers in this category currently'}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default OffersPage;
