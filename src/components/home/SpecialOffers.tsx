import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Tag, Plus, Minus, Check, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { optimizeImageUrl } from "@/lib/image-utils";

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2];

const SpecialOffers = () => {
  const { isRTL, language, t } = useLanguage();
  const { addItem } = useCart();
  const [selectedWeights, setSelectedWeights] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: products, isLoading } = useQuery({
    queryKey: ['discounted-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('compare_at_price', 'is', null)
        .order('sort_order', { ascending: true })
        .limit(8);

      if (error) throw error;
      // Filter only items where compare_at_price > price
      return (data || []).filter(p => p.compare_at_price && p.compare_at_price > p.price);
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  const getWeight = (id: string) => selectedWeights[id] || 1;

  const handleWeightChange = (id: string, delta: number) => {
    setSelectedWeights(prev => ({
      ...prev,
      [id]: Math.max(0.5, Math.min(10, (prev[id] || 1) + delta))
    }));
  };

  const handleAddToCart = (product: (typeof products)[0]) => {
    const weight = getWeight(product.id);
    setAddingId(product.id);
    addItem({
      id: product.id,
      name: product.name_ar,
      nameEn: product.name_en || product.name_ar,
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      unit: product.price_per || 'kg',
    }, weight, notes[product.id]?.trim() || undefined);
    setNotes(prev => ({ ...prev, [product.id]: '' }));
    setTimeout(() => setAddingId(null), 1500);
  };

  const handleWhatsAppOrder = (product: (typeof products)[0]) => {
    const weight = getWeight(product.id);
    const productNote = notes[product.id]?.trim();
    const name = `${product.name_ar} (${product.name_en || ''})`;
    const total = product.price * weight;
    const noteText = productNote ? (language === "ar" ? `\nملاحظات: ${productNote}` : `\nNotes: ${productNote}`) : '';
    const msg = language === "ar"
      ? `مرحبًا، أريد طلب: ${name} - ${weight} كيلو - ${total.toFixed(0)} د.إ${noteText}`
      : `Hello, I would like to order: ${name} - ${weight} KG - ${total.toFixed(0)} AED${noteText}`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section className="py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        {/* Section Title */}
        <div className="text-center mb-12" dir={isRTL ? "rtl" : "ltr"}>
          <div className="inline-flex items-center gap-2 text-destructive mb-3">
            <Tag className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {isRTL ? 'عروض لفترة محدودة' : 'Limited Time Offers'}
            </span>
          </div>
          <h2 className="text-3xl lg:text-[40px] font-bold text-foreground">
            {isRTL ? 'العروض الخاصة' : 'Special Offers'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isRTL ? 'وفّر أكثر مع عروضنا المميزة على أجود أنواع اللحوم' : 'Save more with our special deals on premium meats'}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" dir={isRTL ? "rtl" : "ltr"}>
          {products.map((product) => {
            const weight = getWeight(product.id);
            const totalPrice = product.price * weight;
            const discountPercent = Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100);
            const isAdding = addingId === product.id;

            return (
              <div
                key={product.id}
                className="bg-background rounded-2xl overflow-hidden border border-destructive/20 group hover:shadow-xl transition-all duration-300 relative"
              >
                {/* Discount Badge */}
                <Badge className="absolute top-3 start-3 z-10 bg-destructive text-destructive-foreground text-xs px-2 py-1">
                  {discountPercent}% {isRTL ? 'خصم' : 'OFF'}
                </Badge>

                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 p-3 overflow-hidden">
                  <img
                    src={optimizeImageUrl(product.image_url, 300)}
                    alt={isRTL ? product.name_ar : (product.name_en || product.name_ar)}
                    className="w-full h-full object-contain transition-transform duration-500 will-change-transform group-hover:scale-105"
                    loading="lazy"
                    width={280}
                    height={280}
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-sm lg:text-base font-semibold text-foreground mb-0.5 line-clamp-1">
                    {isRTL ? product.name_ar : (product.name_en || product.name_ar)}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-foreground">{product.price}</span>
                    <span className="text-sm line-through text-muted-foreground">{product.compare_at_price}</span>
                    <span className="text-xs text-muted-foreground">{isRTL ? 'د.إ' : 'AED'}/{product.price_per || 'kg'}</span>
                  </div>

                  {/* Weight Selector - Compact */}
                  <div className="bg-muted/50 rounded-lg p-2 mb-2">
                    <div className="flex gap-1 mb-1.5">
                      {WEIGHT_OPTIONS.map((w) => (
                        <Button
                          key={w}
                          variant={weight === w ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-6 text-[10px] px-0.5"
                          onClick={() => setSelectedWeights(prev => ({ ...prev, [product.id]: w }))}
                        >
                          {w}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleWeightChange(product.id, -0.5)} disabled={weight <= 0.5} aria-label={isRTL ? "تقليل الوزن" : "Decrease weight"}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-bold text-sm">{weight} <span className="text-xs text-muted-foreground">{isRTL ? 'كيلو' : 'KG'}</span></span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleWeightChange(product.id, 0.5)} aria-label={isRTL ? "زيادة الوزن" : "Increase weight"}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">{t("products.total")}:</span>
                      <span className="font-bold text-sm text-primary">{totalPrice.toFixed(0)} {isRTL ? 'د.إ' : 'AED'}</span>
                    </div>
                  </div>

                  {/* Preparation Notes */}
                  <Textarea
                    value={notes[product.id] || ''}
                    onChange={(e) => setNotes(prev => ({ ...prev, [product.id]: e.target.value }))}
                    placeholder={isRTL ? 'ملاحظات التجهيز (تقطيع، تتبيل...)' : 'Preparation notes (cutting, marination...)'}
                    className="min-h-[44px] text-xs resize-none mb-2"
                    maxLength={200}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-1.5">
                    <Button
                      className="flex-1 gap-1.5 h-9 text-xs"
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <><Check className="w-3.5 h-3.5" />{t("products.added")}</>
                      ) : (
                        <><ShoppingCart className="w-3.5 h-3.5" />{t("products.addToCart")}</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => handleWhatsAppOrder(product)}
                      aria-label={isRTL ? "اطلب عبر واتساب" : "Order via WhatsApp"}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="px-8 h-12">
            <Link to="/shop">
              {isRTL ? 'تصفح جميع العروض' : 'Browse All Offers'}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
