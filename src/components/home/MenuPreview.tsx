import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const menuItems = [
  {
    nameKey: "menu.mixedGrill.name",
    descKey: "menu.mixedGrill.desc",
    price: "189",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop",
  },
  {
    nameKey: "menu.lambRibs.name",
    descKey: "menu.lambRibs.desc",
    price: "145",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&h=200&fit=crop",
  },
  {
    nameKey: "menu.beefKebab.name",
    descKey: "menu.beefKebab.desc",
    price: "85",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop",
  },
  {
    nameKey: "menu.shaqf.name",
    descKey: "menu.shaqf.desc",
    price: "95",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=200&fit=crop",
  },
  {
    nameKey: "menu.herbChicken.name",
    descKey: "menu.herbChicken.desc",
    price: "65",
    isPopular: true,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop",
  },
  {
    nameKey: "menu.filletSteak.name",
    descKey: "menu.filletSteak.desc",
    price: "165",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&h=200&fit=crop",
  },
];

const MenuPreview = () => {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12" dir={isRTL ? "rtl" : "ltr"}>
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            {t("menu.tagline")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            {t("menu.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("menu.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir={isRTL ? "rtl" : "ltr"}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={item.image}
                  alt={t(item.nameKey)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  width={400}
                  height={160}
                />
                {item.isPopular && (
                  <Badge className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-accent text-accent-foreground gap-1`}>
                    <Flame className="w-3 h-3" />
                    {t("menu.popular")}
                  </Badge>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-foreground">{t(item.nameKey)}</h3>
                  <span className="text-accent font-bold text-lg">{item.price} {t("menu.currency")}</span>
                </div>
                <p className="text-muted-foreground text-sm">{t(item.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="gap-2">
            <Link to="/menu">
              {t("menu.viewFullMenu")}
              <Arrow className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MenuPreview;
