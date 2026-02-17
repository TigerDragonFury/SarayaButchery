import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Flame, Plus, Minus, Check, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImageUrl } from "@/lib/image-utils";

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2];

const BestSellers = () => {
  const { t, isRTL, language } = useLanguage();
  const { addItem } = useCart();
  const [selectedWeights, setSelectedWeights] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  // Fetch best seller product IDs from store_settings
  const { data: bestSellerIds } = useQuery({
    queryKey: ['best-sellers-setting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'best_sellers')
        .single();
      if (error || !data) return [];
      return (data.value as string[]) || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch actual products by IDs
  const { data: products, isLoading } = useQuery({
    queryKey: ['best-sellers-products', bestSellerIds],
    queryFn: async () => {
      if (!bestSellerIds || bestSellerIds.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', bestSellerIds)
        .eq('is_active', true);
      if (error) throw error;
      // Sort by the order in bestSellerIds
      return (data || []).sort((a, b) => 
        bestSellerIds.indexOf(a.id) - bestSellerIds.indexOf(b.id)
      );
    },
    enabled: !!bestSellerIds && bestSellerIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const handleWeightChange = (productId: string, delta: number) => {
    setSelectedWeights(prev => ({
      ...prev,
      [productId]: Math.max(0.5, Math.min(10, (prev[productId] || 1) + delta))
    }));
  };

  const setWeight = (productId: string, weight: number) => {
    setSelectedWeights(prev => ({...prev, [productId]: weight}));
  };

  const handleAddToCart = (product: any) => {
    const weight = selectedWeights[product.id] || 1;
    setAddingId(product.id);
    addItem({
      id: `bestseller-${product.id}-${weight}`,
      name: product.name_ar,
      nameEn: product.name_en || product.name_ar,
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      unit: language === "ar" ? "كيلو" : "KG",
    }, weight);
    setTimeout(() => setAddingId(null), 1500);
  };

  const handleWhatsAppOrder = (product: any) => {
    const weight = selectedWeights[product.id] || 1;
    const productName = `${product.name_ar} (${product.name_en || product.name_ar})`;
    const totalPrice = product.price * weight;
    const message = language === "ar"
      ? `مرحبًا، أريد طلب: ${productName} - ${weight} كيلو - ${totalPrice.toFixed(0)} د.إ`
      : `Hello, I would like to order: ${productName} - ${weight} KG - ${totalPrice.toFixed(0)} AED`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Don't render if no best sellers configured
  if (!products || products.length === 0) {
    if (isLoading) {
      return (
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        {/* Section Title */}
        <div className="text-center mb-12 lg:mb-14" dir={isRTL ? "rtl" : "ltr"}>
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <Flame className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {t("bestSellers.tagline")}
            </span>
          </div>
          <h2 className="text-3xl lg:text-[40px] font-bold text-foreground">
            {t("bestSellers.title")}
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" dir={isRTL ? "rtl" : "ltr"}>
          {products.map((product) => {
            const weight = selectedWeights[product.id] || 1;
            const totalPrice = product.price * weight;
            const isAdding = addingId === product.id;
            
            return (
              <div
                key={product.id}
                className="bg-muted/30 rounded-2xl overflow-hidden border border-border/50 group hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 p-4 overflow-hidden">
                  <img
                    src={optimizeImageUrl(product.image_url, 400)}
                    alt={language === "ar" ? product.name_ar : (product.name_en || product.name_ar)}
                    className="w-full h-full object-contain transition-transform duration-500 will-change-transform group-hover:scale-105"
                    loading="lazy"
                    width={300}
                    height={300}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-0.5">
                    {language === "ar" ? product.name_ar : (product.name_en || product.name_ar)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === "ar" ? (product.description_ar || '') : (product.description_en || product.description_ar || '')}
                  </p>
                  
                  {/* Price per KG */}
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-lg font-bold text-foreground">{product.price}</span>
                    <span className="text-sm text-muted-foreground">{t("cart.currency")}/{isRTL ? "كيلو" : "KG"}</span>
                  </div>

                  {/* Weight Selector */}
                  <div className="bg-background/50 rounded-lg p-2 mb-3">
                    {/* Quick Options */}
                    <div className="flex gap-1 mb-2">
                      {WEIGHT_OPTIONS.map((w) => (
                        <Button
                          key={w}
                          variant={weight === w ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-7 text-xs px-1"
                          onClick={() => setWeight(product.id, w)}
                        >
                          {w}
                        </Button>
                      ))}
                    </div>
                    
                    {/* +/- Controls */}
                    <div className="flex items-center justify-between bg-muted rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleWeightChange(product.id, -0.5)}
                        disabled={weight <= 0.5}
                        aria-label={isRTL ? "تقليل الوزن" : "Decrease weight"}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="text-center">
                        <span className="font-bold">{weight}</span>
                        <span className="text-xs text-muted-foreground ms-1">
                          {isRTL ? "كيلو" : "KG"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleWeightChange(product.id, 0.5)}
                        aria-label={isRTL ? "زيادة الوزن" : "Increase weight"}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Total Price */}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">{t("products.total")}:</span>
                      <span className="font-bold text-primary">{totalPrice.toFixed(0)} {t("cart.currency")}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2 h-10"
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t("products.added")}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          {t("products.addToCart")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => handleWhatsAppOrder(product)}
                      aria-label={isRTL ? "اطلب عبر واتساب" : "Order via WhatsApp"}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="px-8 h-12">
            <Link to="/shop">
              {t("bestSellers.viewAll")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
