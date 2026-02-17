import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Utensils, Clock, MapPin, Phone } from "lucide-react";
import { restaurantCategories, MenuItem } from "@/data/restaurantMenu";
import { useHeroImages } from "@/hooks/useHeroImages";
import { generateBreadcrumbSchema } from "@/lib/seo-schemas";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_NUMBER = "971566808565";

const RestaurantPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { t, isRTL, language } = useLanguage();
  const { getHeroImage } = useHeroImages();

  const filteredItems = selectedCategory === "all"
    ? restaurantCategories.flatMap(cat => cat.items)
    : restaurantCategories.find(c => c.id === selectedCategory)?.items || [];

  const handleOrder = (item: MenuItem) => {
    const message = language === "ar" 
      ? `مرحبًا، أريد طلب من المطعم:\n${item.name} - ${item.price} درهم`
      : `Hello, I would like to order from the restaurant:\n${item.nameEn} - ${item.price} AED`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleOrderAll = () => {
    const message = language === "ar" 
      ? "مرحبًا، أريد الطلب من مطعم السرايا"
      : "Hello, I would like to order from Al Saraya Restaurant";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: isRTL ? "الرئيسية" : "Home", url: "/" },
    { name: isRTL ? "المطعم" : "Restaurant", url: "/restaurant" },
  ]);

  return (
    <PageLayout>
      <SEOHead
        title={isRTL ? "مطعم السرايا - أكل شامي أصيل" : "Al Saraya Restaurant - Authentic Levantine Food"}
        titleEn="Al Saraya Restaurant - Authentic Levantine Food"
        description={isRTL ? "مطعم السرايا يقدم أشهى الأكلات الشامية الأصيلة - مشاوي، فخاريات، مناقيش، شاميات وأكثر. توصيل في أبوظبي." : "Al Saraya Restaurant serves authentic Levantine cuisine - BBQ, pottery dishes, manakeesh, and more."}
        descriptionEn="Al Saraya Restaurant serves authentic Levantine cuisine - BBQ, pottery dishes, manakeesh, and more. Delivery in Abu Dhabi."
        keywords="مطعم السرايا, أكل شامي, مشاوي, فخاريات, مناقيش, توصيل أبوظبي, Al Saraya Restaurant, Levantine food UAE"
        canonical="/restaurant"
        schema={breadcrumbSchema}
      />

      <PageHero
        title={isRTL ? "مطعم السرايا" : "Al Saraya Restaurant"}
        titleEn="Al Saraya Restaurant"
        subtitle={isRTL ? t("restaurant.tagline") : t("restaurant.taglineEn")}
        backgroundImage={getHeroImage('restaurant')}
        size="md"
      />

      {/* Restaurant Info Banner */}
      <section className="bg-primary/5 border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm" dir={isRTL ? "rtl" : "ltr"}>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>{isRTL ? "8 صباحًا - 10 مساءً" : "8 AM - 10 PM"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{isRTL ? "أبوظبي - الكورنيش - برج الهنا" : "Abu Dhabi - Corniche - Al Hana Tower"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <span dir="ltr">0566808565</span>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Utensils className="w-4 h-4" />
              {t("restaurant.deliveryAvailable")}
            </Badge>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? "" : "lg:flex-row-reverse"}`} dir={isRTL ? "rtl" : "ltr"}>
            {/* Sidebar Categories */}
            <aside className="lg:w-64 flex-shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    {t("restaurant.menuSections")}
                  </h2>
                  <nav className="space-y-1">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedCategory("all")}
                    >
                      {t("restaurant.showAll")}
                    </Button>
                    {restaurantCategories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {isRTL ? cat.name : cat.nameEn}
                        <span className={`${isRTL ? "mr-auto" : "ml-auto"} text-xs opacity-60`}>
                          ({cat.items.length})
                        </span>
                      </Button>
                    ))}
                  </nav>

                  {/* Order CTA */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <Button
                      onClick={handleOrderAll}
                      className="w-full gap-2 bg-green-500 hover:bg-green-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t("cta.orderNow")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Menu Items Grid */}
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {selectedCategory === "all" 
                    ? t("restaurant.allItems")
                    : isRTL 
                      ? restaurantCategories.find(c => c.id === selectedCategory)?.name
                      : restaurantCategories.find(c => c.id === selectedCategory)?.nameEn}
                </h2>
                <Badge variant="outline">
                  {filteredItems.length} {t("restaurant.items")}
                </Badge>
              </div>

              {/* Category Sections */}
              {selectedCategory === "all" ? (
                restaurantCategories.map((category) => (
                  <div key={category.id} className="mb-10">
                    <h3 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-border flex items-center justify-between">
                      <span>{isRTL ? category.name : category.nameEn}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {isRTL ? category.nameEn : category.name}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {category.items.map((item) => (
                        <MenuItemCard key={item.id} item={item} onOrder={handleOrder} isRTL={isRTL} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} onOrder={handleOrder} isRTL={isRTL} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 py-8">
        <div className="container mx-auto px-4 text-center" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("restaurant.readyToOrder")}
          </h2>
          <p className="text-white/80 mb-6">
            {t("restaurant.fastDelivery")}
          </p>
          <Button
            onClick={handleOrderAll}
            size="lg"
            className="gap-3 bg-white text-green-600 hover:bg-white/90 font-bold shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
            {t("cta.orderWhatsappNow")}
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  onOrder: (item: MenuItem) => void;
  isRTL: boolean;
}

const MenuItemCard = ({ item, onOrder, isRTL }: MenuItemCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="group hover:shadow-lg transition-all hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
              {isRTL ? item.name : item.nameEn}
            </h4>
            <p className="text-sm text-muted-foreground">{isRTL ? item.nameEn : item.name}</p>
          </div>
          <Badge variant="secondary" className="font-bold text-primary shrink-0">
            {item.price} {isRTL ? "د.إ" : "AED"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => onOrder(item)}
        >
          <MessageCircle className="w-4 h-4" />
          {t("cta.orderNow")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RestaurantPage;
