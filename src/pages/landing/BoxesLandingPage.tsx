import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePixel } from "@/contexts/PixelContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ShoppingBag, Check, Truck, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";

// Import box images
import hebaBox from "@/assets/products/heba-box.jpg";
import familyBox from "@/assets/products/family-box.jpg";
import burgerBoxSmall from "@/assets/products/burger-box-small.jpg";
import burgerBox from "@/assets/products/burger-box.jpg";
import meatBox from "@/assets/products/meat-box.jpg";

const boxes = [
  {
    id: "heba-box",
    name: "هبة بوكس",
    nameEn: "Heba Box",
    price: 85,
    image: hebaBox,
    trending: true,
    items: ["1 كغ لحم بقري مفروم", "1 كغ صدور دجاج", "1 كغ ريش غنم"],
  },
  {
    id: "family-box",
    name: "بوكس العائلة",
    nameEn: "Family Box",
    price: 349,
    persons: "5-7",
    image: familyBox,
    items: ["2 كغ لحم بقري", "2 كغ دجاج", "1.5 كغ لحم غنم", "كباب وكفتة"],
  },
  {
    id: "meat-box",
    name: "بوكس المناسبات",
    nameEn: "Festive Dipping Box",
    price: 599,
    persons: "10-15",
    image: meatBox,
    items: ["4 كغ لحوم متنوعة", "3 كغ دجاج", "2 كغ مشاوي جاهزة"],
  },
  {
    id: "burger-box-16",
    name: "بوكس برجر 16 قطعة",
    nameEn: "Burger Box 16 Pieces",
    price: 225,
    image: burgerBox,
    items: ["16 قطعة برجر لحم بقري", "صوص خاص", "خبز برجر"],
  },
  {
    id: "burger-box-8",
    name: "بوكس برجر 8 قطع",
    nameEn: "Burger Box 8 Pieces",
    price: 130,
    image: burgerBoxSmall,
    items: ["8 قطع برجر لحم بقري", "صوص خاص"],
  },
];

const BoxesLandingPage = () => {
  const { language, isRTL } = useLanguage();
  const { trackEvent } = usePixel();

  useEffect(() => {
    // Track landing page view for ads
    trackEvent("ViewContent", {
      content_name: "Boxes Landing Page",
      content_category: "Ad Landing",
      content_type: "product_group",
    });
  }, []);

  const handleWhatsApp = (boxName: string) => {
    trackEvent("Contact", { content_name: boxName, method: "whatsapp" });
    const message = language === "ar" 
      ? `مرحبًا، أريد طلب ${boxName}`
      : `Hello, I would like to order ${boxName}`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleOrderClick = () => {
    trackEvent("InitiateCheckout", {
      content_name: "Boxes Landing",
      content_category: "Conversion",
    });
  };

  return (
    <>
      <SEOHead
        title="بوكسات اللحوم الخاصة | عروض حصرية"
        titleEn="Special Meat Boxes | Exclusive Offers"
        description="اكتشف بوكسات اللحوم المميزة من ملحمة السرايا - توفير يصل لـ 30% مع جودة مضمونة"
        descriptionEn="Discover special meat boxes from Al Saraya Butchery - Save up to 30% with guaranteed quality"
        canonical="/landing/boxes"
      />

      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        {/* Hero Section - Minimal for fast load */}
        <section className="relative bg-gradient-to-br from-primary/20 via-background to-background py-12 lg:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                {language === "ar" ? "عرض خاص لفترة محدودة" : "Limited Time Offer"}
              </Badge>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                {language === "ar" ? "بوكسات اللحوم الخاصة" : "Special Meat Boxes"}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                {language === "ar" 
                  ? "وفّر حتى 30% مع بوكساتنا المجهزة بعناية" 
                  : "Save up to 30% with our carefully curated boxes"}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>{language === "ar" ? "100% حلال" : "100% Halal"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>{language === "ar" ? "توصيل مجاني" : "Free Delivery"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>{language === "ar" ? "+10,000 عميل سعيد" : "10,000+ Happy Customers"}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="gap-2 text-lg px-10 h-14"
                onClick={handleOrderClick}
                asChild
              >
                <Link to="/shop/boxes">
                  <ShoppingBag className="w-5 h-5" />
                  {language === "ar" ? "اطلب الآن" : "Order Now"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Boxes Grid */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxes.map((box) => (
                <Card key={box.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={box.image} 
                      alt={language === "ar" ? box.name : box.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {box.trending && (
                      <Badge className="absolute top-3 right-3 bg-primary animate-pulse">
                        {language === "ar" ? "الأكثر طلباً" : "Trending"}
                      </Badge>
                    )}
                    {box.persons && (
                      <Badge variant="secondary" className="absolute top-3 left-3">
                        {box.persons} {language === "ar" ? "أشخاص" : "persons"}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold mb-2">
                      {language === "ar" ? box.name : box.nameEn}
                    </h3>
                    
                    <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                      {box.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {box.price} <span className="text-sm font-normal">AED</span>
                      </div>
                      <Button 
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleWhatsApp(language === "ar" ? box.name : box.nameEn)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {language === "ar" ? "اطلب" : "Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Urgency Section */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-6 h-6" />
              <span className="text-lg font-medium">
                {language === "ar" ? "عرض لفترة محدودة" : "Limited Time Offer"}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-6">
              {language === "ar" 
                ? "اطلب الآن واحصل على توصيل مجاني!" 
                : "Order Now and Get Free Delivery!"}
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-background text-foreground hover:bg-background/90"
                onClick={() => handleWhatsApp("بوكس اللحوم")}
              >
                <MessageCircle className="w-5 h-5" />
                {language === "ar" ? "اطلب عبر واتساب" : "Order via WhatsApp"}
              </Button>
              
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/shop/boxes">
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

export default BoxesLandingPage;
