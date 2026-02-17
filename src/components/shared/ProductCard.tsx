import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { openProductWhatsApp } from "@/lib/whatsapp-order";
import { optimizeImageUrl } from "@/lib/image-utils";

interface ProductCardProps {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  unit?: string;
  image: string;
  isNew?: boolean;
  isOnSale?: boolean;
  category?: string;
}

// Categories that don't need butchery-specific preparation notes
const NON_BUTCHERY_CATEGORIES = ['spices', 'frozen', 'dates', 'pickles', 'dairy', 'bread', 'olive-oil', 'ghee', 'jameed'];

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2];

const ProductCard = ({
  id,
  name,
  nameEn,
  description,
  price,
  originalPrice,
  weight,
  unit,
  image,
  isNew,
  isOnSale,
  category,
}: ProductCardProps) => {
  const { addItem, getItemQuantity } = useCart();
  const { t, isRTL, language } = useLanguage();
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [notes, setNotes] = useState("");
  
  const itemInCart = getItemQuantity(id);
  const calculatedPrice = price * selectedWeight;

  const handleWeightChange = (delta: number) => {
    const newWeight = Math.max(0.5, Math.min(10, selectedWeight + delta));
    setSelectedWeight(parseFloat(newWeight.toFixed(1)));
  };

  const handleWhatsAppOrder = () => {
    openProductWhatsApp(name, nameEn, selectedWeight, price, notes.trim() || undefined, isRTL);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: `${id}-${selectedWeight}`,
      name,
      nameEn,
      price,
      image,
      unit: language === "ar" ? "كيلو" : "KG",
      category,
    }, selectedWeight, notes.trim() || undefined);
    
    setTimeout(() => {
      setIsAdding(false);
      setNotes(""); // Clear notes after adding
    }, 1500);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: '4/3' }}>
        <img
          src={optimizeImageUrl(image, 400)}
          alt={name}
          className="w-full h-full object-contain bg-white/5 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={400}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground">{t("products.new")}</Badge>
          )}
          {isOnSale && (
            <Badge className="bg-destructive text-destructive-foreground">{t("products.sale")}</Badge>
          )}
        </div>

        {/* Cart indicator */}
        {itemInCart > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground">
              {itemInCart} {language === "ar" ? "كيلو" : "KG"} {t("cart.inCart")}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4" dir={isRTL ? "rtl" : "ltr"}>
        {/* Product Name */}
        <h3 className="text-lg font-bold text-foreground mb-0.5 line-clamp-1">
          {isRTL ? name : (nameEn || name)}
        </h3>
        {!isRTL && name && (
          <p className="text-xs text-muted-foreground mb-1">{name}</p>
        )}
        {isRTL && nameEn && (
          <p className="text-xs text-muted-foreground mb-1">{nameEn}</p>
        )}
        <p className="text-muted-foreground text-sm mb-3 line-clamp-1">{description}</p>
        
        {/* Price per KG */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-foreground">{price}</span>
          <span className="text-sm text-muted-foreground">{t("cart.currency")}/{isRTL ? "كيلو" : "KG"}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice} {t("cart.currency")}
            </span>
          )}
        </div>

        {/* Weight Selector */}
        <div className="bg-muted/50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t("products.selectWeight")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("products.pricePerKg")}: {price} {t("cart.currency")}
            </span>
          </div>
          
          {/* Quick Weight Options */}
          <div className="flex gap-1 mb-2">
            {WEIGHT_OPTIONS.map((w) => (
              <Button
                key={w}
                variant={selectedWeight === w ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-xs px-1"
                onClick={() => setSelectedWeight(w)}
              >
                {w} {isRTL ? "كيلو" : "KG"}
              </Button>
            ))}
          </div>

          {/* Custom Weight with +/- */}
          <div className="flex items-center justify-between bg-background rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => handleWeightChange(-0.5)}
              disabled={selectedWeight <= 0.5}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="font-bold text-lg">{selectedWeight}</span>
              <span className="text-sm text-muted-foreground ms-1">
                {isRTL ? "كيلو" : "KG"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => handleWeightChange(0.5)}
              disabled={selectedWeight >= 10}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Live Total Price */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <span className="text-sm font-medium">{t("products.total")}:</span>
            <span className="text-lg font-bold text-primary">
              {calculatedPrice.toFixed(0)} {t("cart.currency")}
            </span>
          </div>
        </div>

        {/* Weight Policy Notice - only for butchery products */}
        {!NON_BUTCHERY_CATEGORIES.includes(category || '') && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-2.5 py-1.5 mb-3">
            <span>⚖️</span>
            <span>{isRTL ? 'الوزن قبل التنظيف – قد يقل بعد التجهيز' : 'Weight before cleaning – may decrease after preparation'}</span>
          </div>
        )}

        {/* Special Instructions - only for butchery products */}
        {!NON_BUTCHERY_CATEGORIES.includes(category || '') && (
          <div className="mb-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("products.notesPlaceholder")}
              className="min-h-[60px] text-sm resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("products.notesHint")}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 gap-2"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4 animate-scale-in" />
                {t("products.added")}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {t("products.addToCart")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
            onClick={handleWhatsAppOrder}
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
