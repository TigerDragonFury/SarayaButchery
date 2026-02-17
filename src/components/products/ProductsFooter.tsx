import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductsFooter = () => {
  const { language, isRTL } = useLanguage();

  const content = {
    ar: {
      title: "ملحمة السرايا",
      subtitle: "جودة لا مثيل لها منذ 2019",
      contactTitle: "تواصل معنا",
      phone: "971566808565+",
      location: "برج الهناء، شارع الشولة 7، البطين، أبوظبي",
      hours: "8 صباحاً - 11 مساءً يومياً",
      openMaps: "افتح في الخرائط",
      whatsapp: "واتساب",
      copyright: "© 2024 ملحمة السرايا. جميع الحقوق محفوظة.",
    },
    en: {
      title: "Al Saraya Butchery",
      subtitle: "Unmatched Quality Since 2019",
      contactTitle: "Contact Us",
      phone: "+971566808565",
      location: "Al Hana Tower, 7 Ash Shoulah Street, Al Bateen, Abu Dhabi",
      hours: "8 AM - 11 PM Daily",
      openMaps: "Open in Maps",
      whatsapp: "WhatsApp",
      copyright: "© 2024 Al Saraya Butchery. All rights reserved.",
    },
  };

  const t = content[language];

  const handlePhone = () => {
    window.open("tel:+971566808565", "_self");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/971566808565", "_blank");
  };

  const handleMaps = () => {
    window.open("https://maps.app.goo.gl/9aWnaRme1t6AtXTp6", "_blank");
  };

  return (
    <footer className="bg-muted/50 border-t border-border py-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-2">{t.title}</h3>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4">{t.contactTitle}</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="tel:+971566808565"
                  className="hover:text-primary transition-colors"
                  dir="ltr"
                >
                  {t.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{t.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm">{t.hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button variant="outline" className="gap-2" onClick={handlePhone}>
            <Phone className="w-4 h-4" />
            {t.phone}
          </Button>
          <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleWhatsApp}>
            <MessageCircle className="w-4 h-4" />
            {t.whatsapp}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleMaps}>
            <MapPin className="w-4 h-4" />
            {t.openMaps}
          </Button>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
          {t.copyright}
        </div>
      </div>
    </footer>
  );
};

export default ProductsFooter;
