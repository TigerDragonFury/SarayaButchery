import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BlogSection = () => {
  const { t, isRTL } = useLanguage();

  const blogPosts = [
    {
      titleAr: "كيف تختار اللحم الطازج؟ 5 نصائح من خبراء السرايا",
      titleEn: "How to Choose Fresh Meat? 5 Tips from Al Saraya Experts",
      excerptAr: "تعرف على العلامات الأساسية لاختيار اللحم الطازج وتجنب الأخطاء الشائعة",
      excerptEn: "Learn the essential signs for choosing fresh meat and avoiding common mistakes",
      date: "2024-01-15",
      categoryAr: "نصائح",
      categoryEn: "Tips",
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=250&fit=crop",
    },
    {
      titleAr: "أفضل طرق تخزين اللحوم في المنزل",
      titleEn: "Best Ways to Store Meat at Home",
      excerptAr: "دليلك الشامل لحفظ اللحوم وضمان طزاجتها لأطول فترة ممكنة",
      excerptEn: "Your complete guide to preserving meat and ensuring freshness for as long as possible",
      date: "2024-01-10",
      categoryAr: "إرشادات",
      categoryEn: "Guidelines",
      image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=250&fit=crop",
    },
    {
      titleAr: "فرق الجودة بين اللحوم المحلية والمستوردة",
      titleEn: "Quality Difference Between Local and Imported Meats",
      excerptAr: "مقارنة شاملة تساعدك على اتخاذ القرار الأفضل لمطبخك",
      excerptEn: "A comprehensive comparison to help you make the best decision for your kitchen",
      date: "2024-01-05",
      categoryAr: "معلومات",
      categoryEn: "Information",
      image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=250&fit=crop",
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(isRTL ? 'ar-AE-u-nu-latn' : 'en-AE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="blog" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            {t("nav.blog")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {isRTL ? "مدونة السرايا" : "Al Saraya Blog"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? "نشارككم نصائح، وصفات، وأسرار اختيار اللحم الصحيح لكل أكلة، لمطبخ أذكى وطعم أفضل."
              : "We share tips, recipes, and secrets for choosing the right meat for every dish, for a smarter kitchen and better taste."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" dir={isRTL ? "rtl" : "ltr"}>
          {blogPosts.map((post, index) => (
            <Card
              key={index}
              className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={isRTL ? post.titleAr : post.titleEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                  <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full">
                    {isRTL ? post.categoryAr : post.categoryEn}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.date)}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                  {isRTL ? post.titleAr : post.titleEn}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {isRTL ? post.excerptAr : post.excerptEn}
                </p>
                <Button variant="ghost" className="w-full gap-2 group-hover:text-primary p-0 justify-start">
                  {t("cta.learnMore")}
                  <ArrowIcon className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="gap-2">
            <BookOpen className="w-5 h-5" />
            {isRTL ? "جميع المقالات" : "All Articles"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
