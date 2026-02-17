import { Shield, Award, Truck, Clock, Star, ThumbsUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrustBadgesProps {
  variant?: "horizontal" | "grid" | "compact";
}

const getBadges = (t: (key: string) => string) => [
  {
    icon: Shield,
    title: t("trust.halal"),
    description: t("trust.halalDesc"),
  },
  {
    icon: Award,
    title: t("trust.quality"),
    description: t("trust.qualityDesc"),
  },
  {
    icon: Truck,
    title: t("trust.delivery"),
    description: t("trust.deliveryDesc"),
  },
  {
    icon: Clock,
    title: t("trust.fresh"),
    description: t("trust.freshDesc"),
  },
  {
    icon: Star,
    title: t("trust.experience"),
    description: t("trust.experienceDesc"),
  },
  {
    icon: ThumbsUp,
    title: t("trust.customers"),
    description: t("trust.customersDesc"),
  },
];

const TrustBadges = ({ variant = "horizontal" }: TrustBadgesProps) => {
  const { t, isRTL } = useLanguage();
  const badges = getBadges(t);

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 py-4" dir={isRTL ? "rtl" : "ltr"}>
        {badges.slice(0, 4).map((badge, index) => (
          <div key={index} className="flex items-center gap-2 text-muted-foreground">
            <badge.icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" dir={isRTL ? "rtl" : "ltr"}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <badge.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-foreground">{badge.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal scrolling badges
  return (
    <div className="bg-muted/50 border-y border-border py-6 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12" dir={isRTL ? "rtl" : "ltr"}>
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
