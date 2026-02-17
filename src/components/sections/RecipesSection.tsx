import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";

const recipes = [
  {
    title: "كباب حلبي أصلي",
    description: "تعلم سر تحضير الكباب الحلبي الأصيل مع خلطة البهارات الخاصة",
    time: "45 دقيقة",
    servings: "4 أشخاص",
    difficulty: "سهل",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop",
  },
  {
    title: "ستيك مشوي مثالي",
    description: "أسرار شوي الستيك للحصول على قرمشة خارجية ولون وردي من الداخل",
    time: "30 دقيقة",
    servings: "2 أشخاص",
    difficulty: "متوسط",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop",
  },
  {
    title: "ريش غنم بالأعشاب",
    description: "وصفة ريش الغنم المتبلة بالأعشاب العطرية والثوم",
    time: "60 دقيقة",
    servings: "4 أشخاص",
    difficulty: "متوسط",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
  },
];

const RecipesSection = () => {
  return (
    <section id="recipes" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" dir="rtl">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">الوصفات</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            وصفات السرايا
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            تعلّم أفضل طرق تحضير المشاوي والأطباق الشامية باستخدام لحوم السرايا — وصفات سهلة بطعم احترافي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" dir="rtl">
          {recipes.map((recipe, index) => (
            <Card
              key={index}
              className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{recipe.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{recipe.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings}
                  </span>
                </div>
                <Button variant="ghost" className="w-full gap-2 group-hover:text-primary">
                  اقرأ الوصفة
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="gap-2">
            <ChefHat className="w-5 h-5" />
            جميع الوصفات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecipesSection;
