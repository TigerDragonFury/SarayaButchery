import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "لحوم بقري",
    nameEn: "Beef",
    description: "أجود قطع اللحم البقري الطازج",
    image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=300&fit=crop",
    count: 24,
  },
  {
    id: 2,
    name: "لحوم غنم",
    nameEn: "Lamb",
    description: "لحوم غنم طازجة بمذاق أصيل",
    image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=300&fit=crop",
    count: 18,
  },
  {
    id: 3,
    name: "دجاج",
    nameEn: "Chicken",
    description: "دجاج طازج ومتبل جاهز للشوي",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop",
    count: 15,
  },
  {
    id: 4,
    name: "جاهز للشوي",
    nameEn: "Ready to Grill",
    description: "لحوم متبلة وجاهزة للشوي مباشرة",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    count: 12,
  },
  {
    id: 5,
    name: "قطوعات خاصة",
    nameEn: "Special Cuts",
    description: "قطوعات مميزة للمناسبات الخاصة",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop",
    count: 8,
  },
  {
    id: 6,
    name: "عروض وبوكسات",
    nameEn: "Offers & Boxes",
    description: "عروض مميزة وبوكسات عائلية",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
    count: 6,
  },
];

const ShopSection = () => {
  return (
    <section id="shop" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" dir="rtl">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">الملحمة</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            تسوق أجود اللحوم الطازجة
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            اكتشف مجموعتنا المختارة من اللحوم الطازجة والحلال، المجهزة يوميًا بأعلى معايير الجودة والنظافة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4">
                  <span className="bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full">
                    {category.count} منتج
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  تصفح القسم
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="gap-2 px-8">
            <ShoppingCart className="w-5 h-5" />
            عرض جميع المنتجات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
