import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { t, isRTL } = useLanguage();

  const handleWhatsApp = () => {
    window.open("https://wa.me/971566808565", "_blank");
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center" dir={isRTL ? "rtl" : "ltr"}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">{t("hero.badge")}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-up">
            {t("hero.title")}
            <span className="block text-primary mt-2">{t("hero.subtitle")}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up">
            {t("hero.description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8 py-6" asChild>
              <Link to="/checkout">
                <ShoppingBag className="w-5 h-5" />
                {t("cta.orderNow")}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2 text-lg px-8 py-6"
              asChild
            >
              <Link to="/shop">
                <Store className="w-5 h-5" />
                {t("cta.browseProductsPage")}
              </Link>
            </Button>
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 text-lg px-8 py-6 bg-green-600 hover:bg-green-700"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-5 h-5" />
              {t("cta.whatsapp")}
            </Button>
          </div>

          {/* Stats - Always use English numerals */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">+6</p>
              <p className="text-sm text-muted-foreground mt-1">{t("hero.stats.years")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">+10,000</p>
              <p className="text-sm text-muted-foreground mt-1">{t("hero.stats.customers")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">{t("hero.stats.halal")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
