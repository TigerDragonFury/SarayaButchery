import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, Scale } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { useState } from "react";

const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const { items, totalItems, totalWeight, subtotal, deliveryFee, total, minimumOrder, isMinimumMet, updateQuantity, removeItem } = useCart();
  const { t, isRTL, language } = useLanguage();

  const handleWeightChange = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newWeight = parseFloat((item.quantity + delta).toFixed(1));
      updateQuantity(id, Math.max(0.5, newWeight));
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={isRTL ? "سلة التسوق" : "Shopping cart"}
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side={isRTL ? "left" : "right"} className="w-full sm:max-w-md flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {t("cart.title")}
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground font-normal">
                ({totalWeight} {language === "ar" ? "كيلو" : "KG"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">{t("cart.empty")}</p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/shop">{t("cart.continueShopping")}</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Minimum order warning */}
            {!isMinimumMet && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">
                {t("cart.minimumOrder")}: {minimumOrder} {t("cart.currency")}
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <img
                    src={item.image}
                    alt={isRTL ? item.name : (item.nameEn || item.name)}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {isRTL ? item.name : (item.nameEn || item.name)}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.price} {t("cart.currency")}/{language === "ar" ? "كيلو" : "KG"}
                    </p>
                    
                    {/* Special Instructions */}
                    {item.notes && (
                      <div className="mt-1 p-1.5 bg-accent/50 rounded text-xs">
                        <span className="text-muted-foreground">{t("cart.notes")}: </span>
                        <span className="text-foreground">{item.notes}</span>
                      </div>
                    )}
                    
                    {/* Weight Selector */}
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleWeightChange(item.id, -0.5)}
                        disabled={item.quantity <= 0.5}
                        aria-label={isRTL ? "تقليل الكمية" : "Decrease quantity"}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <div className="flex items-center gap-1 px-2 min-w-[60px] justify-center">
                        <Scale className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-sm">{item.quantity}</span>
                        <span className="text-xs text-muted-foreground">
                          {language === "ar" ? "كيلو" : "KG"}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleWeightChange(item.id, 0.5)}
                        aria-label={isRTL ? "زيادة الكمية" : "Increase quantity"}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 ms-auto"
                        onClick={() => removeItem(item.id)}
                        aria-label={isRTL ? "حذف المنتج" : "Remove item"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {(item.price * item.quantity).toFixed(0)} {t("cart.currency")}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("cart.totalWeight")}</span>
                <span>{totalWeight} {language === "ar" ? "كيلو" : "KG"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span>{subtotal.toFixed(0)} {t("cart.currency")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("cart.delivery")}</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                  {deliveryFee === 0 ? t("cart.freeDelivery") : `${deliveryFee} ${t("cart.currency")}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("cart.freeDeliveryNote")}
                </p>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>{t("cart.total")}</span>
                <span className="text-primary">{total.toFixed(0)} {t("cart.currency")}</span>
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button
                asChild
                className="w-full"
                size="lg"
                disabled={!isMinimumMet}
                onClick={() => setOpen(false)}
              >
                <Link to="/checkout">{t("cart.checkout")}</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full"
                onClick={() => setOpen(false)}
              >
                <Link to="/shop">{t("cart.continueShopping")}</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
