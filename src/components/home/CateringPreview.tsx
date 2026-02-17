import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Flame, Building2, Scissors, ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const CateringPreview = () => {
  const { t, isRTL, language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const services = [
    {
      icon: Users,
      titleKey: "catering.service.wedding",
      descKey: "catering.service.weddingDesc",
      href: "/catering/wedding",
    },
    {
      icon: Flame,
      titleKey: "catering.service.bbq",
      descKey: "catering.service.bbqDesc",
      href: "/catering/bbq",
    },
    {
      icon: Building2,
      titleKey: "catering.service.corporate",
      descKey: "catering.service.corporateDesc",
      href: "/catering/corporate",
    },
    {
      icon: Scissors,
      titleKey: "catering.service.carcass",
      descKey: "catering.service.carcassDesc",
      href: "/catering/events",
    },
  ];

  const handleWhatsApp = () => {
    const message = language === "ar"
      ? "مرحبًا، أريد الاستفسار عن خدمات التموين"
      : "Hello, I would like to inquire about catering services";
    window.open(`https://wa.me/023339111?text=${encodeURIComponent(message)}`, "_blank");
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-20 relative overflow-hidden bg-foreground text-background">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center" dir={isRTL ? "rtl" : "ltr"}>
          {/* Content */}
          <div className={`transition-all duration-1000 ${
            isVisible 
              ? "opacity-100 translate-x-0" 
              : isRTL ? "opacity-0 translate-x-10" : "opacity-0 -translate-x-10"
          }`}>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">
              {t("catering.tagline")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">
              {t("catering.title")}
            </h2>
            <p className="text-background/70 text-lg mb-8 leading-relaxed">
              {t("catering.description")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="bg-background/5 border-background/10 hover:bg-background/10 transition-colors"
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-background mb-1">{t(service.titleKey)}</h3>
                      <p className="text-xs text-background/60">{t(service.descKey)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/catering">
                  {t("cta.exploreServices")}
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-background/30 text-background hover:bg-background/10"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-5 h-5" />
                {t("cta.getQuote")}
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible 
              ? "opacity-100 translate-x-0 scale-100" 
              : isRTL ? "opacity-0 -translate-x-10 scale-95" : "opacity-0 translate-x-10 scale-95"
          }`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=700&fit=crop"
                alt={t("catering.title")}
                className="w-full h-[500px] object-cover"
                loading="lazy"
                width={600}
                height={700}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className={`absolute bottom-6 left-6 right-6 text-white`} dir={isRTL ? "rtl" : "ltr"}>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm opacity-80">{t("catering.stats")}</p>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className={`absolute -top-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl ${isRTL ? "-left-4" : "-right-4"}`} />
            <div className={`absolute -bottom-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl ${isRTL ? "-right-4" : "-left-4"}`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CateringPreview;
