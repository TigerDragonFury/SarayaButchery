import { useLanguage } from "@/contexts/LanguageContext";
import { Beef, Scissors, MessageCircle, Truck } from "lucide-react";

const HowToOrder = () => {
  const { t, isRTL } = useLanguage();

  const steps = [
    {
      icon: Beef,
      step: "1",
      titleKey: "howToOrder.step1.title",
      descKey: "howToOrder.step1.desc",
    },
    {
      icon: Scissors,
      step: "2",
      titleKey: "howToOrder.step2.title",
      descKey: "howToOrder.step2.desc",
    },
    {
      icon: MessageCircle,
      step: "3",
      titleKey: "howToOrder.step3.title",
      descKey: "howToOrder.step3.desc",
    },
    {
      icon: Truck,
      step: "4",
      titleKey: "howToOrder.step4.title",
      descKey: "howToOrder.step4.desc",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        {/* Section Title */}
        <div className="text-center mb-12 lg:mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl lg:text-[40px] font-bold text-foreground mb-4">
            {t("howToOrder.title")}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground">
            {t("howToOrder.subtitle")}
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative" dir={isRTL ? "rtl" : "ltr"}>
          {/* Connection Line (Desktop only) */}
          <div className="hidden lg:block absolute top-[72px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative group"
              >
                <div className="bg-background rounded-2xl p-6 lg:p-8 text-center border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full">
                  {/* Step Number Badge */}
                  <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <step.icon className="w-7 h-7 text-accent" strokeWidth={1.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-[18px] lg:text-[20px] font-bold text-foreground mb-3">
                    {t(step.titleKey)}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm lg:text-[15px] text-muted-foreground leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
                
                {/* Arrow (Desktop, between steps) */}
                {index < steps.length - 1 && (
                  <div className={`hidden lg:flex absolute top-[72px] ${isRTL ? "-left-4" : "-right-4"} w-8 h-8 bg-background border border-border rounded-full items-center justify-center z-20`}>
                    <svg 
                      className={`w-4 h-4 text-primary ${isRTL ? "rotate-180" : ""}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Trust Message */}
        <div className="text-center mt-12" dir={isRTL ? "rtl" : "ltr"}>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-background px-6 py-3 rounded-full border border-border/50">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t("howToOrder.trustMessage")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;
