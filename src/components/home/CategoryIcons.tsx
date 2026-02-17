import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Beef, Drumstick, Flame, Package, Scissors } from "lucide-react";

const CategoryIcons = () => {
  const { language, isRTL } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const categories = [
    {
      id: "beef",
      nameAr: "لحم بقري",
      nameEn: "Beef",
      icon: Beef,
      href: "/shop/beef",
    },
    {
      id: "lamb",
      nameAr: "لحم غنم",
      nameEn: "Lamb",
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <ellipse cx="12" cy="14" rx="7" ry="5" />
          <circle cx="8" cy="9" r="2" />
          <circle cx="16" cy="9" r="2" />
          <path d="M9 7 7 4" />
          <path d="M15 7l2-3" />
          <ellipse cx="12" cy="17" rx="2" ry="1" />
        </svg>
      ),
      href: "/shop/lamb",
    },
    {
      id: "chicken",
      nameAr: "دجاج",
      nameEn: "Chicken",
      icon: Drumstick,
      href: "/shop/chicken",
    },
    {
      id: "ready-to-grill",
      nameAr: "جاهز للشوي",
      nameEn: "Ready to Grill",
      icon: Flame,
      href: "/shop/ready-to-grill",
    },
    {
      id: "special-cuts",
      nameAr: "قطوعات خاصة",
      nameEn: "Special Cuts",
      icon: Scissors,
      href: "/shop/special-cuts",
    },
    {
      id: "boxes",
      nameAr: "بوكسات",
      nameEn: "Boxes",
      icon: Package,
      href: "/shop/boxes",
    },
  ];

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div 
          className={`flex flex-wrap justify-center gap-6 md:gap-10 transition-all duration-700 will-change-transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                to={category.href}
                className="group flex flex-col items-center gap-3 transition-all hover:scale-105"
                style={{ 
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)"
                }}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:shadow-xl group-hover:bg-primary/90 transition-all">
                  <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <span className="text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {language === "ar" ? category.nameAr : category.nameEn}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryIcons;
