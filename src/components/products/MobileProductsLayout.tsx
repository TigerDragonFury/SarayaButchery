import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowLeft, ArrowRight, ShoppingCart, Plus, Check, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import MobilePromoBanners from "./MobilePromoBanners";

// Import category images
import beefImage from "@/assets/products/beef-cubes-fresh.jpg";
import lambImage from "@/assets/products/lamb-chops.jpg";
import chickenImage from "@/assets/products/chicken-drumsticks-fresh.jpg";
import readyToCookImage from "@/assets/products/tray-shish-tawook-cream.jpg";
import steakImage from "@/assets/products/striploin-steak-fresh.jpg";
import marinatedImage from "@/assets/products/chicken-drumsticks-marinated.jpg";
import skewersImage from "@/assets/products/tikka-meat.jpg";
import frozenImage from "@/assets/products/sambousa.png";
import offalImage from "@/assets/products/beef-liver.png";
import spicesImage from "@/assets/products/kofta-meat.png";
import localVealImage from "@/assets/products/lamb-ribs-fresh.jpg";
import bbqImage from "@/assets/products/short-ribs-marinated.jpg";
import dairyImage from "@/assets/products/burger-patties.png";
import breadImage from "@/assets/products/family-box.jpg";

interface CategoryDef {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
}

const categoryDefs: CategoryDef[] = [
  { id: "all", nameAr: "الكل", nameEn: "All", image: beefImage },
  { id: "beef", nameAr: "بقري", nameEn: "Beef", image: beefImage },
  { id: "lamb", nameAr: "غنم", nameEn: "Lamb", image: lambImage },
  { id: "chicken", nameAr: "دجاج", nameEn: "Chicken", image: chickenImage },
  { id: "local-veal", nameAr: "عجل بلدي", nameEn: "Local Veal", image: localVealImage },
  { id: "steak", nameAr: "ستيك", nameEn: "Steaks", image: steakImage },
  { id: "marinated", nameAr: "متبّل", nameEn: "Marinated", image: marinatedImage },
  { id: "skewers", nameAr: "أسياخ", nameEn: "Skewers", image: skewersImage },
  { id: "ready-to-cook", nameAr: "جاهز للطهي", nameEn: "Ready to Cook", image: readyToCookImage },
  { id: "offal", nameAr: "أحشاء", nameEn: "Offals", image: offalImage },
  { id: "frozen", nameAr: "مجمد", nameEn: "Frozen", image: frozenImage },
  { id: "spices", nameAr: "بهارات", nameEn: "Spices", image: spicesImage },
  { id: "bbq", nameAr: "شواء", nameEn: "BBQ", image: bbqImage },
  { id: "dairy", nameAr: "ألبان", nameEn: "Dairy", image: dairyImage },
  { id: "bread", nameAr: "خبز", nameEn: "Bread", image: breadImage },
];

// Compact product card for mobile grid
const MobileProductCard = ({ product }: { product: any }) => {
  const { language, isRTL } = useLanguage();
  const { addItem, getItemQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const displayName = language === "ar" ? product.name : (product.nameEn || product.name);
  const itemInCart = getItemQuantity(product.id);
  const currency = language === "ar" ? "د.إ" : "AED";
  const unitLabel = language === "ar" ? "كيلو" : "KG";

  const handleAdd = () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      image: product.image,
      unit: unitLabel,
    }, 1);
    setTimeout(() => setIsAdding(false), 1200);
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/50">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={displayName}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-1.5 start-1.5">
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              {product.discountPercent}% OFF
            </span>
          </div>
        )}
        {itemInCart > 0 && (
          <div className={cn("absolute top-1.5", product.discountPercent > 0 ? "start-1.5 top-7" : "start-1.5")}>
            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {itemInCart} {unitLabel}
            </span>
          </div>
        )}
        {/* ADD button overlay */}
        <Button
          size="sm"
          variant={isAdding ? "default" : "outline"}
          className={cn(
            "absolute bottom-2 end-2 h-8 px-3 text-xs font-bold rounded-lg shadow-md",
            isAdding
              ? "bg-primary text-primary-foreground"
              : "bg-card/95 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={handleAdd}
          disabled={isAdding || !product.allowAddToCart}
        >
          {isAdding ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 me-0.5" />
              {language === "ar" ? "أضف" : "ADD"}
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="p-2.5" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-[11px] text-muted-foreground">{product.unit || unitLabel}</p>
        <h3 className="font-semibold text-xs line-clamp-2 leading-tight mt-0.5 min-h-[2rem]">
          {displayName}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="font-bold text-sm">{currency} {product.price}</span>
          {product.compareAtPrice && (
            <span className="text-[11px] text-muted-foreground line-through">
              {currency} {product.compareAtPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MobileProductsLayout = () => {
  const { language, isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { data: allProducts, isLoading } = useProducts();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeCatRef = useRef<HTMLButtonElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (activeCatRef.current) {
      activeCatRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeCategory]);

  // Filter products
  const filteredProducts = allProducts?.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  const activeCategoryDef = categoryDefs.find(c => c.id === activeCategory);
  const categoryTitle = language === "ar" 
    ? activeCategoryDef?.nameAr || "الكل"
    : activeCategoryDef?.nameEn || "All";

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-3 h-12">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => window.history.back()} aria-label={isRTL ? "رجوع" : "Go back"}>
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <h1 className="font-bold text-base">{categoryTitle}</h1>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowSearch(!showSearch)} aria-label={isRTL ? (showSearch ? "إغلاق البحث" : "بحث") : (showSearch ? "Close search" : "Search")}>
            {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </Button>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                autoFocus
                placeholder={language === "ar" ? 'ابحث عن منتج...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("h-9 text-sm", isRTL ? "pr-9" : "pl-9")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main content: sidebar + grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Category Sidebar */}
        <div 
          ref={sidebarRef}
          className={cn(
            "w-[76px] shrink-0 bg-muted/30 border-e border-border overflow-y-auto scrollbar-hide",
            "flex flex-col items-center py-2 gap-1"
          )}
          style={{ height: "calc(100vh - 48px - 56px)" }}
        >
          {categoryDefs.map((cat) => (
            <button
              key={cat.id}
              ref={cat.id === activeCategory ? activeCatRef : undefined}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(""); }}
              className={cn(
                "flex flex-col items-center w-full px-1 py-2 transition-colors relative",
                activeCategory === cat.id 
                  ? "bg-background" 
                  : "hover:bg-background/50"
              )}
            >
              {/* Active indicator bar */}
              {activeCategory === cat.id && (
                <div className={cn(
                  "absolute top-0 bottom-0 w-[3px] bg-primary rounded-full",
                  isRTL ? "right-0" : "left-0"
                )} />
              )}
              <div className={cn(
                "w-12 h-12 rounded-full overflow-hidden border-2 mb-1",
                activeCategory === cat.id ? "border-primary" : "border-transparent"
              )}>
                <img
                  src={cat.image}
                  alt={language === "ar" ? cat.nameAr : cat.nameEn}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className={cn(
                "text-[10px] leading-tight text-center line-clamp-2 font-medium",
                activeCategory === cat.id ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                {language === "ar" ? cat.nameAr : cat.nameEn}
              </span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ height: "calc(100vh - 48px - 56px)" }}
        >
          {/* Promo Banners */}
          {activeCategory === "all" && !searchQuery && <MobilePromoBanners />}
          
          <div className="p-2">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{language === "ar" ? "لا توجد منتجات" : "No products found"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredProducts.map((product) => (
                <MobileProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileProductsLayout;
