import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreSettings, getFullAddress, getWhatsAppUrl } from "@/hooks/useStoreSettings";

const ContactPage = () => {
  const { toast } = useToast();
  const { t, isRTL, language } = useLanguage();
  const { settings } = useStoreSettings();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactInfo = [
    {
      icon: Phone,
      title: t("contact.phone"),
      value: settings.contact.phone,
      href: `tel:${settings.contact.phone}`,
    },
    {
      icon: Mail,
      title: t("contact.email"),
      value: settings.contact.email,
      href: `mailto:${settings.contact.email}`,
    },
    {
      icon: MapPin,
      title: t("contact.location"),
      value: getFullAddress(settings.location, isRTL),
      href: settings.location.google_maps_url,
    },
    {
      icon: Clock,
      title: t("contact.hours"),
      value: isRTL ? settings.hours.display_ar : settings.hours.display_en,
      href: null,
    },
  ];

  const handleWhatsApp = () => {
    const message = language === "ar" 
      ? "مرحبًا، أريد الاستفسار عن خدماتكم"
      : "Hello, I would like to inquire about your services";
    window.open(getWhatsAppUrl(settings.contact, message), "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("contact.messageSent"),
      description: t("contact.messageResponse"),
    });
    setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? "تواصل معنا" : "Contact Us", url: "/contact" },
  ]);

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": isRTL ? "تواصل مع ملحمة السرايا" : "Contact Al Saraya Butchery",
    "description": isRTL ? "تواصل معنا للطلبات والاستفسارات - هاتف، واتساب، بريد إلكتروني" : "Contact us for orders and inquiries - phone, WhatsApp, email",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "Al Saraya Butchery LLC",
      "telephone": "+971-23339111",
      "email": "info@alsarayabutcheryllc.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Abu Dhabi",
        "addressCountry": "AE"
      },
      "openingHours": "Mo-Su 08:00-22:00"
    }
  };

  return (
    <PageLayout>
      <SEOHead
        title={isRTL ? "تواصل معنا" : "Contact Us"}
        titleEn="Contact Us"
        description={isRTL ? "تواصل مع ملحمة السرايا - هاتف: 023339111 | واتساب للطلبات السريعة | البريد: info@alsarayabutcheryllc.com | أبوظبي، الإمارات" : "Contact Al Saraya Butchery - Phone: 023339111 | WhatsApp for quick orders | Email: info@alsarayabutcheryllc.com | Abu Dhabi, UAE"}
        descriptionEn="Contact Al Saraya Butchery - Phone: 023339111 | WhatsApp for quick orders | Email: info@alsarayabutcheryllc.com | Abu Dhabi, UAE"
        keywords="تواصل ملحمة السرايا, رقم الملحمة, عنوان الملحمة, contact Al Saraya, butchery phone number, meat shop contact UAE"
        canonical="/contact"
        schema={{ ...breadcrumbSchema, ...contactPageSchema }}
      />
      
      <PageHero
        title={t("contact.tagline")}
        titleEn="Contact Us"
        subtitle={t("contact.alwaysAtService")}
        size="sm"
      />

      <section className="py-12" aria-label={isRTL ? "نموذج التواصل" : "Contact form"}>
        <div className="container mx-auto px-4">
          <div className={`grid lg:grid-cols-2 gap-12`} dir={isRTL ? "rtl" : "ltr"}>
            {/* Contact Form */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">{t("contact.sendMessage")}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                        {t("contact.name")}
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("contact.namePlaceholder")}
                        className={isRTL ? "text-right" : "text-left"}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium text-foreground mb-2 block">
                        {t("contact.phone")}
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t("contact.phonePlaceholder")}
                        type="tel"
                        className={isRTL ? "text-right" : "text-left"}
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                      {t("contact.email")}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contact.emailPlaceholder")}
                      type="email"
                      className={isRTL ? "text-right" : "text-left"}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="text-sm font-medium text-foreground mb-2 block">
                      {t("contact.subject")}
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t("contact.subjectPlaceholder")}
                      className={isRTL ? "text-right" : "text-left"}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="text-sm font-medium text-foreground mb-2 block">
                      {t("contact.message")}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("contact.messagePlaceholder")}
                      rows={4}
                      className={`${isRTL ? "text-right" : "text-left"} resize-none`}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" size="lg">
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
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
                  <MessageCircle className="w-12 h-12 mb-4" aria-hidden="true" />
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
              <address className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-italic">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                        <info.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <h4 className="font-bold text-foreground text-sm mb-1">{info.title}</h4>
                      {info.href ? (
                        <a
                          href={info.href}
                          target={info.href.startsWith("http") ? "_blank" : undefined}
                          rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">{info.value}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </address>

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
                title={isRTL ? "موقع ملحمة السرايا على الخريطة" : "Al Saraya Butchery location"}
                className="w-full"
              />
              <a
                href={settings.location.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 text-center text-sm text-primary hover:underline bg-muted/50"
                >
                  <MapPin className={`w-4 h-4 inline-block ${isRTL ? "ml-1" : "mr-1"}`} aria-hidden="true" />
                  {t("contact.openInMaps")}
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppCTA />
    </PageLayout>
  );
};

export default ContactPage;
