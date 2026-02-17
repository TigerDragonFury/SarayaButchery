import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ShoppingCart, Flame } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

// Import bundle images
import familyBoxImage from "@/assets/products/family-box.jpg";
import hebaBoxImage from "@/assets/products/heba-box.jpg";
import meatBoxImage from "@/assets/products/meat-box.jpg";

interface Bundle {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  image: string;
  badge?: string;
}

const bundles: Bundle[] = [
  {
    id: "family-bbq-bundle",
    nameAr: "بوكس العائلة للشوي",
    nameEn: "Family BBQ Bundle",
    descriptionAr: "تشكيلة مثالية للشوي العائلي - تكفي 5-7 أشخاص",
    descriptionEn: "Perfect grilling assortment - serves 5-7 people",
    price: 349,
    image: familyBoxImage,
    badge: "bestseller",
  },
  {
    id: "heba-box",
    nameAr: "بوكس هبة",
    nameEn: "Heba Box",
    descriptionAr: "بوكس اقتصادي للعائلات الصغيرة",
    descriptionEn: "Budget-friendly box for small families",
    price: 85,
    image: hebaBoxImage,
    badge: "trending",
  },
  {
    id: "premium-meat-box",
    nameAr: "بوكس اللحوم الفاخرة",
    nameEn: "Premium Meat Box",
    descriptionAr: "أجود قطع اللحم المختارة",
    descriptionEn: "Finest selected meat cuts",
    price: 450,
    image: meatBoxImage,
  },
];

const ProductsBundlesSection = () => {
  const { language, isRTL } = useLanguage();
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddToCart = (bundle: Bundle) => {
    setAddingId(bundle.id);
    addItem({
      id: bundle.id,
      name: bundle.nameAr,
      nameEn: bundle.nameEn,
      price: bundle.price,
      image: bundle.image,
      unit: language === "ar" ? "بوكس" : "Box",
    });
    setTimeout(() => setAddingId(null), 1500);
  };

  const handleWhatsApp = (bundle: Bundle) => {
    const name = language === "ar" ? bundle.nameAr : bundle.nameEn;
    const message = language === "ar"
      ? `مرحباً، أريد طلب ${name} بسعر ${bundle.price} د.إ`
      : `Hello, I want to order ${name} for ${bundle.price} AED`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(message)}`, "_blank");
  };

  const sectionTitle = language === "ar" ? "بوكسات وعروض خاصة" : "Special Bundles & Offers";
  const badgeLabels = {
    ar: { bestseller: "الأكثر مبيعاً", trending: "رائج" },
    en: { bestseller: "Best Seller", trending: "Trending" },
  };

  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flame className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-center">{sectionTitle}</h2>
          <Flame className="w-6 h-6 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <Card
              key={bundle.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={bundle.image}
                  alt={language === "ar" ? bundle.nameAr : bundle.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {bundle.badge && (
                  <div className="absolute top-3 start-3">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      {badgeLabels[language][bundle.badge as keyof typeof badgeLabels.ar]}
                    </span>
                  </div>
                )}
              </div>

              <CardContent className="p-4" dir={isRTL ? "rtl" : "ltr"}>
                <h3 className="font-bold text-lg mb-1">
                  {language === "ar" ? bundle.nameAr : bundle.nameEn}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {language === "ar" ? bundle.descriptionAr : bundle.descriptionEn}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {bundle.price} {language === "ar" ? "د.إ" : "AED"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleAddToCart(bundle)}
                    disabled={addingId === bundle.id}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addingId === bundle.id
                      ? (language === "ar" ? "تمت الإضافة" : "Added")
                      : (language === "ar" ? "أضف للسلة" : "Add to Cart")}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                    onClick={() => handleWhatsApp(bundle)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsBundlesSection;
