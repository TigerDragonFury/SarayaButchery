import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductsHeroProps {
  onScrollToCategories: () => void;
}

const ProductsHero = ({ onScrollToCategories }: ProductsHeroProps) => {
  const { language, isRTL } = useLanguage();

  const content = {
    ar: {
      title: "تسوّق اللحوم الطازجة",
      subtitle: "أجود أنواع اللحوم الحلال - توصيل سريع لباب منزلك",
      whatsappCta: "اطلب عبر واتساب",
      browseCta: "تصفح الأقسام",
    },
    en: {
      title: "Shop Fresh Meats",
      subtitle: "Premium Halal Meats - Fast Delivery to Your Door",
      whatsappCta: "Order via WhatsApp",
      browseCta: "Browse Categories",
    },
  };

  const t = content[language];

  const handleWhatsApp = () => {
    window.open("https://wa.me/971566808565", "_blank");
  };

  return (
    <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
          {t.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-5 h-5" />
            {t.whatsappCta}
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="gap-2 min-w-[200px]"
            onClick={onScrollToCategories}
          >
            {t.browseCta}
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsHero;
