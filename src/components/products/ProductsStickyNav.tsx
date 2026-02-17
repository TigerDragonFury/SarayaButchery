import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Flame, Sparkles, Tag, Snowflake, Utensils } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export type QuickFilter = "all" | "bestseller" | "new" | "offers" | "frozen" | "bbq-tools";

interface ProductsStickyNavProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: QuickFilter) => void;
  activeFilter?: QuickFilter;
}

const ProductsStickyNav = ({ onSearch, onFilterChange, activeFilter = "all" }: ProductsStickyNavProps) => {
  const { language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [localFilter, setLocalFilter] = useState<QuickFilter>(activeFilter);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterClick = (filter: QuickFilter) => {
    setLocalFilter(filter);
    onFilterChange?.(filter);
  };

  const content = {
    ar: {
      searchPlaceholder: "ابحث عن منتج...",
      filters: {
        bestseller: "الأكثر مبيعاً",
        new: "جديد",
        offers: "عروض",
        frozen: "مجمد",
        "bbq-tools": "أدوات الشوي",
      },
    },
    en: {
      searchPlaceholder: "Search products...",
      filters: {
        bestseller: "Best Seller",
        new: "New",
        offers: "Offers",
        frozen: "Frozen",
        "bbq-tools": "BBQ Tools",
      },
    },
  };

  const t = content[language];

  const filterIcons: Record<Exclude<QuickFilter, "all">, React.ReactNode> = {
    bestseller: <Flame className="w-3 h-3" />,
    new: <Sparkles className="w-3 h-3" />,
    offers: <Tag className="w-3 h-3" />,
    frozen: <Snowflake className="w-3 h-3" />,
    "bbq-tools": <Utensils className="w-3 h-3" />,
  };

  return (
    <div
      className={cn(
        "bg-background/95 backdrop-blur-sm border-b border-border z-40 transition-all duration-300",
        isSticky ? "sticky top-0 shadow-md" : ""
      )}
    >
      <div className="container mx-auto px-4 py-3">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )}
          />
          <Input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={cn("h-10", isRTL ? "pr-10 pl-10" : "pl-10 pr-10")}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-1/2 -translate-y-1/2 h-6 w-6",
                isRTL ? "left-2" : "right-2"
              )}
              onClick={() => handleSearch("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(Object.keys(t.filters) as Exclude<QuickFilter, "all">[]).map((filter) => (
            <Badge
              key={filter}
              variant={localFilter === filter ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap gap-1 px-3 py-1.5 transition-colors",
                localFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => handleFilterClick(filter)}
            >
              {filterIcons[filter]}
              {t.filters[filter]}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsStickyNav;
