import { Truck, Clock, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import deliveryRiderImage from "@/assets/delivery-rider.jpg";

const WHATSAPP_NUMBER = "971566808565";

const DeliveryBanner = () => {
  const { t, isRTL, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleOrder = () => {
    const message = language === "ar"
      ? "مرحبًا، أريد الاستفسار عن التوصيل وطلب لحوم طازجة"
      : "Hello, I would like to inquire about delivery and order fresh meats";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5" 
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Content */}
            <div className={`p-8 md:p-12 flex flex-col justify-center ${isRTL ? "" : "order-2 md:order-1"}`}>
              <span className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-4">
                <Truck className="w-5 h-5" />
                {t("delivery.service")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("delivery.title")}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t("delivery.description")}
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("delivery.fast")}</p>
                    <p className="text-muted-foreground text-xs">{t("delivery.fastDesc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t("delivery.coverage")}</p>
                    <p className="text-muted-foreground text-xs">{t("delivery.coverageDesc")}</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={handleOrder}
                size="lg"
                className="gap-3 bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto text-lg py-6 shadow-lg hover:shadow-green-500/30"
              >
                <MessageCircle className="w-6 h-6" />
                {t("cta.orderNowWhatsapp")}
              </Button>
            </div>

            {/* Image with scroll animation */}
            <div
              className={`min-h-[300px] md:min-h-full bg-cover bg-center overflow-hidden ${isRTL ? "" : "order-1 md:order-2"}`}
            >
              <div 
                className={`w-full h-full bg-cover bg-center transition-all duration-1000 ease-out ${
                  isVisible 
                    ? "scale-100 opacity-100 translate-x-0" 
                    : isRTL 
                      ? "scale-110 opacity-0 -translate-x-10" 
                      : "scale-110 opacity-0 translate-x-10"
                }`}
                style={{
                  backgroundImage: `url(${deliveryRiderImage})`,
                }}
              >
                <div className={`w-full h-full ${isRTL ? "bg-gradient-to-r from-card/50 to-transparent md:from-card/30" : "bg-gradient-to-l from-card/50 to-transparent md:from-card/30"}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryBanner;
