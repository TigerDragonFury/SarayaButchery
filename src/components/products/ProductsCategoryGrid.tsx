import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import category images
import beefImage from "@/assets/products/beef-cubes-fresh.jpg";
import lambImage from "@/assets/products/lamb-chops.jpg";
import chickenImage from "@/assets/products/chicken-drumsticks-fresh.jpg";
import readyToCookImage from "@/assets/products/tray-shish-tawook-cream.jpg";
import specialCutsImage from "@/assets/products/tomahawk-steak.png";
import boxesImage from "@/assets/products/family-box.jpg";

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
  color: string;
}

const categories: Category[] = [
  { id: "beef", nameAr: "لحوم بقري", nameEn: "Beef", image: beefImage, color: "from-red-600/80" },
  { id: "lamb", nameAr: "لحوم غنم", nameEn: "Lamb", image: lambImage, color: "from-amber-700/80" },
  { id: "chicken", nameAr: "دجاج", nameEn: "Chicken", image: chickenImage, color: "from-orange-500/80" },
  { id: "ready-to-cook", nameAr: "جاهز للطهي", nameEn: "Ready to Cook", image: readyToCookImage, color: "from-green-600/80" },
  { id: "special-cuts", nameAr: "قطع خاصة", nameEn: "Special Cuts", image: specialCutsImage, color: "from-purple-600/80" },
  { id: "boxes", nameAr: "بوكسات", nameEn: "Boxes", image: boxesImage, color: "from-primary/80" },
];

const ProductsCategoryGrid = () => {
  const { language, isRTL } = useLanguage();

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 80; // Account for sticky nav
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const sectionTitle = language === "ar" ? "تسوّق حسب الفئة" : "Shop by Category";

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          {sectionTitle}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              onClick={() => scrollToCategory(category.id)}
            >
              <CardContent className="p-0 relative aspect-square">
                <img
                  src={category.image}
                  alt={language === "ar" ? category.nameAr : category.nameEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t to-transparent",
                  category.color
                )} />
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <span className="text-white font-bold text-sm md:text-base text-center px-2 drop-shadow-lg">
                    {language === "ar" ? category.nameAr : category.nameEn}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsCategoryGrid;
