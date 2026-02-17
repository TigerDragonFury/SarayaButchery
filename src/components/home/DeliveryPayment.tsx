import { useLanguage } from "@/contexts/LanguageContext";
import { Truck, Clock, Shield, Banknote, CreditCard } from "lucide-react";

const DeliveryPayment = () => {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: Truck,
      titleKey: "deliveryPayment.fast.title",
      descKey: "deliveryPayment.fast.desc",
    },
    {
      icon: Clock,
      titleKey: "deliveryPayment.sameDay.title",
      descKey: "deliveryPayment.sameDay.desc",
    },
    {
      icon: Shield,
      titleKey: "deliveryPayment.secure.title",
      descKey: "deliveryPayment.secure.desc",
    },
    {
      icon: Banknote,
      titleKey: "deliveryPayment.cod.title",
      descKey: "deliveryPayment.cod.desc",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        {/* Section Title */}
        <div className="text-center mb-12 lg:mb-14" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl lg:text-[40px] font-bold text-foreground mb-3">
            {t("deliveryPayment.title")}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("deliveryPayment.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" dir={isRTL ? "rtl" : "ltr"}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-muted/50 rounded-2xl p-8 lg:p-10" dir={isRTL ? "rtl" : "ltr"}>
          <div className="text-center mb-6">
            <h3 className="text-xl lg:text-2xl font-semibold text-foreground mb-2">
              {t("deliveryPayment.methods")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("deliveryPayment.poweredBy")}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {/* Visa */}
            <div className="flex items-center gap-2 bg-background px-6 py-3 rounded-lg border border-border">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-foreground">Visa</span>
            </div>
            
            {/* MasterCard */}
            <div className="flex items-center gap-2 bg-background px-6 py-3 rounded-lg border border-border">
              <CreditCard className="w-6 h-6 text-orange-500" />
              <span className="font-semibold text-foreground">MasterCard</span>
            </div>
            
            {/* Apple Pay */}
            <div className="flex items-center gap-2 bg-background px-6 py-3 rounded-lg border border-border">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-semibold text-foreground">Apple Pay</span>
            </div>
            
            {/* Cash on Delivery */}
            <div className="flex items-center gap-2 bg-background px-6 py-3 rounded-lg border border-border">
              <Banknote className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-foreground">
                {t("deliveryPayment.cod.title")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryPayment;
