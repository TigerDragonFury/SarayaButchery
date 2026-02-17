import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePixel } from "@/contexts/PixelContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ShoppingBag, Check, Truck, Star, Clock, Flame, Percent } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";

// Import product images
import ribeyeSteak from "@/assets/products/ribeye-steak.png";
import lambChops from "@/assets/products/lamb-chops.jpg";
import chickenDrumsticks from "@/assets/products/chicken-drumsticks.jpg";
import burgerPatties from "@/assets/products/burger-patties.png";
import shishTawook from "@/assets/products/shish-tawook.png";
import beefCubes from "@/assets/products/beef-cubes.png";

const dailyOffers = [
  {
    id: "ribeye-offer",
    name: "ستيك ريب آي",
    nameEn: "Ribeye Steak",
    originalPrice: 120,
    salePrice: 89,
    discount: 26,
    image: ribeyeSteak,
    badge: "hot",
  },
  {
    id: "lamb-chops-offer",
    name: "ريش غنم",
    nameEn: "Lamb Chops",
    originalPrice: 95,
    salePrice: 75,
    discount: 21,
    image: lambChops,
    badge: "popular",
  },
  {
    id: "chicken-drumsticks-offer",
    name: "أفخاذ دجاج",
    nameEn: "Chicken Drumsticks",
    originalPrice: 45,
    salePrice: 35,
    discount: 22,
    image: chickenDrumsticks,
  },
  {
    id: "burger-patties-offer",
    name: "برجر لحم بقري",
    nameEn: "Beef Burger Patties",
    originalPrice: 65,
    salePrice: 49,
    discount: 25,
    image: burgerPatties,
    badge: "new",
  },
  {
    id: "shish-tawook-offer",
    name: "شيش طاووق",
    nameEn: "Shish Tawook",
    originalPrice: 55,
    salePrice: 42,
    discount: 24,
    image: shishTawook,
  },
  {
    id: "beef-cubes-offer",
    name: "مكعبات لحم بقري",
    nameEn: "Beef Cubes",
    originalPrice: 85,
    salePrice: 65,
    discount: 24,
    image: beefCubes,
  },
];

