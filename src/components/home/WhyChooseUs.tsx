import { useLanguage } from "@/contexts/LanguageContext";
import { Beef, Scissors, Sparkles, Award } from "lucide-react";

const WhyChooseUs = () => {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: Beef,
      titleKey: "whyChoose.fresh.title",
      descKey: "whyChoose.fresh.desc",
    },
    {
      icon: Scissors,
      titleKey: "whyChoose.cutting.title",
      descKey: "whyChoose.cutting.desc",
    },
    {
      icon: Sparkles,
      titleKey: "whyChoose.hygiene.title",
      descKey: "whyChoose.hygiene.desc",
    },
    {
      icon: Award,
      titleKey: "whyChoose.trust.title",
      descKey: "whyChoose.trust.desc",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        {/* Section Title */}
        <div className="text-center mb-12 lg:mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl lg:text-[40px] font-bold text-foreground mb-3">
            {t("whyChoose.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("whyChoose.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" dir={isRTL ? "rtl" : "ltr"}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-6 lg:p-8 text-center shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 group"
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              
              {/* Title */}
              <h3 className="text-[18px] lg:text-[20px] font-semibold text-foreground mb-2">
                {t(feature.titleKey)}
              </h3>
              
              {/* Description */}
              <p className="text-sm lg:text-[15px] text-muted-foreground leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
