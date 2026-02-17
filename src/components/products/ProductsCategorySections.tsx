import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductsGridCard from "./ProductsGridCard";

const PRODUCTS_PER_PAGE = 8;

const categoryMappings: Record<string, string[]> = {
  beef: ["beef", "لحم بقري", "بقري"],
  lamb: ["lamb", "لحم غنم", "غنم", "ضأن"],
  chicken: ["chicken", "دجاج", "فراخ"],
  "ready-to-cook": ["ready", "جاهز", "tray", "صينية"],
  "special-cuts": ["special", "خاص", "steak", "ستيك", "wagyu", "واغيو"],
  boxes: ["box", "بوكس", "bundle"],
  // Add-on categories (same cart, same checkout)
  spices: ["spice", "بهارات", "توابل", "seasoning"],
  frozen: ["frozen", "مجمد", "ice"],
  bread: ["bread", "خبز", "صمون", "pita", "saj"],
  bbq: ["bbq", "شواء", "grill", "charcoal", "فحم", "tool", "أدوات"],
  pickles: ["pickle", "مخلل", "طرشي", "olive", "زيتون"],
  drinks: ["drink", "مشروب", "juice", "عصير", "water", "ماء"],
};

interface CategorySectionProps {
  categoryId: string;
  titleAr: string;
  titleEn: string;
}

const CategorySection = ({ categoryId, titleAr, titleEn }: CategorySectionProps) => {
  const { language } = useLanguage();
  const { data: allProducts, isLoading } = useProducts();
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Filter products for this category
  const categoryProducts = allProducts?.filter((product) => {
    const productCategory = product.category?.toLowerCase() || "";
    const productName = product.name.toLowerCase();
    const matchTerms = categoryMappings[categoryId] || [];
    
    return matchTerms.some(
      (term) => productCategory.includes(term) || productName.includes(term)
    );
  }) || [];

  const visibleProducts = categoryProducts.slice(0, visibleCount);
  const hasMore = visibleCount < categoryProducts.length;

  const loadMoreText = language === "ar" ? "عرض المزيد" : "Load More";
  const noProductsText = language === "ar" ? "لا توجد منتجات" : "No products available";

  if (isLoading) {
    return (
      <section id={`category-${categoryId}`} className="py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categoryProducts.length === 0) {
    return null; // Hide empty categories
  }

  return (
    <section id={`category-${categoryId}`} className="py-12 border-b border-border last:border-0">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          {language === "ar" ? titleAr : titleEn}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleProducts.map((product) => (
            <ProductsGridCard
              key={product.id}
              id={product.id}
              name={product.name}
              nameEn={product.nameEn}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              discountPercent={product.discountPercent}
              image={product.image}
              unit={product.unit}
              allowAddToCart={product.allowAddToCart}
              category={product.category}
            />
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
            >
              {loadMoreText} ({categoryProducts.length - visibleCount})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

const ProductsCategorySections = () => {
  // Main meat categories first, then add-ons
  const categories = [
    // Meat categories
    { id: "beef", titleAr: "لحوم بقري", titleEn: "Beef", isAddOn: false },
    { id: "lamb", titleAr: "لحوم غنم", titleEn: "Lamb", isAddOn: false },
    { id: "chicken", titleAr: "دجاج", titleEn: "Chicken", isAddOn: false },
    { id: "ready-to-cook", titleAr: "جاهز للطهي", titleEn: "Ready to Cook", isAddOn: false },
    { id: "special-cuts", titleAr: "قطع خاصة", titleEn: "Special Cuts", isAddOn: false },
    { id: "boxes", titleAr: "بوكسات", titleEn: "Boxes", isAddOn: false },
    // Add-on categories (same cart)
    { id: "spices", titleAr: "بهارات وتوابل", titleEn: "Spices & Seasonings", isAddOn: true },
    { id: "bread", titleAr: "خبز وصاج", titleEn: "Bread & Saj", isAddOn: true },
    { id: "bbq", titleAr: "أدوات الشواء", titleEn: "BBQ Tools & Charcoal", isAddOn: true },
    { id: "pickles", titleAr: "مخللات وزيتون", titleEn: "Pickles & Olives", isAddOn: true },
    { id: "frozen", titleAr: "منتجات مجمدة", titleEn: "Frozen Items", isAddOn: true },
    { id: "drinks", titleAr: "مشروبات", titleEn: "Drinks", isAddOn: true },
  ];

  return (
    <div>
      {categories.map((cat) => (
        <CategorySection
          key={cat.id}
          categoryId={cat.id}
          titleAr={cat.titleAr}
          titleEn={cat.titleEn}
        />
      ))}
    </div>
  );
};

export default ProductsCategorySections;
