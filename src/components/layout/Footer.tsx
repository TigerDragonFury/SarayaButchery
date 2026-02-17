import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t, isRTL } = useLanguage();

  const quickLinks = [
    { labelKey: "nav.home", href: "/" },
    { labelKey: "nav.butchery", href: "/shop" },
    { labelKey: "nav.catering", href: "/catering" },
    { labelKey: "nav.about", href: "/about" },
    { labelKey: "nav.contact", href: "/contact" },
  ];

  const legalLinks = [
    { labelAr: "الشروط والأحكام", labelEn: "Terms & Conditions", href: "/terms" },
    { labelAr: "سياسة الاسترجاع", labelEn: "Refund Policy", href: "/refund-policy" },
    { labelAr: "سياسة الدفع", labelEn: "Payment Policy", href: "/payment-policy" },
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10" dir={isRTL ? "rtl" : "ltr"}>
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt={t("header.title")} className="h-16 w-auto rounded-lg" />
              <div>
                <h2 className="text-xl font-bold text-background">{t("header.title")}</h2>
                <p className="text-xs text-background/60">{t("header.subtitle")}</p>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("footer.quickLinks")}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.labelKey}>
                  <a href={link.href} className="text-background/70 hover:text-accent transition-colors text-sm">
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
            
            <h3 className="text-lg font-bold mt-6 mb-4">{isRTL ? "السياسات" : "Policies"}</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-background/70 hover:text-accent transition-colors text-sm">
                    {isRTL ? link.labelAr : link.labelEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("footer.contactUs")}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-5 h-5 text-accent" />
                <span dir="ltr">023339111</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-5 h-5 text-accent" />
                <span>info@alsarayabutcheryllc.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <MapPin className="w-5 h-5 text-accent" />
                <span>{t("contact.locationValue")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Clock className="w-5 h-5 text-accent" />
                <span>{t("contact.hoursValue")}</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("footer.followUs")}</h3>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/alsarayabutchery"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1FKCgTe4fD/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@alsarayabutchery"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
            <p className="mt-6 text-sm text-background/50">
              © 2024 {t("header.title")}. {t("footer.rights")}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