const OffersLandingPage = () => {
  const { language, isRTL } = useLanguage();
  const { trackEvent } = usePixel();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    // Track landing page view for ads
    trackEvent("ViewContent", {
      content_name: "Daily Offers Landing Page",
      content_category: "Ad Landing",
      content_type: "sale",
    });
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 }; // Reset
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleWhatsApp = (productName: string) => {
    trackEvent("Contact", { content_name: productName, method: "whatsapp" });
    const message = language === "ar" 
      ? `مرحبًا، أريد طلب ${productName} بسعر العرض`
      : `Hello, I would like to order ${productName} at the offer price`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleOrderClick = () => {
    trackEvent("InitiateCheckout", {
      content_name: "Daily Offers Landing",
      content_category: "Conversion",
    });
  };

  const getBadgeContent = (badge?: string) => {
    if (!badge) return null;
    
    const badges: Record<string, { label: string; labelEn: string; icon: React.ReactNode; className: string }> = {
      hot: { 
        label: "الأكثر مبيعاً", 
        labelEn: "Hot", 
        icon: <Flame className="w-3 h-3" />,
        className: "bg-red-500"
      },
      popular: { 
        label: "شائع", 
        labelEn: "Popular", 
        icon: <Star className="w-3 h-3" />,
        className: "bg-yellow-500"
      },
      new: { 
        label: "جديد", 
        labelEn: "New", 
        icon: null,
        className: "bg-green-500"
      },
    };

    const b = badges[badge];
    if (!b) return null;

    return (
      <Badge className={`${b.className} text-white gap-1`}>
        {b.icon}
        {language === "ar" ? b.label : b.labelEn}
      </Badge>
    );
  };

  return (
    <>
      <SEOHead
        title="عروض اليوم | خصومات حصرية على اللحوم"
        titleEn="Daily Offers | Exclusive Meat Discounts"
        description="عروض يومية حصرية على أجود اللحوم - خصومات تصل لـ 30% لفترة محدودة"
        descriptionEn="Exclusive daily offers on premium meat - Up to 30% off for limited time"
        canonical="/landing/offers"
      />

      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero Section with Countdown */}
        <section className="relative bg-gradient-to-br from-red-500/20 via-background to-background py-12 lg:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-red-500 text-white animate-pulse gap-1">
                <Percent className="w-4 h-4" />
                {language === "ar" ? "خصومات حصرية" : "Exclusive Discounts"}
              </Badge>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                {language === "ar" ? "عروض اليوم" : "Daily Offers"}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                {language === "ar" 
                  ? "خصومات تصل لـ 30% على أجود اللحوم" 
                  : "Up to 30% off on premium quality meat"}
              </p>

              {/* Countdown Timer */}
              <div className="flex justify-center gap-4 mb-8">
                <div className="bg-foreground text-background rounded-lg p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-xs uppercase">{language === "ar" ? "ساعة" : "Hours"}</div>
                </div>
                <div className="bg-foreground text-background rounded-lg p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-xs uppercase">{language === "ar" ? "دقيقة" : "Minutes"}</div>
                </div>
                <div className="bg-foreground text-background rounded-lg p-4 min-w-[80px]">
                  <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-xs uppercase">{language === "ar" ? "ثانية" : "Seconds"}</div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>{language === "ar" ? "100% حلال" : "100% Halal"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>{language === "ar" ? "توصيل سريع" : "Fast Delivery"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>{language === "ar" ? "جودة مضمونة" : "Quality Guaranteed"}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="gap-2 text-lg px-10 h-14 bg-red-500 hover:bg-red-600"
                onClick={handleOrderClick}
                asChild
              >
                <Link to="/shop">
                  <ShoppingBag className="w-5 h-5" />
                  {language === "ar" ? "تسوق الآن" : "Shop Now"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Offers Grid */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailyOffers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
                  {/* Discount badge */}
                  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center font-bold">
                    <span className="text-lg leading-none">-{offer.discount}%</span>
                  </div>

                  {/* Product badge */}
                  {offer.badge && (
                    <div className="absolute top-3 right-3 z-10">
                      {getBadgeContent(offer.badge)}
                    </div>
                  )}

                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={offer.image} 
                      alt={language === "ar" ? offer.name : offer.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold mb-2">
                      {language === "ar" ? offer.name : offer.nameEn}
                    </h3>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {offer.salePrice} AED
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        {offer.originalPrice} AED
                      </span>
                    </div>

                    <Button 
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWhatsApp(language === "ar" ? offer.name : offer.nameEn)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {language === "ar" ? "اطلب الآن" : "Order Now"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Urgency Section */}
        <section className="py-12 bg-red-500 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-6 h-6" />
              <span className="text-lg font-medium">
                {language === "ar" ? "العرض ينتهي اليوم!" : "Offer Ends Today!"}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-6">
              {language === "ar" 
                ? "لا تفوّت الفرصة - اطلب الآن!" 
                : "Don't Miss Out - Order Now!"}
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-white text-red-500 hover:bg-white/90"
                onClick={() => handleWhatsApp("عروض اليوم")}
              >
                <MessageCircle className="w-5 h-5" />
                {language === "ar" ? "اطلب عبر واتساب" : "Order via WhatsApp"}
              </Button>
              
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-white text-white hover:bg-white/10"
              >
                <Link to="/shop">
                  <ShoppingBag className="w-5 h-5" />
                  {language === "ar" ? "تصفح المنتجات" : "Browse Products"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2024 Al Saraya Butchery LLC. All rights reserved.</p>
            <Link to="/" className="text-primary hover:underline mt-2 inline-block">
              {language === "ar" ? "العودة للموقع الرئيسي" : "Back to Main Site"}
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default OffersLandingPage;
