import { Link, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, ArrowLeft, ChefHat, Lightbulb, ShoppingBag, MessageCircle, Flame } from "lucide-react";
import { generateRecipeSchema, generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { useHeroImages } from "@/hooks/useHeroImages";

const recipes = [
  {
    id: "ريش-غنم-مشوية",
    title: "ريش غنم مشوية على الفحم",
    titleEn: "Grilled Lamb Chops on Charcoal",
    description: "الريش المشوية من أفخم أكلات المشاوي - وصفة سهلة بنكهة عربية أصيلة",
    descriptionEn: "Grilled lamb chops - one of the finest BBQ dishes with authentic Arabian flavor",
    fullDescription: "الريش المشوية من أفخم أكلات المشاوي وأكثرها طلبًا في العزائم والمناسبات. تتميز بطراوتها ونكهتها الغنية عند شويها على الفحم. أفضل ريش غنم من ملحمة السرايا.",
    time: "60 دقيقة",
    prepTime: "PT20M",
    cookTime: "PT40M",
    servings: "4-6 أشخاص",
    difficulty: "متوسط",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop",
    ingredients: [
      "ريش غنم طازجة من ملحمة السرايا",
      "ثوم مهروس",
      "زيت زيتون بكر",
      "ملح وفلفل أسود",
      "بهارات مشاوي"
    ],
    steps: [
      "تتبيل الريش جيدًا بالثوم وزيت الزيتون والبهارات",
      "تركها لمدة ساعة على الأقل في الثلاجة",
      "شويها على فحم متوسط الحرارة 5-6 دقائق لكل جانب"
    ],
    tips: [
      "أفضل ريش غنم من ملحمة السرايا - طازجة ومختارة بعناية",
      "لا تشوِ على نار عالية لتجنب احتراق الخارج قبل نضج الداخل",
      "اترك الريش ترتاح 5 دقائق بعد الشوي لتوزيع العصارات"
    ],
    recommendedCut: "ريش غنم طازجة",
    recommendedCutLink: "/shop/lamb",
    category: "lamb",
    keywords: "ريش غنم مشوية, مشاوي, lamb chops, grilled lamb UAE, ملحمة السرايا"
  },
  {
    id: "شيش-طاووق-شامي",
    title: "شيش طاووق شامي",
    titleEn: "Authentic Shami Shish Tawook",
    description: "شيش طاووق على الطريقة الشامية الأصيلة - طريقة سهلة وطعم شامي أصيل",
    descriptionEn: "Authentic Shami shish tawook - easy recipe with traditional Levantine taste",
    fullDescription: "الشيش طاووق من أشهر أطباق المطبخ الشامي، يتميز بتتبيلته الكريمية من اللبن والثوم. طريقة سهلة + طعم شامي أصيل من ملحمة السرايا.",
    time: "45 دقيقة",
    prepTime: "PT15M",
    cookTime: "PT30M",
    servings: "4 أشخاص",
    difficulty: "سهل",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&h=500&fit=crop",
    ingredients: [
      "صدور دجاج طازجة من ملحمة السرايا",
      "لبن زبادي",
      "ثوم مهروس",
      "عصير ليمون",
      "بهارات شيش طاووق"
    ],
    steps: [
      "قطّع صدور الدجاج إلى مكعبات متساوية",
      "اخلط اللبن مع الثوم والليمون والبهارات",
      "تبّل الدجاج واتركه 4 ساعات في الثلاجة",
      "رتّب على الأسياخ واشوِ 4-5 دقائق لكل جانب"
    ],
    tips: [
      "استخدم صدور دجاج طازجة من ملحمة السرايا للحصول على أفضل قوام",
      "اللبن يجعل الدجاج طريًا - لا تختصر وقت التتبيل"
    ],
    recommendedCut: "صدور دجاج طازجة",
    recommendedCutLink: "/shop/chicken",
    category: "chicken",
    keywords: "شيش طاووق, شامي, دجاج مشوي, shish tawook, grilled chicken UAE"
  },
  {
    id: "كباب-لحم-شامي",
    title: "كباب لحم على الطريقة الشامية",
    titleEn: "Authentic Syrian Kebab",
    description: "لحم مفروم طازج + بصل + بهارات = نتيجة مثالية للشوي",
    descriptionEn: "Fresh minced meat + onion + spices = perfect grilling result",
    fullDescription: "الكباب الشامي من أعرق أطباق المشاوي العربية. لحم مفروم طازج + بصل + بهارات = نتيجة مثالية للشوي من ملحمة السرايا.",
    time: "50 دقيقة",
    prepTime: "PT20M",
    cookTime: "PT30M",
    servings: "6 أشخاص",
    difficulty: "متوسط",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=500&fit=crop",
    ingredients: [
      "لحم مفروم طازج من ملحمة السرايا",
      "بصل مفروم ناعم",
      "بقدونس مفروم",
      "بهارات كباب شامي",
      "ملح وفلفل"
    ],
    steps: [
      "اخلط اللحم المفروم مع البصل والبقدونس والبهارات",
      "اعجن الخليط جيدًا لمدة 5 دقائق",
      "شكّل الكباب على الأسياخ",
      "اشوِ 3-4 دقائق لكل جانب"
    ],
    tips: [
      "اختر لحم مفروم طازج من ملحمة السرايا بنسبة دهون 20%",
      "عجن اللحم جيدًا يساعد على تماسك الكباب"
    ],
    recommendedCut: "لحم بقري مفروم طازج",
    recommendedCutLink: "/shop/beef",
    category: "beef",
    keywords: "كباب شامي, لحم مفروم, kebab, Syrian kebab, ملحمة السرايا"
  },
  {
    id: "دجاج-مشوي-تتبيلة-السرايا",
    title: "دجاج مشوي بتتبيلة السرايا",
    titleEn: "Al Saraya Signature Grilled Chicken",
    description: "وصفة خاصة تناسب العزائم - تتبيلة السرايا الحصرية للدجاج المشوي",
    descriptionEn: "Special recipe perfect for gatherings - Al Saraya exclusive marinade",
    fullDescription: "تتبيلة السرايا الخاصة هي خلطة فريدة تجمع بين نكهات الأعشاب والتوابل العربية. وصفة خاصة تناسب العزائم والمناسبات من ملحمة السرايا.",
    time: "90 دقيقة",
    prepTime: "PT30M",
    cookTime: "PT60M",
    servings: "4-6 أشخاص",
    difficulty: "سهل",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=500&fit=crop",
    ingredients: [
      "دجاجة كاملة طازجة من ملحمة السرايا",
      "زيت زيتون",
      "ثوم مهروس",
      "عصير ليمون",
      "بهارات مشكلة",
      "أعشاب طازجة (زعتر، روزماري)"
    ],
    steps: [
      "نظّف الدجاجة وجففها جيدًا",
      "اخلط التتبيلة وافركها على الدجاجة",
      "اتركها في الثلاجة 4-6 ساعات",
      "اشوِ في الفرن على 200 درجة لمدة 60-75 دقيقة"
    ],
    tips: [
      "اختر دجاجة طازجة من ملحمة السرايا للحصول على أفضل نتيجة",
      "فرك التتبيلة تحت الجلد يضمن نكهة أعمق"
    ],
    recommendedCut: "دجاجة كاملة طازجة",
    recommendedCutLink: "/shop/chicken",
    category: "chicken",
    keywords: "دجاج مشوي, تتبيلة السرايا, grilled chicken, Al Saraya marinade"
  },
  {
    id: "لحم-مشوي-للمناسبات",
    title: "لحم مشوي جاهز للمناسبات",
    titleEn: "Ready Grilled Meat for Events",
    description: "حل سريع وأنيق لكل المناسبات - تشكيلة لحوم مشوية فاخرة",
    descriptionEn: "Quick and elegant solution for all events - premium grilled meat selection",
    fullDescription: "حل سريع وأنيق لكل المناسبات والعزائم. تشكيلة متنوعة من اللحوم المشوية الفاخرة من ملحمة السرايا، جاهزة للتقديم.",
    time: "120 دقيقة",
    prepTime: "PT40M",
    cookTime: "PT80M",
    servings: "10-12 شخص",
    difficulty: "متوسط",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop",
    ingredients: [
      "ستيك ريب آي من ملحمة السرايا",
      "ريش غنم طازجة",
      "لحم مفروم للكباب",
      "شقف لحم بقري",
      "تتبيلات متنوعة"
    ],
    steps: [
      "حضّر التتبيلات المختلفة",
      "تبّل كل نوع لحم بتتبيلته الخاصة",
      "ابدأ بشوي القطع التي تحتاج وقتًا أطول",
      "رتّب على طبق تقديم كبير مع الخضار"
    ],
    tips: [
      "اطلب بوكس المشاوي العائلي من ملحمة السرايا لتوفير الوقت",
      "خطط لتوقيت الشوي بحيث تنتهي جميع اللحوم في نفس الوقت"
    ],
    recommendedCut: "بوكس مشاوي عائلي متنوع",
    recommendedCutLink: "/shop/ready-to-grill",
    category: "special",
    keywords: "لحم مشوي للمناسبات, مشاوي عائلية, grilled meat platter, BBQ for events"
  }
];

const RecipesPage = () => {
  const { id } = useParams();
  const { getHeroImage } = useHeroImages();

  const handleWhatsAppOrder = (productName: string) => {
    const message = encodeURIComponent(`مرحبًا، أريد طلب ${productName} لتحضير الوصفة`);
    window.open(`https://wa.me/023339111?text=${message}`, "_blank");
  };

  // If specific recipe is selected
  if (id) {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) {
      return (
        <PageLayout>
          <SEOHead
            title="الوصفة غير موجودة"
            description="عذرًا، لم نتمكن من العثور على هذه الوصفة"
            noindex={true}
          />
          <PageHero title="الوصفة غير موجودة" subtitle="عذرًا، لم نتمكن من العثور على هذه الوصفة" size="sm" />
        </PageLayout>
      );
    }

    const recipeSchema = generateRecipeSchema({
      name: recipe.title,
      description: recipe.fullDescription,
      image: recipe.image,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "الرئيسية", url: "/" },
      { name: "الوصفات", url: "/recipes" },
      { name: recipe.title, url: `/recipes/${recipe.id}` },
    ]);

    return (
      <PageLayout>
        <SEOHead
          title={`${recipe.title} - وصفة من ملحمة السرايا`}
          titleEn={`${recipe.titleEn} Recipe - Al Saraya Butchery`}
          description={`${recipe.description}. تعلم طريقة التحضير خطوة بخطوة. ${recipe.time} | ${recipe.servings}`}
          descriptionEn={`${recipe.descriptionEn || recipe.titleEn} - Professional recipe. ${recipe.time} | ${recipe.servings}`}
          keywords={recipe.keywords}
          canonical={`/recipes/${recipe.id}`}
          schema={[recipeSchema, breadcrumbSchema]}
          ogType="article"
        />
        
        <PageHero
          title={recipe.title}
          subtitle={recipe.description}
          backgroundImage={recipe.image}
          size="md"
        />

        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto" dir="rtl">
              {/* Recipe Info */}
              <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>{recipe.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>{recipe.servings}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>

              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">مقدمة</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{recipe.fullDescription}</p>
              </section>

              {/* Recommended Cut CTA */}
              <section className="mb-12 p-6 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-foreground mb-1">القطعة الموصى بها</h3>
                    <p className="text-muted-foreground">{recipe.recommendedCut}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button asChild className="gap-2">
                      <Link to={recipe.recommendedCutLink}>
                        <ShoppingBag className="w-4 h-4" />
                        اشترِ الآن
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => handleWhatsAppOrder(recipe.recommendedCut)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      اطلب واتساب
                    </Button>
                  </div>
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-12 mb-12">
                {/* Ingredients */}
                <section aria-labelledby="ingredients-title">
                  <h2 id="ingredients-title" className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">1</span>
                    المكونات
                  </h2>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" aria-hidden="true" />
                        <span className={ing.startsWith("---") ? "font-bold text-foreground" : ""}>{ing.replace(/---/g, "")}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Tips */}
                <section aria-labelledby="tips-title">
                  <h2 id="tips-title" className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-accent" />
                    نصائح الطهاة
                  </h2>
                  <ul className="space-y-4">
                    {recipe.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                        <Flame className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Steps */}
              <section aria-labelledby="steps-title" className="mb-12">
                <h2 id="steps-title" className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">2</span>
                  طريقة التحضير
                </h2>
                <ol className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        {index + 1}
                      </div>
                      <span className="pt-2 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Final CTA */}
              <section className="p-8 bg-foreground text-background rounded-2xl text-center">
                <h3 className="text-2xl font-bold mb-3">جاهز لتحضير هذه الوصفة؟</h3>
                <p className="text-background/70 mb-6">اطلب المكونات الطازجة من ملحمة السرايا واستمتع بأفضل نتيجة</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to={recipe.recommendedCutLink}>
                      <ShoppingBag className="w-5 h-5" />
                      تسوق المكونات
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2 border-background/30 text-background hover:bg-background/10"
                    onClick={() => handleWhatsAppOrder(recipe.recommendedCut)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    اطلب عبر واتساب
                  </Button>
                </div>
              </section>

              {/* Navigation */}
              <nav className="mt-12 pt-8 border-t flex flex-wrap items-center justify-between gap-4" aria-label="التنقل">
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/recipes">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    جميع الوصفات
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="gap-2">
                  <Link to="/shop">
                    تصفح الملحمة
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        </article>

        <WhatsAppCTA />
      </PageLayout>
    );
  }

  // Main recipes page
  const mainBreadcrumbSchema = generateBreadcrumbSchema([
    { name: "الرئيسية", url: "/" },
    { name: "الوصفات", url: "/recipes" },
  ]);

  return (
    <PageLayout>
      <SEOHead
        title="وصفات اللحوم والمشاوي - ملحمة السرايا"
        titleEn="Meat & BBQ Recipes - Al Saraya Butchery UAE"
        description="وصفات لحوم ومشاوي احترافية من ملحمة السرايا - تعلم طريقة عمل ريش الغنم، الكباب الشامي، شيش طاووق، ودجاج مشوي بخطوات سهلة ونصائح الطهاة."
        descriptionEn="Professional meat and BBQ recipes from Al Saraya Butchery UAE - Learn how to make lamb chops, Syrian kebab, shish tawook, and grilled chicken with easy steps and chef tips."
        keywords="وصفات لحوم, وصفات مشاوي, طريقة عمل كباب, وصفة ريش غنم, شيش طاووق, دجاج مشوي, meat recipes UAE, BBQ recipes, kebab recipe, lamb chops recipe, grilled chicken"
        canonical="/recipes"
        schema={mainBreadcrumbSchema}
      />
      
      <PageHero
        title="وصفات السرايا"
        titleEn="Al Saraya Recipes"
        subtitle="وصفات احترافية من طهاة ملحمة السرايا - تعلّم أفضل طرق تحضير المشاوي والأطباق الشامية باستخدام لحومنا الطازجة"
        backgroundImage={getHeroImage('recipes')}
        size="sm"
      />

      <section className="py-12" aria-label="قائمة الوصفات">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" dir="rtl">
            <h2 className="text-2xl font-bold text-foreground mb-3">5 وصفات مميزة من مطبخ السرايا</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              وصفات مجربة ومضمونة باستخدام لحوم ملحمة السرايا الطازجة - مثالية للعزائم والمناسبات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" dir="rtl">
            {recipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow"
              >
                <figure className="relative h-56 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={`وصفة ${recipe.title} - ${recipe.difficulty} - ${recipe.time}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span className="text-white text-sm">{recipe.titleEn}</span>
                  </div>
                </figure>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">{recipe.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{recipe.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      {recipe.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" aria-hidden="true" />
                      {recipe.servings}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 gap-2">
                      <Link to={`/recipes/${recipe.id}`}>
                        اقرأ الوصفة
                        <ArrowLeft className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon">
                      <Link to={recipe.recommendedCutLink} title="اشترِ المكونات">
                        <ShoppingBag className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center" dir="rtl">
          <h2 className="text-3xl font-bold mb-4">جاهز للطبخ؟</h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto">
            اطلب اللحوم الطازجة من ملحمة السرايا واستمتع بتحضير ألذ الوصفات في منزلك
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/shop">
                <ShoppingBag className="w-5 h-5" />
                تسوق الآن
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-background/30 text-background hover:bg-background/10"
              onClick={() => handleWhatsAppOrder("لحوم طازجة")}
            >
              <MessageCircle className="w-5 h-5" />
              اطلب عبر واتساب
            </Button>
          </div>
        </div>
      </section>

      <WhatsAppCTA />
    </PageLayout>
  );
};

export default RecipesPage;
