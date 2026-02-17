import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Star, Calendar, Award } from "lucide-react";

const TrustStats = () => {
  const { t, isRTL } = useLanguage();

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      labelKey: "trustStats.customers",
    },
    {
      icon: Star,
      value: "5",
      suffix: "⭐",
      labelKey: "trustStats.rating",
    },
    {
      icon: Calendar,
      value: "6+",
      labelKey: "trustStats.years",
    },
    {
      icon: Award,
      value: "100%",
      labelKey: "trustStats.halal",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        {/* Section Title */}
        <div className="text-center mb-12" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl lg:text-[40px] font-bold mb-3">
            {t("trustStats.title")}
          </h2>
          <p className="text-lg text-primary-foreground/80">
            {t("trustStats.subtitle")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10" dir={isRTL ? "rtl" : "ltr"}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 lg:p-8 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm"
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <stat.icon className="w-7 h-7" />
              </div>
              
              {/* Value */}
              <div className="text-[32px] lg:text-[40px] font-bold leading-tight mb-2">
                {stat.value}{stat.suffix || ""}
              </div>
              
              {/* Label */}
              <p className="text-sm lg:text-base text-primary-foreground/80">
                {t(stat.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStats;
