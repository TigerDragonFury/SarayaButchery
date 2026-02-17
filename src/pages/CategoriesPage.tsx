import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import PageLayout from "@/components/layout/PageLayout";
import ProductCard from "@/components/shared/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string | null;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean | null;
  price_per: string | null;
}

const CategoriesPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { isRTL, t, language } = useLanguage();
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  // Fetch all active categories
  const { data: categories, isLoading: catsLoading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  // If slug is provided, find the selected category
  const selectedCategory = slug
    ? categories?.find((c) => c.slug === slug)
    : null;

  // Fetch products for selected category via junction table
  const { data: categoryProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["category-products", selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("product_categories")
        .select("product_id, sort_order, products(*)")
        .eq("category_id", selectedCategory.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || [])
        .map((pc: any) => pc.products as Product)
        .filter((p: Product | null) => p && p.is_active);
    },
    enabled: !!selectedCategory,
  });

  // For the overview page (no slug), fetch product counts per category
  const { data: categoryCounts } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("category_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((pc) => {
        counts[pc.category_id] = (counts[pc.category_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !slug,
  });

  const pageTitle = selectedCategory
    ? isRTL
      ? selectedCategory.name_ar
      : selectedCategory.name_en
    : isRTL
    ? "الأقسام"
    : "Categories";

  const pageDescription = selectedCategory
    ? isRTL
      ? selectedCategory.description_ar || `تسوق منتجات ${selectedCategory.name_ar}`
      : selectedCategory.description_en || `Shop ${selectedCategory.name_en} products`
    : isRTL
    ? "تصفح جميع أقسام المنتجات"
    : "Browse all product categories";

  return (
    <PageLayout>
      <SEOHead title={pageTitle} description={pageDescription} />

      <div className="container mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            {isRTL ? "الرئيسية" : "Home"}
          </Link>
          <Arrow className="w-4 h-4" />
          <Link
            to="/categories"
            className={`hover:text-foreground transition-colors ${
              !selectedCategory ? "text-foreground font-medium" : ""
            }`}
          >
            {isRTL ? "الأقسام" : "Categories"}
          </Link>
          {selectedCategory && (
            <>
              <Arrow className="w-4 h-4" />
              <span className="text-foreground font-medium">
                {isRTL ? selectedCategory.name_ar : selectedCategory.name_en}
              </span>
            </>
          )}
        </nav>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground text-lg">{pageDescription}</p>
        </div>

        {/* Categories Overview (no slug) */}
        {!slug && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {catsLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))
              : categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  >
                    {cat.image_url ? (
                      <div className="h-28 overflow-hidden">
                        <img
                          src={cat.image_url}
                          alt={isRTL ? cat.name_ar : cat.name_en}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-28 bg-muted flex items-center justify-center">
                        <LayoutGrid className="w-10 h-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="p-3 text-center">
                      <h3 className="font-bold text-sm text-foreground line-clamp-1">
                        {isRTL ? cat.name_ar : cat.name_en}
                      </h3>
                      {categoryCounts && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {categoryCounts[cat.id] || 0}{" "}
                          {isRTL ? "منتج" : "products"}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
          </div>
        )}

        {/* Category Products (with slug) */}
        {slug && selectedCategory && (
          <>
            {/* Category siblings navigation */}
            {categories && categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      cat.id === selectedCategory.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {isRTL ? cat.name_ar : cat.name_en}
                  </Link>
                ))}
              </div>
            )}

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-xl" />
                ))}
              </div>
            ) : categoryProducts && categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name_ar}
                    nameEn={product.name_en || undefined}
                    description={
                      isRTL
                        ? product.description_ar || ""
                        : product.description_en || product.description_ar || ""
                    }
                    price={product.price}
                    originalPrice={product.compare_at_price || undefined}
                    image={product.image_url || "/placeholder.svg"}
                    category={product.category || undefined}
                    isOnSale={!!product.compare_at_price}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <LayoutGrid className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">
                  {isRTL
                    ? "لا توجد منتجات في هذا القسم حالياً"
                    : "No products in this category yet"}
                </p>
              </div>
            )}
          </>
        )}

        {/* Category not found */}
        {slug && !catsLoading && !selectedCategory && (
          <div className="text-center py-16">
            <LayoutGrid className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              {isRTL ? "القسم غير موجود" : "Category not found"}
            </p>
            <Link
              to="/categories"
              className="text-primary hover:underline font-medium"
            >
              {isRTL ? "عرض جميع الأقسام" : "View all categories"}
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CategoriesPage;
