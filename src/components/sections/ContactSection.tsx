import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreSettings, getFullAddress, getWhatsAppUrl } from "@/hooks/useStoreSettings";

const ContactSection = () => {
  const { t, isRTL, language } = useLanguage();
  const { settings } = useStoreSettings();

  const contactInfo = [
    {
      icon: Phone,
      titleKey: "contact.phone",
      value: settings.contact.phone,
    },
    {
      icon: Mail,
      titleKey: "contact.email",
      value: settings.contact.email,
    },
    {
      icon: MapPin,
      titleKey: "contact.location",
      value: getFullAddress(settings.location, isRTL),
    },
    {
      icon: Clock,
      titleKey: "contact.hours",
      value: isRTL ? settings.hours.display_ar : settings.hours.display_en,
    },
  ];

  const handleWhatsApp = () => {
    const message = language === "ar" 
      ? "مرحبًا، أريد الاستفسار عن خدماتكم"
      : "Hello, I would like to inquire about your services";
    window.open(getWhatsAppUrl(settings.contact, message), "_blank");
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            {t("contact.tagline")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("contact.description")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12" dir={isRTL ? "rtl" : "ltr"}>
          {/* Contact Form */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">{t("contact.sendMessage")}</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t("contact.name")}
                    </label>
                    <Input
                      placeholder={t("contact.namePlaceholder")}
                      className={isRTL ? "text-right" : "text-left"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t("contact.phone")}
                    </label>
                    <Input
                      placeholder={t("contact.phonePlaceholder")}
                      type="tel"
                      className={isRTL ? "text-right" : "text-left"}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("contact.email")}
                  </label>
                  <Input
                    placeholder={t("contact.emailPlaceholder")}
                    type="email"
                    className={isRTL ? "text-right" : "text-left"}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("contact.subject")}
                  </label>
                  <Input
                    placeholder={t("contact.subjectPlaceholder")}
                    className={isRTL ? "text-right" : "text-left"}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("contact.message")}
                  </label>
                  <Textarea
                    placeholder={t("contact.messagePlaceholder")}
                    rows={4}
                    className={`resize-none ${isRTL ? "text-right" : "text-left"}`}
                  />
                </div>
                <Button className="w-full gap-2" size="lg">
                  <Send className="w-5 h-5" />
                  {t("cta.sendMessage")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* WhatsApp CTA */}
            <Card className="border-0 shadow-xl bg-green-600 text-white overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <MessageCircle className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">{t("contact.whatsappTitle")}</h3>
                <p className="text-white/80 mb-4">
                  {t("contact.whatsappDescription")}
                </p>
                <Button
                  variant="secondary"
                  className="bg-white text-green-600 hover:bg-white/90 gap-2"
                  size="lg"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("cta.startChat")}
                </Button>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-foreground text-sm mb-1">{t(info.titleKey)}</h4>
                    <p className="text-muted-foreground text-sm">
                      {info.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Google Maps */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <iframe
                src={settings.location.google_maps_embed}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("contact.location")}
                className="w-full"
              />
              <a
                href={settings.location.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 text-center text-sm text-primary hover:underline bg-muted/50"
              >
                <MapPin className={`w-4 h-4 inline-block ${isRTL ? "ml-1" : "mr-1"}`} />
                {t("contact.openInMaps")}
              </a>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
