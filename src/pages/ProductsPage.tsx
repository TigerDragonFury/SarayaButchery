import { lazy, Suspense, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/seo/SEOHead";
import { generateBreadcrumbSchema } from "@/lib/seo-schemas";

// Lazy load sections for performance
const ProductsHero = lazy(() => import("@/components/products/ProductsHero"));
const ProductsStickyNav = lazy(() => import("@/components/products/ProductsStickyNav"));
const ProductsCategoryGrid = lazy(() => import("@/components/products/ProductsCategoryGrid"));
const ProductsCategorySections = lazy(() => import("@/components/products/ProductsCategorySections"));
const ProductsSuggestions = lazy(() => import("@/components/products/ProductsSuggestions"));
const ProductsBundlesSection = lazy(() => import("@/components/products/ProductsBundlesSection"));
const ProductsFooter = lazy(() => import("@/components/products/ProductsFooter"));
const MobileProductsLayout = lazy(() => import("@/components/products/MobileProductsLayout"));

const SectionSkeleton = () => (
  <div className="py-12 px-4">
    <Skeleton className="h-8 w-48 mx-auto mb-6" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  </div>
);

const ProductsPage = () => {
  const { isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? "المتجر" : "Products", url: "/products" },
  ]);
  
  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mobile: show the app-style layout
  if (isMobile) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <MobileProductsLayout />
      </Suspense>
    );
  }

  // Desktop: existing layout
  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <SEOHead
        title="تسوق لحوم طازجة أونلاين في أبوظبي"
        titleEn="Shop Fresh Meat Online in Abu Dhabi"
        description="تسوق لحوم طازجة حلال أونلاين - لحم بقري، غنم، دجاج، منتجات جاهزة للشوي وبوكسات عائلية. توصيل سريع في أبوظبي والإمارات."
        descriptionEn="Shop fresh halal meat online - beef, lamb, chicken, ready-to-grill products and family boxes. Fast delivery in Abu Dhabi and UAE."
        keywords="online butcher UAE, shop meat Abu Dhabi, halal meat online, fresh beef delivery, lamb delivery UAE, تسوق لحوم أونلاين, توصيل لحوم أبوظبي"
        canonical="/products"
        schema={breadcrumbSchema}
      />
      <Suspense fallback={<SectionSkeleton />}>
        <ProductsHero onScrollToCategories={scrollToCategories} />
      </Suspense>
      
      <Suspense fallback={<div className="h-16 bg-background sticky top-0" />}>
        <ProductsStickyNav />
      </Suspense>
      
      <div ref={categoriesRef}>
        <Suspense fallback={<SectionSkeleton />}>
          <ProductsCategoryGrid />
        </Suspense>
      </div>
      
      {/* "You may also need" suggestions based on cart */}
      <div className="container mx-auto px-4">
        <Suspense fallback={null}>
          <ProductsSuggestions />
        </Suspense>
      </div>
      
      <Suspense fallback={<SectionSkeleton />}>
        <ProductsCategorySections />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <ProductsBundlesSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-muted" />}>
        <ProductsFooter />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
