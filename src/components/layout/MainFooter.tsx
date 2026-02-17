import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStoreSettings, getFullAddress, getWhatsAppUrl } from "@/hooks/useStoreSettings";
import logo from "@/assets/logo.png";

const MainFooter = () => {
  const { t, isRTL } = useLanguage();
  const { settings } = useStoreSettings();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/shop", labelKey: "nav.butchery" },
    { href: "/categories", labelKey: isRTL ? "الأقسام" : "Categories" },
    { href: "/catering", labelKey: "nav.catering" },
    { href: "/menu", labelKey: "nav.menu" },
    { href: "/recipes", labelKey: "nav.recipes" },
    { href: "/blog", labelKey: "nav.blog" },
    { href: "/about", labelKey: "nav.about" },
    { href: "/contact", labelKey: "nav.contact" },
  ];

  const shopCategories = [
    { href: "/shop/beef", labelKey: "shop.beef" },
    { href: "/shop/lamb", labelKey: "shop.lamb" },
    { href: "/shop/chicken", labelKey: "shop.chicken" },
    { href: "/shop/ready-to-grill", labelKey: "shop.readyToGrill" },
    { href: "/shop/special-cuts", labelKey: "shop.specialCuts" },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
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
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              {t("footer.description")}
            </p>
            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={settings.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={settings.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("footer.quickLinks")}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-sm"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("footer.shopCategories")}</h3>
            <ul className="space-y-3">
              {shopCategories.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-accent transition-colors text-sm"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">{t("footer.contactUs")}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <a href={`tel:${settings.contact.phone}`} className="hover:text-accent transition-colors" dir="ltr">
                  {settings.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a href={`mailto:${settings.contact.email}`} className="hover:text-accent transition-colors">
                  {settings.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <a
                  href={settings.location.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  {getFullAddress(settings.location, isRTL)}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Clock className="w-5 h-5 text-accent flex-shrink-0" />
                <span>{isRTL ? settings.hours.display_ar : settings.hours.display_en}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/50" dir={isRTL ? "rtl" : "ltr"}>
            <p>© {currentYear} {t("header.title")}. {t("footer.rights")}.</p>
            <p className="text-xs" dir="ltr">
              alsarayabutcheryllc.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;
