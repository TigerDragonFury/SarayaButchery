import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, MessageCircle, Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";

// Import butchery product images
import lambChops from "@/assets/products/lamb-chops.png";
import lambShank from "@/assets/products/lamb-shank-bone.png";
import lambLoin from "@/assets/products/lamb-loin-bone.png";
import rumpSteak from "@/assets/products/rump-steak.png";
import beefShank from "@/assets/products/beef-shank-boneless.png";
import oxtail from "@/assets/products/oxtail.png";

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2];

const FeaturedProducts = () => {
  const { t, isRTL, language } = useLanguage();
  const { addItem } = useCart();
  const { ref, isVisible } = useScrollAnimation();
  const [selectedWeights, setSelectedWeights] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const featuredProducts = [
    {
      id: "featured-1",
      name: "ريش غنم",
      nameEn: "Lamb Chops",
      desc: "ريش غنم طازجة مقطعة بعناية",
      descEn: "Fresh lamb chops carefully cut",
      price: 165,
      image: lambChops,
      isNew: true,
    },
    {
      id: "featured-2",
      name: "موزة غنم بالعظم",
      nameEn: "Lamb Shank Bone-in",
      desc: "موزة غنم طازجة مع العظم للطبخ",
      descEn: "Fresh lamb shank with bone for cooking",
      price: 85,
      image: lambShank,
    },
    {
      id: "featured-3",
      name: "لحم صدر غنم بالعظم",
      nameEn: "Lamb Loin Bone-in",
      desc: "صدر غنم فاخر مع العظم",
      descEn: "Premium lamb loin with bone",
      price: 145,
      image: lambLoin,
      isOnSale: true,
      originalPrice: 165,
    },
    {
      id: "featured-4",
      name: "ستيك رامب",
      nameEn: "Rump Steak",
      desc: "ستيك بقري فاخر للشوي",
      descEn: "Premium beef steak for grilling",
      price: 120,
      image: rumpSteak,
      isNew: true,
    },
    {
      id: "featured-5",
      name: "لحم بقري بدون عظم",
      nameEn: "Boneless Beef Shank",
      desc: "لحم بقري طازج بدون عظم",
      descEn: "Fresh boneless beef shank",
      price: 75,
      image: beefShank,
    },
    {
      id: "featured-6",
      name: "ذيل بقري",
      nameEn: "Oxtail",
      desc: "ذيل بقري طازج للطبخ البطيء",
      descEn: "Fresh oxtail for slow cooking",
      price: 95,
      image: oxtail,
      isOnSale: true,
      originalPrice: 110,
    },
  ];

  const getWeight = (productId: string) => selectedWeights[productId] || 1;
  const getNote = (productId: string) => notes[productId] || "";

  const handleWeightChange = (productId: string, delta: number) => {
    setSelectedWeights(prev => ({
      ...prev,
      [productId]: Math.max(0.5, Math.min(10, (prev[productId] || 1) + delta))
    }));
  };

  const setWeight = (productId: string, weight: number) => {
    setSelectedWeights(prev => ({...prev, [productId]: weight}));
  };

  const setNote = (productId: string, note: string) => {
    setNotes(prev => ({...prev, [productId]: note}));
  };

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
    const weight = getWeight(product.id);
    const note = getNote(product.id);
    setAddingId(product.id);
    addItem({
      id: `${product.id}-${weight}`,
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      image: product.image,
      unit: language === "ar" ? "كيلو" : "KG",
    }, weight, note.trim() || undefined);
    
    setTimeout(() => {
      setAddingId(null);
      setNotes(prev => ({...prev, [product.id]: ""}));
    }, 1500);
  };

  const handleWhatsAppOrder = (product: typeof featuredProducts[0]) => {
    const weight = getWeight(product.id);
    const note = getNote(product.id);
    const productName = `${product.name} (${product.nameEn})`;
    const totalPrice = product.price * weight;
    const weightText = language === "ar" ? `${weight} كيلو` : `${weight} KG`;
    const notesText = note ? (language === "ar" ? `\nملاحظات: ${note}` : `\nNotes: ${note}`) : "";
    const message = language === "ar"
      ? `مرحبًا، أريد طلب: ${productName} - ${weightText} - ${totalPrice.toFixed(0)} د.إ${notesText}`
      : `Hello, I would like to order: ${productName} - ${weightText} - ${totalPrice.toFixed(0)} AED${notesText}`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getProductName = (product: typeof featuredProducts[0]) => {
    return language === "ar" ? product.name : product.nameEn;
  };

  const getProductDesc = (product: typeof featuredProducts[0]) => {
    return language === "ar" ? product.desc : product.descEn;
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`} dir={isRTL ? "rtl" : "ltr"}>
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            {t("products.tagline")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {t("products.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("products.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" dir={isRTL ? "rtl" : "ltr"}>
          {featuredProducts.map((product, index) => {
            const weight = getWeight(product.id);
            const totalPrice = product.price * weight;
            const isAdding = addingId === product.id;
            const note = getNote(product.id);

            return (
              <Card
                key={product.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500"
                style={{ 
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(30px)"
                }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={product.image}
                    alt={getProductName(product)}
                    className="w-full h-full object-contain bg-muted/30 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={400}
                    height={300}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Badges */}
                  <div className={`absolute top-3 flex flex-col gap-2 ${isRTL ? "right-3" : "left-3"}`}>
                    {product.isNew && (
                      <Badge className="bg-primary text-primary-foreground">{t("products.new")}</Badge>
                    )}
                    {product.isOnSale && (
                      <Badge className="bg-destructive text-destructive-foreground">{t("products.sale")}</Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
                    {getProductName(product)}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {getProductDesc(product)}
                  </p>

                  {/* Price per KG */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-foreground">
                      {product.price} {t("products.currency")}
                    </span>
                    <span className="text-sm text-muted-foreground">/{isRTL ? "كيلو" : "KG"}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice} {t("products.currency")}
                      </span>
                    )}
                  </div>

                  {/* Weight Selector */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("products.selectWeight")}
                      </span>
                    </div>
                    
                    {/* Quick Weight Options */}
                    <div className="flex gap-1 mb-2">
                      {WEIGHT_OPTIONS.map((w) => (
                        <Button
                          key={w}
                          variant={weight === w ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-8 text-xs px-1"
                          onClick={() => setWeight(product.id, w)}
                        >
                          {w} {isRTL ? "كيلو" : "KG"}
                        </Button>
                      ))}
                    </div>

                    {/* Custom Weight with +/- */}
                    <div className="flex items-center justify-between bg-background rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleWeightChange(product.id, -0.5)}
                        disabled={weight <= 0.5}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="font-bold text-lg">{weight}</span>
                        <span className="text-sm text-muted-foreground ms-1">
                          {isRTL ? "كيلو" : "KG"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleWeightChange(product.id, 0.5)}
                        disabled={weight >= 10}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Live Total Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-sm font-medium">{t("products.total")}:</span>
                      <span className="text-lg font-bold text-primary">
                        {totalPrice.toFixed(0)} {t("cart.currency")}
                      </span>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="mb-3">
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(product.id, e.target.value)}
                      placeholder={t("products.notesPlaceholder")}
                      className="min-h-[50px] text-sm resize-none"
                      maxLength={200}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <>
                          <Check className="w-4 h-4 animate-scale-in" />
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
                      className="shrink-0 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => handleWhatsAppOrder(product)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link to="/shop">
              {t("cta.browseProducts")}
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
