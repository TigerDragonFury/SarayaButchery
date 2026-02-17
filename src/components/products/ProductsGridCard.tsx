import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { openProductWhatsApp } from "@/lib/whatsapp-order";
import { cn } from "@/lib/utils";

interface ProductsGridCardProps {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  image: string;
  unit?: string;
  allowAddToCart?: boolean;
  category?: string;
}

// Categories that don't need butchery-specific preparation notes
const NON_BUTCHERY_CATEGORIES = ['spices', 'frozen', 'dates', 'pickles', 'dairy', 'bread', 'olive-oil', 'ghee', 'jameed'];

const ProductsGridCard = ({
  id,
  name,
  nameEn,
  price,
  compareAtPrice,
  discountPercent,
  image,
  unit = "kg",
  allowAddToCart = true,
  category,
}: ProductsGridCardProps) => {
  const { addItem, getItemQuantity } = useCart();
  const { language, isRTL } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const itemInCart = getItemQuantity(id);
  const totalPrice = price * quantity;

  const displayName = language === "ar" ? name : (nameEn || name);
  const secondaryName = language === "ar" ? nameEn : (nameEn ? name : null);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(0.5, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!allowAddToCart) return;
    
    setIsAdding(true);
    addItem(
      {
        id: `${id}-${quantity}`,
        name,
        nameEn,
        price,
        image,
        unit: language === "ar" ? "كيلو" : "KG",
      },
      quantity,
      notes.trim() || undefined
    );

    setTimeout(() => {
      setIsAdding(false);
      setNotes("");
      setShowNotes(false);
    }, 1500);
  };

  const handleWhatsAppOrder = () => {
    openProductWhatsApp(name, nameEn, quantity, price, notes.trim() || undefined, isRTL);
  };

  const texts = {
    ar: {
      addToCart: "أضف للسلة",
      added: "تمت الإضافة",
      notes: "ملاحظات",
      notesPlaceholder: "ملاحظات (تقطيع، تتبيل...)",
      inCart: "في السلة",
      currency: "د.إ",
      kg: "كيلو",
    },
    en: {
      addToCart: "Add to Cart",
      added: "Added",
      notes: "Notes",
      notesPlaceholder: "Notes (cutting, marination...)",
      inCart: "in cart",
      currency: "AED",
      kg: "KG",
    },
  };

  const t = texts[language];

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '4/3' }}>
        <img
          src={image}
          alt={displayName}
          className="w-full h-full object-contain bg-white/5 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discountPercent && discountPercent > 0 && (
          <div className="absolute top-2 start-2 z-10">
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              {discountPercent}% OFF
            </span>
          </div>
        )}
        {itemInCart > 0 && (
          <div className={cn("absolute start-2 z-10", discountPercent && discountPercent > 0 ? "top-9" : "top-2")}>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {itemInCart} {t.kg} {t.inCart}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-3" dir={isRTL ? "rtl" : "ltr"}>
        {/* Name */}
        <h3 className="font-bold text-sm line-clamp-1 mb-0.5">{displayName}</h3>
        {secondaryName && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{secondaryName}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="font-bold text-lg">{price}</span>
          <span className="text-xs text-muted-foreground">{t.currency}/{t.kg}</span>
          {compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through ms-1">
              {compareAtPrice} {t.currency}
            </span>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between bg-muted/50 rounded-md p-1 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(-0.5)}
            disabled={quantity <= 0.5}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <span className="font-bold">{quantity}</span>
            <span className="text-xs text-muted-foreground ms-1">{t.kg}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(0.5)}
            disabled={quantity >= 10}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-muted-foreground">{language === "ar" ? "الإجمالي:" : "Total:"}</span>
          <span className="font-bold text-primary">{totalPrice.toFixed(0)} {t.currency}</span>
        </div>

        {/* Notes Toggle - only for butchery products */}
        {!NON_BUTCHERY_CATEGORIES.includes(category || '') && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs mb-2 h-7"
              onClick={() => setShowNotes(!showNotes)}
            >
              {t.notes} {showNotes ? "▲" : "▼"}
            </Button>

            {showNotes && (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="min-h-[50px] text-xs resize-none mb-2"
                maxLength={150}
              />
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {allowAddToCart ? (
            <Button
              size="sm"
              className="flex-1 gap-1 h-9 text-xs"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <Check className="w-3 h-3" />
                  {t.added}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3" />
                  {t.addToCart}
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 gap-1 h-9 text-xs bg-green-600 hover:bg-green-700"
              onClick={handleWhatsAppOrder}
            >
              <MessageCircle className="w-3 h-3" />
              {language === "ar" ? "اطلب واتساب" : "WhatsApp"}
            </Button>
          )}
          
          {allowAddToCart && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
              onClick={handleWhatsAppOrder}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsGridCard;
