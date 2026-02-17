import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, MessageCircle, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/shared/LanguageToggle";
import ThemeToggle from "@/components/shared/ThemeToggle";
import CartDrawer from "@/components/cart/CartDrawer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const NavDropdown = ({ label, href, submenu, dynamicSubmenu, isActivePath, isRTL, t, onNavigate }: {
  label: string; href: string;
  submenu?: { href: string; labelKey: string }[];
  dynamicSubmenu?: { href: string; label: string }[];
  isActivePath: boolean; isRTL: boolean; t: (key: string) => string; onNavigate?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = dynamicSubmenu
    ? dynamicSubmenu.map(s => ({ href: s.href, text: s.label }))
    : (submenu || []).map(s => ({ href: s.href, text: t(s.labelKey) }));

  const showViewAll = !dynamicSubmenu;

  return (
    <div ref={ref} className="relative">
      <button
        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-2 rounded-md transition-colors ${isActivePath ? "text-primary bg-primary/5" : "text-foreground/80 hover:text-primary hover:bg-primary/5"}`}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className={`absolute top-full mt-1 z-[100] w-48 bg-popover border border-border rounded-md shadow-lg py-1 ${isRTL ? "right-0" : "left-0"}`}>
          {showViewAll && (
            <Link
              to={href}
              className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-sm mx-1"
              onClick={() => { setOpen(false); onNavigate?.(); }}
            >
              {t("nav.viewAll")}
            </Link>
          )}
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground rounded-sm mx-1"
              onClick={() => { setOpen(false); onNavigate?.(); }}
            >
              {item.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const MainHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const shopCategories = [
    { href: "/shop/beef", labelKey: "shop.beef" },
    { href: "/shop/lamb", labelKey: "shop.lamb" },
    { href: "/shop/chicken", labelKey: "shop.chicken" },
    { href: "/shop/ready-to-grill", labelKey: "shop.readyToGrill" },
    { href: "/shop/special-cuts", labelKey: "shop.specialCuts" },
    { href: "/shop/boxes", labelKey: "shop.boxes" },
  ];

  const restaurantCategories = [
    { href: "/restaurant/bbq", labelKey: "restaurant.bbq" },
    { href: "/restaurant/pottery", labelKey: "restaurant.pottery" },
    { href: "/restaurant/sandwiches", labelKey: "restaurant.sandwiches" },
    { href: "/restaurant/fattat", labelKey: "restaurant.fattat" },
    { href: "/restaurant/shamyat", labelKey: "restaurant.shamyat" },
    { href: "/restaurant/manakeesh", labelKey: "restaurant.manakeesh" },
    { href: "/restaurant/appetizers", labelKey: "restaurant.appetizers" },
    { href: "/restaurant/salads", labelKey: "restaurant.salads" },
    { href: "/restaurant/drinks", labelKey: "restaurant.drinks" },
    { href: "/menu", labelKey: "nav.menu" },
  ];

  const cateringServices = [
    { href: "/catering/corporate", labelKey: "catering.corporate" },
    { href: "/catering/wedding", labelKey: "catering.wedding" },
    { href: "/catering/events", labelKey: "catering.events" },
    { href: "/catering/bbq", labelKey: "catering.bbq" },
  ];

  // Fetch dynamic "Our Products" categories from store_settings
  const { data: ourProductsCategories } = useQuery({
    queryKey: ['our-products-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'our_products_categories')
        .single();
      if (error) return [];
      const cats = (data?.value as unknown as Array<{ id: string; name_ar: string; name_en: string; href: string; is_active: boolean }>) || [];
      return cats.filter(c => c.is_active).map(c => ({
        href: c.href,
        labelAr: c.name_ar,
        labelEn: c.name_en,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });

  const ourProductsSubmenu = (ourProductsCategories || []).map(c => ({
    href: c.href,
    label: isRTL ? c.labelAr : c.labelEn,
  }));

  const navLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/shop", labelKey: "nav.butchery", hasSubmenu: true, submenu: shopCategories },
    { href: "/restaurant", labelKey: "nav.restaurant", hasSubmenu: true, submenu: restaurantCategories },
    { href: "/products", labelKey: isRTL ? "منتجاتنا" : "Our Products", hasSubmenu: true, submenuDynamic: ourProductsSubmenu },
    { href: "/categories", labelKey: isRTL ? "الأقسام" : "Categories" },
    { href: "/catering", labelKey: "nav.catering", hasSubmenu: true, submenu: cateringServices },
    { href: "/offers", labelKey: "nav.offers" },
    { href: "/recipes", labelKey: "nav.recipes" },
    { href: "/blog", labelKey: "nav.blog" },
    { href: "/about", labelKey: "nav.about" },
    { href: "/contact", labelKey: "nav.contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleWhatsApp = () => {
    window.open("https://wa.me/971566808565", "_blank");
  };

  const handleCall = () => {
    window.location.href = "tel:+971566808565";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top Bar: Founded + Contact Info */}
        <div className="hidden sm:flex items-center justify-between py-1.5 border-b border-border/30 text-[11px] text-muted-foreground" dir={isRTL ? "rtl" : "ltr"}>
          <span className="font-semibold tracking-wide">
            {isRTL ? "🏆 تأسست سنة 2019 | أكثر من 10,000 عميل" : "🏆 Est. 2019 | 10,000+ Customers"}
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>

        {/* Main Row: Logo + Search + CTA */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt={t("header.title")} className="h-16 w-auto" width={64} height={64} loading="eager" decoding="async" />
            <div className={`hidden sm:block ${isRTL ? "text-right" : "text-left"}`}>
              <span className="text-base font-bold text-primary leading-tight block">{t("header.title")}</span>
              <p className="text-[10px] text-muted-foreground">{t("header.subtitle")}</p>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
            <div className="relative w-full">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
              <Input
                type="search"
                placeholder={isRTL ? "ابحث عن المنتجات..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} h-9 bg-muted/50 border-border focus:bg-background text-sm`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </form>

          {/* Mobile Search Button */}
          <button
            className="sm:hidden p-2 text-foreground"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label={isSearchOpen ? "Close search" : "Open search"}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <CartDrawer />
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleCall}>
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{t("cta.callUs")}</span>
            </Button>
            <Button size="sm" className="gap-1.5 h-8 text-xs bg-green-600 hover:bg-green-700 shadow-md" onClick={handleWhatsApp}>
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t("cta.orderNow")}</span>
            </Button>
          </div>
        </div>

        {/* Bottom Row: Desktop Navigation - RTL: starts with الرئيسية on right, ends with تواصل معنا on left */}
        <nav className="hidden lg:flex items-center justify-center gap-1 border-t border-border/50 py-1" dir={isRTL ? "rtl" : "ltr"}>
          {navLinks.map((link) => (
            link.hasSubmenu ? (
              <NavDropdown
                key={link.href}
                label={link.labelKey.startsWith('nav.') || link.labelKey.startsWith('catering.') ? t(link.labelKey) : link.labelKey}
                href={link.href}
                submenu={link.submenu}
                dynamicSubmenu={link.submenuDynamic}
                isActivePath={isActive(link.href)}
                isRTL={isRTL}
                t={t}
              />
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-medium px-2.5 py-2 rounded-md transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/5"
                    : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.labelKey.startsWith('nav.') || link.labelKey.startsWith('catering.') ? t(link.labelKey) : link.labelKey}
              </Link>
            )
          ))}
        </nav>

        {/* Mobile Search Bar - Expandable */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="sm:hidden py-3 border-t border-border">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
              <Input
                type="search"
                placeholder={isRTL ? "ابحث عن المنتجات..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} h-10 bg-muted/50 border-border focus:bg-background`}
                dir={isRTL ? "rtl" : "ltr"}
                autoFocus
              />
            </div>
          </form>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border max-h-[70vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
            <div className="flex flex-col gap-1">
              {/* Language, Theme & Cart Toggle for Mobile */}
              <div className="flex items-center gap-2 px-2 pb-3 border-b border-border mb-2">
                <ThemeToggle />
                <LanguageToggle />
                <CartDrawer />
              </div>
              
              {navLinks.map((link) => (
                <div key={link.href}>
                  {link.hasSubmenu ? (
                    <>
                      <button
                        className="flex items-center justify-between w-full text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-2"
                        onClick={() => setOpenMobileSubmenu(openMobileSubmenu === link.href ? null : link.href)}
                      >
                        {link.labelKey.startsWith('nav.') || link.labelKey.startsWith('catering.') ? t(link.labelKey) : link.labelKey}
                        <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSubmenu === link.href ? "rotate-180" : ""}`} />
                      </button>
                      {openMobileSubmenu === link.href && (
                        <div className={`pb-2 space-y-1 ${isRTL ? "pr-4" : "pl-4"}`}>
                          {!link.submenuDynamic && (
                            <Link
                              to={link.href}
                              className="block text-sm text-muted-foreground hover:text-primary py-2 px-2"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {t("nav.viewAll")}
                            </Link>
                          )}
                          {link.submenuDynamic ? (
                            link.submenuDynamic.map((sub) => (
                              <Link
                                key={sub.href}
                                to={sub.href}
                                className="block text-sm text-muted-foreground hover:text-primary py-2 px-2"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {sub.label}
                              </Link>
                            ))
                          ) : (
                            link.submenu?.map((sublink) => (
                              <Link
                                key={sublink.href}
                                to={sublink.href}
                                className="block text-sm text-muted-foreground hover:text-primary py-2 px-2"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {t(sublink.labelKey)}
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      className={`block text-sm font-medium py-3 px-2 rounded-md transition-colors ${
                        isActive(link.href)
                          ? "text-primary bg-primary/5"
                          : "text-foreground/80 hover:text-primary"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.labelKey.startsWith('nav.') || link.labelKey.startsWith('catering.') ? t(link.labelKey) : link.labelKey}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={handleCall}>
                  <Phone className="w-4 h-4" />
                  <span>{t("cta.callUs")}</span>
                </Button>
                <Button size="sm" className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={handleWhatsApp}>
                  <MessageCircle className="w-4 h-4" />
                  <span>{t("cta.whatsapp")}</span>
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default MainHeader;
