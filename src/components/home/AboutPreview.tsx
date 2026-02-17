import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, Shield, Leaf, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutPreview = () => {
  const { t, isRTL } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    {
      icon: Shield,
      titleKey: "about.feature.halal",
      descKey: "about.feature.halalDesc",
    },
    {
      icon: Leaf,
      titleKey: "about.feature.fresh",
      descKey: "about.feature.freshDesc",
    },
    {
      icon: Award,
      titleKey: "about.feature.quality",
      descKey: "about.feature.qualityDesc",
    },
    {
      icon: Heart,
      titleKey: "about.feature.service",
      descKey: "about.feature.serviceDesc",
    },
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center" dir={isRTL ? "rtl" : "ltr"}>
          {/* Image */}
          <div className={`relative transition-all duration-1000 ${
            isVisible 
              ? "opacity-100 translate-x-0" 
              : isRTL ? "opacity-0 translate-x-10" : "opacity-0 -translate-x-10"
          } ${isRTL ? "order-2 lg:order-1" : "order-2 lg:order-2"}`}>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&h=500&fit=crop"
                alt={t("header.title")}
                className="rounded-2xl shadow-2xl w-full"
                loading="lazy"
                width={600}
                height={500}
              />
              {/* Experience Badge */}
              <div className={`absolute -bottom-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-xl ${isRTL ? "-left-6" : "-right-6"}`}>
                <p className="text-4xl font-bold">{isRTL ? "+14" : "14+"}</p>
                <p className="text-sm">{t("about.experience")}</p>
              </div>
            </div>
            {/* Decorative */}
            <div className={`absolute -top-8 w-40 h-40 bg-accent/10 rounded-full blur-3xl ${isRTL ? "-right-8" : "-left-8"}`} />
          </div>

          {/* Content */}
          <div className={`transition-all duration-1000 delay-200 ${
            isVisible 
              ? "opacity-100 translate-x-0" 
              : isRTL ? "opacity-0 -translate-x-10" : "opacity-0 translate-x-10"
          } ${isRTL ? "order-1 lg:order-2" : "order-1 lg:order-1"}`}>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">
              {t("about.tagline")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
              {t("about.title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              {t("about.description1")}
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t("about.description2")}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{t(feature.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground">{t(feature.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="gap-2">
              <Link to="/about">
                {t("cta.learnMoreAbout")}
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
