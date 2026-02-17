import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import SEOHead from "@/components/seo/SEOHead";
import { Home, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { isRTL } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const popularLinks = [
    { to: "/products", labelAr: "تسوق المنتجات", labelEn: "Shop Products" },
    { to: "/shop/beef", labelAr: "لحم بقري", labelEn: "Beef" },
    { to: "/shop/lamb", labelAr: "لحم غنم", labelEn: "Lamb" },
    { to: "/shop/chicken", labelAr: "دجاج", labelEn: "Chicken" },
    { to: "/bbq-meat-abu-dhabi", labelAr: "لحوم مشاوي", labelEn: "BBQ Meat" },
    { to: "/wagyu-beef-abu-dhabi", labelAr: "واغيو", labelEn: "Wagyu Beef" },
    { to: "/contact", labelAr: "تواصل معنا", labelEn: "Contact Us" },
    { to: "/blog", labelAr: "المدونة", labelEn: "Blog" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="الصفحة غير موجودة - 404"
        titleEn="Page Not Found - 404"
        description="الصفحة التي تبحث عنها غير موجودة. تصفح منتجاتنا من اللحوم الطازجة الحلال في أبوظبي."
        descriptionEn="The page you're looking for doesn't exist. Browse our fresh halal meat products in Abu Dhabi."
        noindex={true}
      />
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-[700px] text-center">
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {isRTL ? "الصفحة غير موجودة" : "Page Not Found"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {isRTL
              ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. جرّب أحد الروابط أدناه."
              : "Sorry, the page you're looking for doesn't exist or has been moved. Try one of the links below."}
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Button size="lg" asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                {isRTL ? "الرئيسية" : "Home"}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2">
              <Link to="/products">
                <Search className="w-4 h-4" />
                {isRTL ? "تصفح المنتجات" : "Browse Products"}
              </Link>
            </Button>
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isRTL ? "روابط مفيدة" : "Popular Links"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="bg-muted/40 rounded-lg p-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
              >
                {isRTL ? link.labelAr : link.labelEn}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
