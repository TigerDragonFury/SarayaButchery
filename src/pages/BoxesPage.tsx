import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import WhatsAppCTA from "@/components/shared/WhatsAppCTA";
import SEOHead from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useHeroImages } from "@/hooks/useHeroImages";

// Import box images
import meatBox from "@/assets/products/meat-box.jpg";
import familyBox from "@/assets/products/family-box.jpg";
import burgerBox from "@/assets/products/burger-box.jpg";
import burgerBoxSmall from "@/assets/products/burger-box-small.jpg";
import hebaBox from "@/assets/products/heba-box.jpg";

const BoxesPage = () => {
  const { t, isRTL, language } = useLanguage();
  const { addItem } = useCart();
  const { getHeroImage } = useHeroImages();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const boxes = [
    {
      id: "box-heba",
      name: "بوكس هبة",
      nameEn: "Heba Box",
      desc: "3 كباب • 3 تكة • 3 طاووق • بوكس مع منقل • حمص • ثوم • تبولة • مخلل • كولا • قفاز مع ملقط • بلوز • خبز • صوص تبولة شطة • ماء • كاتلري • كبريت",
      descEn: "3 Kabab • 3 Tekka • 3 Tawook • Box with Grill • Hummus • Garlic • Tabouli • Pickles • Cola • Gloves with Tongs • Blouse • Bread • Tabouli Chili Sauce • Water • Cutlery • Matches",
      price: 85,
      serves: "1-2 شخص",
      servesEn: "1-2 persons",
      image: hebaBox,
      isTrending: true,
    },
    {
      id: "box-festive",
      name: "بوكس اللمة الكبيرة",
      nameEn: "Festive Dipping Box",
      desc: "14 كباب • 14 تكة • 14 طاووق • 7 سجق • 7 كباب دجاج • 2 حمص • 2 ثوم • 2 متبل • 2 تبولة • 2 فتوش • خبز • 2 كوكا كولا • أدوات المائدة • منقل وسط • 4 كيلو فحم • مشعل • هواية • 6 مخلل • 4 سلطة زيتون حارة • 10 كول سلو • 4 بيواز • 4 مخلل زهرة",
      descEn: "14 Kabab • 14 Tekka • 14 Tawook • 7 Sausage • 7 Chicken Kabab • 2 Hummus • 2 Garlic • 2 Mutabl • 2 Tabouli • 2 Fattoush • Bread • 2 Coca Cola • Tableware • Medium Coal Transporter • 4kg Coal • Charcoal Torch • Fan • 6 Pickles • 4 Spicy Olive Salad • 10 Coleslaw • 4 Bewaz • 4 Pickled Cauliflower",
      price: 599,
      serves: "10-15 شخص",
      servesEn: "10-15 persons",
      image: meatBox,
      isBestSeller: true,
    },
    {
      id: "box-family",
      name: "بوكس العائلة",
      nameEn: "Family Box",
      desc: "7 كباب • 7 تكة • 7 طاووق • 4 سجق • 4 كباب دجاج • 2 حمص • ثوم • متبل • تبولة • خبز • فتوش • كوكا كولا • أدوات المائدة • منقل صغير • 2 كيلو فحم • مشعل • هواية • 3 مخلل • 2 سلطة زيتون حارة • 6 كول سلو • 2 بيواز • 2 مخلل زهرة",
      descEn: "7 Kabab • 7 Tekka • 7 Tawook • 4 Sausage • 4 Chicken Kabab • 2 Hummus • Garlic • Mutabl • Tabouli • Bread • Fattoush • Coca Cola • Tableware • Small Coal Transporter • 2kg Coal • Charcoal Torch • Fan • 3 Pickles • 2 Spicy Olive Salad • 6 Coleslaw • 2 Bewaz • 2 Pickled Cauliflower",
      price: 349,
      serves: "5-7 أشخاص",
      servesEn: "5-7 persons",
      image: familyBox,
    },
    {
      id: "box-burger-16",
      name: "بوكس برجر 16 قطعة",
      nameEn: "Burger Box 16 Pieces",
      desc: "16 برجر • 16 جبنة • كاتشب • مايونيز • صوص برجر • 16 كول سلو • 2 عسل • مخلل • هلبينو • 16 قفاز • 2 خبز بطاط • طماطم شرحات • بصل شرحات • خس مقطع • مفرش • 16 كاتلري • 2 بلوز",
      descEn: "16 Burger Patties • 16 Cheese Slices • Ketchup • Mayonnaise • Burger Sauce • 16 Coleslaw • 2 Honey • Pickles • Jalapeño • 16 Gloves • 2 Potato Buns • Sliced Tomatoes • Sliced Onions • Chopped Lettuce • Tablecloth • 16 Cutlery • 2 Blouse",
      price: 225,
      serves: "16 قطعة",
      servesEn: "16 pieces",
      image: burgerBox,
    },
    {
      id: "box-burger-8",
      name: "بوكس برجر 8 قطع",
      nameEn: "Burger Box 8 Pieces",
      desc: "8 برجر • 8 جبنة • كاتشب • مايونيز • صوص برجر • 8 كول سلو • عسل • مخلل • هلبينو • 8 قفاز • خبز بطاط • طماطم شرحات • بصل شرحات • خس مقطع • مفرش • 8 كاتلري • بلوز",
      descEn: "8 Burger Patties • 8 Cheese Slices • Ketchup • Mayonnaise • Burger Sauce • 8 Coleslaw • Honey • Pickles • Jalapeño • 8 Gloves • Potato Buns • Sliced Tomatoes • Sliced Onions • Chopped Lettuce • Tablecloth • 8 Cutlery • Blouse",
      price: 130,
      serves: "8 قطع",
      servesEn: "8 pieces",
      image: burgerBoxSmall,
    },
  ];

  const getQuantity = (boxId: string) => quantities[boxId] || 1;
  const getNote = (boxId: string) => notes[boxId] || "";

  const handleQuantityChange = (boxId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [boxId]: Math.max(1, Math.min(10, (prev[boxId] || 1) + delta))
    }));
  };

  const setNote = (boxId: string, note: string) => {
    setNotes(prev => ({...prev, [boxId]: note}));
  };

  const handleAddToCart = (box: typeof boxes[0]) => {
    const quantity = getQuantity(box.id);
    const note = getNote(box.id);
    setAddingId(box.id);
    
    addItem({
      id: box.id,
      name: box.name,
      nameEn: box.nameEn,
      price: box.price,
      image: box.image,
      unit: language === "ar" ? "بوكس" : "Box",
      category: "boxes",
    }, quantity, note.trim() || undefined);
    
    setTimeout(() => {
      setAddingId(null);
      setNotes(prev => ({...prev, [box.id]: ""}));
    }, 1500);
  };

  const handleWhatsAppOrder = (box: typeof boxes[0]) => {
    const quantity = getQuantity(box.id);
    const note = getNote(box.id);
    const productName = `${box.name} (${box.nameEn})`;
    const totalPrice = box.price * quantity;
    const qtyText = language === "ar" ? `${quantity} بوكس` : `${quantity} Box(es)`;
    const notesText = note ? (language === "ar" ? `\nملاحظات: ${note}` : `\nNotes: ${note}`) : "";
    const message = language === "ar"
      ? `مرحبًا، أريد طلب: ${productName} - ${qtyText} - ${totalPrice} د.إ${notesText}`
      : `Hello, I would like to order: ${productName} - ${qtyText} - ${totalPrice} AED${notesText}`;
    window.open(`https://wa.me/971566808565?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getProductName = (product: typeof boxes[0]) => {
    return language === "ar" ? product.name : product.nameEn;
  };

  const getProductDesc = (product: typeof boxes[0]) => {
    return language === "ar" ? product.desc : product.descEn;
  };

  const getServes = (product: typeof boxes[0]) => {
    return language === "ar" ? product.serves : product.servesEn;
  };

  return (
    <PageLayout>
      <SEOHead
        title="بوكسات خاصة - ملحمة السرايا"
        titleEn="Special Boxes - Al Saraya Butchery"
        description="بوكسات شوي متكاملة جاهزة للحفلات والمناسبات من ملحمة السرايا - بوكس هبة، بوكس العائلة، بوكس البرجر"
        descriptionEn="Complete BBQ boxes ready for parties and events from Al Saraya Butchery - Heba Box, Family Box, Burger Box"
        keywords="بوكسات شوي, بوكس لحم, بوكس برجر, بوكس عائلة, ملحمة السرايا, BBQ box UAE"
        canonical="/shop/boxes"
      />
      
      <PageHero
        title={language === "ar" ? "بوكسات خاصة" : "Special Boxes"}
        titleEn="Special Boxes"
        subtitle={language === "ar" ? "بوكسات متكاملة جاهزة للشوي والحفلات - كل ما تحتاجه في بوكس واحد" : "Complete boxes ready for BBQ and parties - everything you need in one box"}
        backgroundImage={getHeroImage('boxes')}
        size="sm"
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" dir={isRTL ? "rtl" : "ltr"}>
            {boxes.map((box) => {
              const quantity = getQuantity(box.id);
              const totalPrice = box.price * quantity;
              const isAdding = addingId === box.id;
              const note = getNote(box.id);

              return (
                <Card
                  key={box.id}
                  className={`group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${box.isTrending ? "ring-2 ring-orange-500" : ""}`}
                >
                  <div className="relative overflow-hidden h-72">
                    <img
                      src={box.image}
                      alt={getProductName(box)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Badges */}
                    <div className={`absolute top-4 flex flex-col gap-2 ${isRTL ? "right-4" : "left-4"}`}>
                      {box.isTrending && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm px-3 py-1 animate-pulse">
                          🔥 {language === "ar" ? "ترند" : "Trending"}
                        </Badge>
                      )}
                      {box.isBestSeller && (
                        <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                          {language === "ar" ? "الأكثر طلباً" : "Best Seller"}
                        </Badge>
                      )}
                    </div>

                    {/* Serves badge */}
                    <div className={`absolute bottom-4 ${isRTL ? "left-4" : "right-4"}`}>
                      <Badge variant="secondary" className="bg-background/90 text-foreground text-sm px-3 py-1">
                        {getServes(box)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {getProductName(box)}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {getProductDesc(box)}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {box.price} {language === "ar" ? "د.إ" : "AED"}
                      </span>
                      <span className="text-sm text-muted-foreground">/{isRTL ? "بوكس" : "Box"}</span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t("products.quantity")}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-background rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => handleQuantityChange(box.id, -1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="font-bold text-xl">{quantity}</span>
                          <span className="text-sm text-muted-foreground ms-1">
                            {isRTL ? "بوكس" : "Box"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          onClick={() => handleQuantityChange(box.id, 1)}
                          disabled={quantity >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Live Total Price */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-sm font-medium">{t("products.total")}:</span>
                        <span className="text-lg font-bold text-primary">
                          {totalPrice} {t("cart.currency")}
                        </span>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div className="mb-4">
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(box.id, e.target.value)}
                        placeholder={t("products.boxNotesPlaceholder")}
                        className="min-h-[50px] text-sm resize-none"
                        maxLength={200}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleAddToCart(box)}
                        disabled={isAdding}
                      >
                        {isAdding ? (
                          <>
                            <Check className="w-4 h-4 animate-scale-in" />
                            {t("products.added")}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            {t("products.addToCart")}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                        onClick={() => handleWhatsAppOrder(box)}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <WhatsAppCTA variant="banner" buttonText={language === "ar" ? "اطلب الآن عبر واتساب" : "Order Now via WhatsApp"} />
    </PageLayout>
  );
};

export default BoxesPage;
