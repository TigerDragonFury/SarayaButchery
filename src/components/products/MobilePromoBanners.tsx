import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import promoFreshMeat from "@/assets/banners/promo-fresh-meat.jpg";
import promoBBQ from "@/assets/banners/promo-bbq.jpg";
import promoBoxes from "@/assets/banners/promo-boxes.jpg";

interface Banner {
  id: string;
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr?: string;
  badgeEn?: string;
  color: string; // gradient overlay
}

const banners: Banner[] = [
  {
    id: "fresh",
    image: promoFreshMeat,
    titleAr: "لحوم طازجة يومياً",
    titleEn: "Fresh Daily Cuts",
    subtitleAr: "خصم يصل إلى 25% على جميع القطع",
    subtitleEn: "Up to 25% OFF on all cuts",
    badgeAr: "عرض خاص",
    badgeEn: "SPECIAL",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "bbq",
    image: promoBBQ,
    titleAr: "جاهز للشوي 🔥",
    titleEn: "BBQ Ready 🔥",
    subtitleAr: "أسياخ ومشاوي متبّلة جاهزة",
    subtitleEn: "Marinated skewers & grills ready",
    badgeAr: "جديد",
    badgeEn: "NEW",
    color: "from-black/70 via-black/40 to-transparent",
  },
  {
    id: "boxes",
    image: promoBoxes,
    titleAr: "بوكسات العائلة",
    titleEn: "Family Boxes",
    subtitleAr: "وفّر أكثر مع بوكسات اللحوم",
    subtitleEn: "Save more with meat boxes",
    badgeAr: "الأكثر مبيعاً",
    badgeEn: "BEST SELLER",
    color: "from-black/70 via-black/40 to-transparent",
  },
];

const MobilePromoBanners = () => {
  const { language, isRTL } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.offsetWidth * 0.85 + 8; // card width + gap
          scrollRef.current.scrollTo({
            left: isRTL ? -(next * cardWidth) : next * cardWidth,
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isRTL]);

  // Track scroll position for dots
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = Math.abs(scrollRef.current.scrollLeft);
    const cardWidth = scrollRef.current.offsetWidth * 0.85 + 8;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, banners.length - 1));
  };

  return (
    <div className="py-3">
      {/* Scrollable banners */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-3 snap-x snap-mandatory"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="shrink-0 snap-center rounded-xl overflow-hidden relative"
            style={{ width: "85%" }}
          >
            <div className="relative aspect-[16/9]">
              <img
                src={banner.image}
                alt={language === "ar" ? banner.titleAr : banner.titleEn}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div className={cn("absolute inset-0 bg-gradient-to-r", banner.color)} />

              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                {(banner.badgeAr || banner.badgeEn) && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md w-fit mb-1.5">
                    {language === "ar" ? banner.badgeAr : banner.badgeEn}
                  </span>
                )}
                <h3 className="text-white font-bold text-sm leading-tight">
                  {language === "ar" ? banner.titleAr : banner.titleEn}
                </h3>
                <p className="text-white/80 text-[11px] mt-0.5">
                  {language === "ar" ? banner.subtitleAr : banner.subtitleEn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 mt-2">
        {banners.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === activeIndex
                ? "w-5 bg-primary"
                : "w-1.5 bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default MobilePromoBanners;
