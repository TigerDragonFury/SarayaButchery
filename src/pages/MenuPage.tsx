import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, MessageCircle } from "lucide-react";
import { useHeroImages } from "@/hooks/useHeroImages";
import { generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { useLanguage } from "@/contexts/LanguageContext";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("grills");
  const { t, isRTL, language } = useLanguage();
  const { getHeroImage } = useHeroImages();

  const menuCategories = [
    { id: "grills", name: t("menu.grills"), nameEn: "Grills" },
    { id: "appetizers", name: t("menu.appetizers"), nameEn: "Appetizers" },
    { id: "steaks", name: t("menu.steaks"), nameEn: "Steaks" },
    { id: "main-dishes", name: t("menu.mainDishes"), nameEn: "Main Dishes" },
    { id: "salads", name: t("menu.salads"), nameEn: "Salads" },
    { id: "beverages", name: t("menu.beverages"), nameEn: "Beverages" },
  ];

  const menuItems: Record<string, Array<{ name: string; nameEn: string; description: string; descriptionEn: string; price: number; isPopular?: boolean; image: string }>> = {
    grills: [
      { name: "مشكل مشاوي السرايا", nameEn: "Al Saraya Mixed Grill", description: "تشكيلة فاخرة من الكباب والشقف والريش", descriptionEn: "Premium selection of kebab, shaqf, and ribs", price: 189, isPopular: true, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop" },
      { name: "ريش غنم مشوية", nameEn: "Grilled Lamb Ribs", description: "ريش غنم طرية متبلة بخلطة خاصة", descriptionEn: "Tender lamb ribs with special marinade", price: 145, isPopular: true, image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&h=200&fit=crop" },
      { name: "كباب لحم بقري", nameEn: "Beef Kebab", description: "كباب لحم بقري مع البهارات الشامية", descriptionEn: "Beef kebab with Levantine spices", price: 85, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop" },
      { name: "شقف لحم", nameEn: "Shaqf Meat", description: "قطع لحم مشوية على الفحم", descriptionEn: "Charcoal grilled meat pieces", price: 95, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=200&fit=crop" },
      { name: "دجاج مشوي بالأعشاب", nameEn: "Herb Grilled Chicken", description: "نصف دجاجة مشوية", descriptionEn: "Half grilled chicken with herbs", price: 65, isPopular: true, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop" },
      { name: "طاووق مشوي", nameEn: "Grilled Tawook", description: "صدور دجاج متبلة ومشوية", descriptionEn: "Marinated grilled chicken breast", price: 55, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=200&fit=crop" },
    ],
    appetizers: [
      { name: "حمص بالطحينة", nameEn: "Hummus with Tahini", description: "حمص كريمي مع الطحينة وزيت الزيتون", descriptionEn: "Creamy hummus with tahini and olive oil", price: 25, image: "https://images.unsplash.com/photo-1578897367107-2828283c46c4?w=300&h=200&fit=crop" },
      { name: "متبل", nameEn: "Moutabal", description: "باذنجان مشوي مع الطحينة", descriptionEn: "Grilled eggplant with tahini", price: 28, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop" },
      { name: "تبولة", nameEn: "Tabbouleh", description: "سلطة البقدونس الشامية", descriptionEn: "Levantine parsley salad", price: 22, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop" },
      { name: "فتوش", nameEn: "Fattoush", description: "سلطة الخضار مع الخبز المحمص", descriptionEn: "Vegetable salad with toasted bread", price: 25, image: "https://images.unsplash.com/photo-1547496502-affa22d38842?w=300&h=200&fit=crop" },
    ],
    steaks: [
      { name: "ستيك ريب آي", nameEn: "Rib Eye Steak", description: "قطعة ريب آي فاخرة 350g", descriptionEn: "Premium rib eye cut 350g", price: 165, isPopular: true, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&h=200&fit=crop" },
      { name: "ستيك فيليه", nameEn: "Fillet Steak", description: "فيليه مينيون 300g", descriptionEn: "Fillet mignon 300g", price: 185, image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop" },
      { name: "تي بون ستيك", nameEn: "T-Bone Steak", description: "قطعة تي بون فاخرة 500g", descriptionEn: "Premium T-bone cut 500g", price: 195, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&h=200&fit=crop" },
      { name: "واغيو ستيك", nameEn: "Wagyu Steak", description: "لحم واغيو A5 200g", descriptionEn: "Wagyu A5 beef 200g", price: 350, isPopular: true, image: "https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?w=300&h=200&fit=crop" },
    ],
    "main-dishes": [
      { name: "منسف", nameEn: "Mansaf", description: "منسف أردني أصيل مع اللحم", descriptionEn: "Authentic Jordanian mansaf with lamb", price: 125, isPopular: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=200&fit=crop" },
      { name: "كبسة لحم", nameEn: "Lamb Kabsa", description: "كبسة باللحم والأرز البسمتي", descriptionEn: "Lamb with basmati rice", price: 95, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop" },
      { name: "مندي لحم", nameEn: "Lamb Mandi", description: "مندي يمني تقليدي", descriptionEn: "Traditional Yemeni mandi", price: 110, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop" },
    ],
    salads: [
      { name: "سلطة سيزر", nameEn: "Caesar Salad", description: "خس رومين مع صلصة سيزر", descriptionEn: "Romaine lettuce with caesar dressing", price: 35, image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300&h=200&fit=crop" },
      { name: "سلطة يونانية", nameEn: "Greek Salad", description: "خضار طازجة مع جبنة فيتا", descriptionEn: "Fresh vegetables with feta cheese", price: 38, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop" },
      { name: "سلطة روكا", nameEn: "Arugula Salad", description: "جرجير مع جبنة بارميزان", descriptionEn: "Arugula with parmesan cheese", price: 32, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop" },
    ],
    beverages: [
      { name: "عصير برتقال طازج", nameEn: "Fresh Orange Juice", description: "عصير برتقال طبيعي", descriptionEn: "Natural orange juice", price: 18, image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300&h=200&fit=crop" },
      { name: "ليموناضة نعناع", nameEn: "Mint Lemonade", description: "ليمون طازج مع النعناع", descriptionEn: "Fresh lemon with mint", price: 15, image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=200&fit=crop" },
      { name: "شاي مغربي", nameEn: "Moroccan Tea", description: "شاي بالنعناع الطازج", descriptionEn: "Tea with fresh mint", price: 12, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&h=200&fit=crop" },
      { name: "قهوة عربية", nameEn: "Arabic Coffee", description: "قهوة عربية مع الهيل", descriptionEn: "Arabic coffee with cardamom", price: 10, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=200&fit=crop" },
    ],
  };

  const handleWhatsAppOrder = () => {
    const message = language === "ar" 
      ? "مرحبًا، أريد الطلب من قائمة الطعام"
      : "Hello, I would like to order from the menu";
    window.open(`https://wa.me/023339111?text=${encodeURIComponent(message)}`, "_blank");
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? "القائمة" : "Menu", url: "/menu" },
  ]);

  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": isRTL ? "قائمة مشاوي ملحمة السرايا" : "Al Saraya Butchery Grill Menu",
    "description": isRTL ? "قائمة المشاوي والأطباق الشامية الأصيلة" : "Authentic Levantine grills and dishes menu",
    "hasMenuSection": menuCategories.map(cat => ({
      "@type": "MenuSection",
      "name": isRTL ? cat.name : cat.nameEn,
      "hasMenuItem": menuItems[cat.id]?.map(item => ({
        "@type": "MenuItem",
        "name": isRTL ? item.name : item.nameEn,
        "description": isRTL ? item.description : item.descriptionEn,
        "offers": {
          "@type": "Offer",
          "price": item.price,
          "priceCurrency": "AED"
        }
      }))
    }))
  };

  return (
    <PageLayout>
      <SEOHead
        title={isRTL ? "قائمة المشاوي والأطباق" : "Grill Menu & Dishes"}
        titleEn="Grill Menu & Dishes"
        description={isRTL ? "قائمة مشاوي ملحمة السرايا - مشاوي شامية أصيلة، ستيك فاخر، أطباق رئيسية ومقبلات. اطلب الآن في دبي وأبوظبي." : "Al Saraya Butchery Menu - Authentic Arabic grills, premium steaks, main dishes and appetizers."}
        descriptionEn="Al Saraya Butchery Menu - Authentic Arabic grills, premium steaks, main dishes and appetizers. Order now in Dubai and Abu Dhabi."
        keywords="قائمة مشاوي, مطعم مشاوي الإمارات, ستيك دبي, كباب, ريش غنم, Arabic grill menu, steak restaurant UAE"
        canonical="/menu"
        schema={{ ...breadcrumbSchema, ...menuSchema }}
      />
      
      <PageHero
        title={t("menu.tagline")}
        titleEn="Our Menu"
        subtitle={isRTL ? "مشاوي طازجة تُحضّر يوميًا باستخدام لحومنا المختارة، بتتبيل شامي أصيل" : "Fresh grills prepared daily using our selected meats with authentic Levantine seasoning"}
        backgroundImage={getHeroImage('menu')}
        size="sm"
      >
        <Button
          size="lg"
          className="gap-2 bg-green-600 hover:bg-green-700"
          onClick={handleWhatsAppOrder}
        >
          <MessageCircle className="w-5 h-5" />
          {t("cta.orderNow")}
        </Button>
      </PageHero>

      <section className="py-12" aria-label={isRTL ? "قائمة الطعام" : "Menu"}>
        <div className="container mx-auto px-4">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} dir={isRTL ? "rtl" : "ltr"}>
            <nav className="overflow-x-auto pb-4 mb-8" aria-label={isRTL ? "أقسام القائمة" : "Menu sections"}>
              <TabsList className="inline-flex w-max gap-2 bg-muted/50 p-2">
                {menuCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                  >
                    {isRTL ? cat.name : cat.nameEn}
                  </TabsTrigger>
                ))}
              </TabsList>
            </nav>

            {menuCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems[category.id]?.map((item, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow"
                    >
                      <figure className="relative h-40 overflow-hidden">
                        <img
                          src={item.image}
                          alt={`${isRTL ? item.name : item.nameEn} - ${category.nameEn}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        {item.isPopular && (
                          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground gap-1">
                            <Flame className="w-3 h-3" />
                            {t("menu.popular")}
                          </Badge>
                        )}
                      </figure>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-foreground">
                            {isRTL ? item.name : item.nameEn}
                          </h3>
                          <span className="text-accent font-bold text-lg">
                            {item.price} {t("menu.currency")}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {isRTL ? item.description : item.descriptionEn}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Order CTA */}
      <section className="py-16 bg-primary/5" aria-label={isRTL ? "اطلب الآن" : "Order Now"}>
        <div className="container mx-auto px-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl font-bold text-foreground mb-4">{t("menu.readyToOrder")}</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("menu.orderNowMessage")}
          </p>
          <Button
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={handleWhatsAppOrder}
          >
            <MessageCircle className="w-5 h-5" />
            {t("cta.orderWhatsappNow")}
          </Button>
        </div>
      </section>

      <WhatsAppCTA />
    </PageLayout>
  );
};

export default MenuPage;
