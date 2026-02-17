import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft, ShoppingBag, Scale, FileText, MessageCircle, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import PageLayout from "@/components/layout/PageLayout";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { openWhatsAppOrder } from "@/lib/whatsapp-order";

const CartPage = () => {
  const { items, totalItems, totalWeight, subtotal, deliveryFee, total, minimumOrder, isMinimumMet, updateQuantity, updateItemNotes, removeItem, clearCart } = useCart();
  const { t, isRTL, language } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleWeightChange = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newWeight = parseFloat((item.quantity + delta).toFixed(1));
      updateQuantity(id, Math.max(0.5, newWeight));
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 mt-20" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
              {t("cart.title")}
            </h1>
            {totalItems > 0 && (
              <p className="text-muted-foreground mt-1">
                {totalWeight} {language === "ar" ? "كيلو" : "KG"} • {totalItems} {t("cart.items")}
              </p>
            )}
          </div>
          {items.length > 0 && (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={clearCart}>
              <Trash2 className="w-4 h-4 me-2" />
              {t("cart.clearCart")}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">{t("cart.emptyTitle")}</h2>
              <p className="text-muted-foreground max-w-md">{t("cart.emptyDescription")}</p>
            </div>
            <Button asChild size="lg">
              <Link to="/shop" className="gap-2">
                <ArrowIcon className="w-4 h-4" />
                {t("cart.startShopping")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={isRTL ? item.name : (item.nameEn || item.name)}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {isRTL ? item.name : (item.nameEn || item.name)}
                            </h3>
                            {!isRTL && item.name && (
                              <p className="text-sm text-muted-foreground">{item.name}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                        
                        <p className="text-muted-foreground mt-1">
                          {item.price} {t("cart.currency")}/{language === "ar" ? "كيلو" : "KG"}
                        </p>

                        {/* Special Instructions */}
                        <div className="mt-3">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                            <FileText className="w-3 h-3" />
                            {t("cart.notes")}
                          </label>
                          <Textarea
                            value={item.notes || ""}
                            onChange={(e) => updateItemNotes(item.id, e.target.value)}
                            placeholder={t("products.notesPlaceholder")}
                            className="min-h-[50px] text-sm resize-none"
                            maxLength={200}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Weight Selector */}
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleWeightChange(item.id, -0.5)}
                              disabled={item.quantity <= 0.5}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-1 px-2 min-w-[70px] justify-center">
                              <Scale className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{item.quantity}</span>
                              <span className="text-sm text-muted-foreground">
                                {language === "ar" ? "كيلو" : "KG"}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleWeightChange(item.id, 0.5)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {(item.price * item.quantity).toFixed(0)} {t("cart.currency")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Continue Shopping */}
              <div className="pt-4">
                <Button variant="outline" asChild>
                  <Link to="/shop" className="gap-2">
                    <ArrowIcon className="w-4 h-4 rotate-180" />
                    {t("cart.continueShopping")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">{t("cart.orderSummary")}</h2>
                  
                  {/* Minimum Order Warning */}
                  {!isMinimumMet && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm mb-4">
                      <p className="font-medium">{t("cart.minimumOrderTitle")}</p>
                      <p>{t("cart.minimumOrderDesc").replace("{amount}", minimumOrder.toString())}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("cart.totalWeight")}</span>
                      <span className="font-medium">{totalWeight} {language === "ar" ? "كيلو" : "KG"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                      <span>{subtotal.toFixed(0)} {t("cart.currency")}</span>
                    </div>
                    <div className="flex justify-between">
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
                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                      <span>{t("cart.total")}</span>
                      <span className="text-primary">{total.toFixed(0)} {t("cart.currency")}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {/* COD Available Notice */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {t("checkout.codActive")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("checkout.codActiveDesc")}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{t("checkout.iikoStatusReady")}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!isMinimumMet}
                      asChild={isMinimumMet}
                    >
                      {isMinimumMet ? (
                        <Link to="/checkout">
                          {t("cart.checkout")}
                          <ArrowIcon className="w-4 h-4 ms-2" />
                        </Link>
                      ) : (
                        <span>{t("cart.minimumNotMet")}</span>
                      )}
                    </Button>

                    {/* WhatsApp Order Button */}
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      size="lg"
                      onClick={() => {
                        openWhatsAppOrder({
                          items,
                          subtotal,
                          deliveryFee,
                          total,
                          totalWeight,
                        }, isRTL);
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t("cart.orderWhatsApp")}
                    </Button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        ✓ {t("cart.secureCheckout")}
                      </span>
                      <span className="flex items-center gap-1">
                        ✓ {t("cart.freshGuarantee")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CartPage;
