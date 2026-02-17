import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, ArrowLeft, ArrowRight, ChefHat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const RecipesPreview = () => {
  const { t, isRTL } = useLanguage();

  const recipes = [
    {
      id: "lamb-ribs-grilled",
      titleKey: "recipe.lambRibs.title",
      descKey: "recipe.lambRibs.desc",
      time: 60,
      servings: "4-6",
      difficultyKey: "recipes.difficulty.medium",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    },
    {
      id: "shish-taouk",
      titleKey: "recipe.shishTaouk.title",
      descKey: "recipe.shishTaouk.desc",
      time: 45,
      servings: "4",
      difficultyKey: "recipes.difficulty.easy",
      image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop",
    },
    {
      id: "levantine-kebab",
      titleKey: "recipe.kebab.title",
      descKey: "recipe.kebab.desc",
      time: 50,
      servings: "6",
      difficultyKey: "recipes.difficulty.medium",
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
    },
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12" dir={isRTL ? "rtl" : "ltr"}>
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            {t("recipes.tagline")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {t("recipes.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("recipes.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" dir={isRTL ? "rtl" : "ltr"}>
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={t(recipe.titleKey)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  width={400}
                  height={224}
                />
                <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}>
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    {t(recipe.difficultyKey)}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{t(recipe.titleKey)}</h3>
                <p className="text-muted-foreground text-sm mb-4">{t(recipe.descKey)}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.time} {t("recipes.minutes")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} {t("recipes.people")}
                  </span>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full gap-2 group-hover:text-primary"
                >
                  <Link to={`/recipes/${recipe.id}`}>
                    {t("recipes.readRecipe")}
                    <ArrowIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/recipes">
              <ChefHat className="w-5 h-5" />
              {t("recipes.allRecipes")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecipesPreview;
