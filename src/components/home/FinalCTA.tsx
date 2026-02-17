import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const FinalCTA = () => {
  const { t, isRTL, language } = useLanguage();

  const handleWhatsApp = () => {
    const message = language === "ar" 
      ? "مرحبًا، أريد طلب لحوم طازجة"
      : "Hello, I would like to order fresh meat";
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        <div className="text-center max-w-3xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-[48px] font-bold leading-tight mb-4">
            {t("finalCTA.title")}
          </h2>
          
          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-background/80 mb-10">
            {t("finalCTA.subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6">
            {/* WhatsApp Order */}
            <Button
              size="lg"
              className="w-full sm:w-auto gap-3 text-lg lg:text-xl px-10 h-14 lg:h-16 bg-green-600 hover:bg-green-700 shadow-xl hover:shadow-green-500/30 transition-all group"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {t("finalCTA.whatsapp")}
            </Button>
            
            {/* Order Now */}
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto gap-3 text-lg lg:text-xl px-10 h-14 lg:h-16 bg-primary hover:bg-primary/90"
            >
              <Link to="/shop">
                <ShoppingBag className="w-6 h-6" />
                {t("finalCTA.order")}
              </Link>
            </Button>
          </div>

          {/* Trust Note */}
          <p className="mt-8 text-sm text-background/60">
            {t("finalCTA.trust")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
