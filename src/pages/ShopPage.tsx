import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import ProductCard from "@/components/shared/ProductCard";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import SEOHead from "@/components/seo/SEOHead";
import { SmartReorderSection } from "@/components/shop/SmartReorderSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHeroImages } from "@/hooks/useHeroImages";
import { Skeleton } from "@/components/ui/skeleton";
import { generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { categories, allProducts } from "@/data/menuProducts";
import { useProducts } from "@/hooks/useProducts";
import { useLanguage } from "@/contexts/LanguageContext";

const ShopPage = () => {
  const { category: urlCategory } = useParams();
  const { getHeroImage } = useHeroImages();
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "all");
  const { t, isRTL, language } = useLanguage();

  // Fetch products from database
  const { data: dbProducts, isLoading, error } = useProducts(selectedCategory);

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  // Use database products if available, fallback to static data
  const filteredProducts = dbProducts && dbProducts.length > 0
    ? dbProducts
    : selectedCategory === "all"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const currentCategory = categories.find((c) => c.id === selectedCategory) || categories[0];
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? "الملحمة" : "Butchery", url: "/shop" },
    ...(selectedCategory !== "all" ? [{ name: isRTL ? currentCategory.name : currentCategory.nameEn, url: `/shop/${selectedCategory}` }] : [])
  ]);

  return (
    <PageLayout>
      <SEOHead
        title={isRTL ? currentCategory.seoTitle : currentCategory.seoTitleEn}
        titleEn={currentCategory.seoTitleEn}
        description={`${isRTL ? currentCategory.seoDesc : currentCategory.seoTitleEn} - ${isRTL ? "ملحمة السرايا الإمارات" : "Al Saraya Butchery UAE"}. Fresh halal ${currentCategory.nameEn.toLowerCase()} meat in UAE.`}
        descriptionEn={`${currentCategory.seoTitleEn} at Al Saraya Butchery UAE. Premium halal ${currentCategory.nameEn.toLowerCase()} products with delivery.`}
        keywords={`${currentCategory.name}, ${currentCategory.nameEn}, لحوم حلال, halal meat UAE, ملحمة السرايا, butchery Dubai`}
        canonical={selectedCategory === "all" ? "/shop" : `/shop/${selectedCategory}`}
        schema={breadcrumbSchema}
      />
      
      <PageHero
        title={isRTL ? currentCategory.name : currentCategory.nameEn}
        titleEn={currentCategory.nameEn}
        subtitle={t("shop.discoverCollection")}
        backgroundImage={getHeroImage('shop')}
        size="sm"
      />

      <section className="py-12" aria-label={isRTL ? "قسم المنتجات" : "Products section"}>
        <div className="container mx-auto px-4">
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? "" : "lg:flex-row-reverse"}`} dir={isRTL ? "rtl" : "ltr"}>
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0 space-y-4" aria-label={isRTL ? "أقسام الملحمة" : "Shop categories"}>
              {/* Smart Reorder Section */}
              <SmartReorderSection />
              
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <h2 className="font-bold text-foreground mb-4">{t("shop.sections")}</h2>
                  <nav className="space-y-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(cat.id)}
                        aria-current={selectedCategory === cat.id ? "page" : undefined}
                      >
                        {isRTL ? cat.name : cat.nameEn}
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {t("shop.showing")} {filteredProducts.length} {t("shop.products")}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("shop.noProducts")}</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* WhatsApp Banner CTA */}
      <WhatsAppCTA variant="banner" buttonText={t("cta.orderNowWhatsapp")} />
    </PageLayout>
  );
};

export default ShopPage;
