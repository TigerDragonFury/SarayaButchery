import { Button } from "@/components/ui/button";
import { MessageCircle, Truck, Clock, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WhatsAppCTAProps {
  message?: string;
  variant?: "fixed" | "inline" | "hero" | "banner";
  buttonText?: string;
}

const WHATSAPP_NUMBER = "971566808565";

const WhatsAppCTA = ({ 
  message, 
  variant = "fixed",
  buttonText
}: WhatsAppCTAProps) => {
  const { t, isRTL, language } = useLanguage();
  
  const defaultMessage = language === "ar" 
    ? "مرحبًا، أريد طلب لحوم طازجة"
    : "Hello, I would like to order fresh meat";
  
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  // Floating button with pulse animation
  if (variant === "fixed") {
    return (
      <div className={`fixed bottom-6 ${isRTL ? "right-6" : "left-6"} z-50 flex flex-col items-center gap-2`}>
        {/* Tooltip */}
        <div className="bg-foreground text-background text-xs px-3 py-1.5 rounded-full shadow-lg animate-bounce hidden sm:block">
          {t("whatsapp.orderNow")} 🔥
        </div>
        <button
          onClick={handleClick}
          className="relative w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transition-all flex items-center justify-center group"
          aria-label={t("cta.orderWhatsapp")}
        >
          {/* Single subtle pulse ring - GPU composited */}
          <span className="absolute inset-0 rounded-full bg-green-500/30 animate-pulse" style={{ willChange: 'opacity' }} />
          <MessageCircle className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  // Hero CTA - Large prominent button
  if (variant === "hero") {
    return (
      <Button
        onClick={handleClick}
        size="lg"
        className="gap-3 text-lg px-10 py-7 bg-green-500 hover:bg-green-600 text-white shadow-xl hover:shadow-green-500/30 transition-all group animate-pulse hover:animate-none"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {buttonText || t("cta.orderNowWhatsapp")}
      </Button>
    );
  }

  // Banner CTA - Full width with trust signals
  if (variant === "banner") {
    return (
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 py-4 px-4">
        <div className="container mx-auto">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4`} dir={isRTL ? "rtl" : "ltr"}>
            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>{t("whatsapp.fastDelivery")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{t("whatsapp.freshDaily")}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>{t("whatsapp.halal100")}</span>
              </div>
            </div>
            {/* CTA */}
            <Button
              onClick={handleClick}
              size="lg"
              className="gap-2 bg-white text-green-600 hover:bg-white/90 font-bold shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              {buttonText || t("whatsapp.getFreshMeat")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Inline button
  return (
    <Button
      onClick={handleClick}
      className="gap-2 bg-green-500 hover:bg-green-600 text-white"
      size="lg"
    >
      <MessageCircle className="w-5 h-5" />
      {buttonText || t("whatsapp.contactVia")}
    </Button>
  );
};

export default WhatsAppCTA;
