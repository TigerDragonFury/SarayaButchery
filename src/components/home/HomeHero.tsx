import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeroImages } from "@/hooks/useHeroImages";

const HomeHero = () => {
  const { t, isRTL, language } = useLanguage();
  const isMobile = useIsMobile();
  const { getHeroImage, getMobileHeroImage } = useHeroImages();

  // Dynamic hero images from admin, with fallback to public paths
  const heroDesktopJPG = getHeroImage('home') || "/hero-background.jpg";
  const heroMobileJPG = getMobileHeroImage('home') || "/hero-background-mobile.jpg";
  // WebP only used when images are from public folder (local files)
  const isLocalDesktop = heroDesktopJPG.startsWith('/hero-background');
  const isLocalMobile = heroMobileJPG.startsWith('/hero-background');
  const heroDesktopWebP = isLocalDesktop ? "/hero-background.webp" : null;
  const heroMobileWebP = isLocalMobile ? "/hero-background-mobile.webp" : null;

  const handleWhatsApp = () => {
    const message = language === "ar" 
      ? "مرحبًا، أريد طلب لحوم طازجة"
      : "Hello, I would like to order fresh meat";
    window.open("https://wa.me/971566808565?text=" + encodeURIComponent(message), "_blank");
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] overflow-hidden">
      {/* Mobile Background — smaller image for faster LCP */}
      <div className="absolute inset-0 lg:hidden">
        <picture>
          {heroMobileWebP && <source srcSet={heroMobileWebP} type="image/webp" />}
          <img
            src={heroMobileJPG}
            alt="Al Saraya Butchery - Fresh halal meat Abu Dhabi"
            fetchPriority="high"
            decoding="sync"
            width={768}
            height={432}
            sizes="100vw"
            className="w-full h-full object-cover"
            style={{ aspectRatio: '16/9' }}
          />
        </picture>
      </div>
      <div className="absolute inset-0 lg:hidden bg-gradient-to-l from-black/80 via-black/60 to-black/40" />
      <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-black/50 to-transparent" />

      {/* Desktop Split Layout - only render image on desktop to avoid double download */}
      <div className="hidden lg:flex min-h-[90vh] relative">
        {/* Full-width background image - conditionally rendered */}
        {!isMobile && (
          <picture>
            {heroDesktopWebP && <source srcSet={heroDesktopWebP} type="image/webp" />}
            <img
              src={heroDesktopJPG}
              alt="Al Saraya Butchery - Fresh Halal Meat"
              fetchPriority="high"
              decoding="sync"
              width={1920}
              height={1080}
              sizes="100vw"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ aspectRatio: '16/9' }}
            />
          </picture>
        )}
        <div className="absolute inset-0 bg-black/15" />
        {/* Smooth gradient overlay for content readability */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{
            background: isRTL 
              ? 'linear-gradient(to left, hsl(var(--background) / 0.93) 30%, hsl(var(--background) / 0.7) 45%, hsl(var(--background) / 0.25) 62%, transparent 78%)'
              : 'linear-gradient(to right, hsl(var(--background) / 0.93) 30%, hsl(var(--background) / 0.7) 45%, hsl(var(--background) / 0.25) 62%, transparent 78%)'
          }}
        />

        {/* Content Side - 45% */}
        <div 
          className="w-[45%] flex flex-col justify-start pt-24 xl:pt-28 px-12 xl:px-20 relative z-10"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/15 text-accent px-4 py-2 rounded-full mb-5 w-fit animate-fade-up">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm font-medium">{t("hero.badge")}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-[68px] xl:text-[72px] font-bold text-foreground leading-[1.1] mb-3 animate-fade-up">
            {t("hero.title")}
          </h1>
          
          {/* Tagline */}
          <p className="text-[26px] xl:text-[30px] font-semibold text-accent mb-4 animate-fade-up">
            {t("hero.subtitle")}
          </p>

          {/* Description */}
          <p className="text-[20px] xl:text-[22px] text-muted-foreground max-w-[620px] mb-8 leading-[1.6] animate-fade-up">
            {t("hero.description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 xl:gap-5 animate-fade-up">
            <Button
              size="lg"
              className="gap-3 text-[18px] xl:text-[20px] px-8 h-14 xl:h-[60px] bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all group"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-5 h-5 xl:w-6 xl:h-6 group-hover:scale-110 transition-transform" />
              {t("cta.orderNowWhatsapp")}
            </Button>
            <Button
              asChild
              size="lg"
              className="gap-2 text-[18px] xl:text-[20px] px-8 h-14 xl:h-[60px] bg-primary hover:bg-primary/90"
            >
              <Link to="/shop">
                <ShoppingBag className="w-5 h-5 xl:w-6 xl:h-6" />
                {t("cta.getFreshMeat")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 text-[18px] xl:text-[20px] px-8 h-14 xl:h-[60px] border-border hover:bg-muted"
            >
              <Link to="/menu">
                <Store className="w-5 h-5 xl:w-6 xl:h-6" />
                {t("cta.browseMenu")}
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-10 pt-6 border-t border-border max-w-md">
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-[28px] xl:text-[32px] font-bold text-accent leading-tight">6+</p>
              <p className="text-sm xl:text-[15px] text-muted-foreground mt-0.5">{t("hero.stats.years")}</p>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-[28px] xl:text-[32px] font-bold text-accent leading-tight">10000+</p>
              <p className="text-sm xl:text-[15px] text-muted-foreground mt-0.5">{t("hero.stats.customers")}</p>
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-[28px] xl:text-[32px] font-bold text-accent leading-tight">100%</p>
              <p className="text-sm xl:text-[15px] text-muted-foreground mt-0.5">{t("hero.stats.halal")}</p>
            </div>
          </div>
        </div>

        {/* Image Side - 55% (transparent, image shows through) */}
        <div className="w-[55%] relative z-10" />
      </div>

      {/* Mobile Layout (Unchanged) */}
      <div className="lg:hidden flex items-center min-h-[85vh]">
        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className={`w-full max-w-2xl ${isRTL ? "mr-0 text-right" : "ml-0 text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent backdrop-blur-sm px-5 py-2.5 rounded-full mb-5 animate-fade-up">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium">{t("hero.badge")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3 animate-fade-up">
              {t("hero.title")}
              <span className="block text-accent mt-2 text-2xl md:text-3xl font-semibold">
                {t("hero.subtitle")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/85 max-w-lg mb-8 leading-relaxed animate-fade-up">
              {t("hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-3 text-lg px-8 h-14 bg-green-600 hover:bg-green-700 shadow-xl transition-all group"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t("cta.orderNowWhatsapp")}
              </Button>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto gap-2 text-lg px-8 h-14 bg-primary hover:bg-primary/90"
              >
                <Link to="/shop">
                  <ShoppingBag className="w-5 h-5" />
                  {t("cta.getFreshMeat")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 text-lg px-8 h-14 border-foreground/50 bg-background/90 text-foreground hover:bg-background"
              >
                <Link to="/menu">
                  <Store className="w-5 h-5" />
                  {t("cta.browseMenu")}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-6 border-t border-white/20 max-w-md">
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-2xl md:text-3xl font-bold text-accent">6+</p>
                <p className="text-sm text-white/70 mt-0.5">{t("hero.stats.years")}</p>
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-2xl md:text-3xl font-bold text-accent">10000+</p>
                <p className="text-sm text-white/70 mt-0.5">{t("hero.stats.customers")}</p>
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-2xl md:text-3xl font-bold text-accent">100%</p>
                <p className="text-sm text-white/70 mt-0.5">{t("hero.stats.halal")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white/30 lg:border-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 lg:bg-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
