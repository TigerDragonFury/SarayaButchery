import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag, Phone, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { useStoreSettings, getWhatsAppUrl } from "@/hooks/useStoreSettings";

const OrderSuccessPage = () => {
  const { t, isRTL } = useLanguage();
  const { settings } = useStoreSettings();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      toast({
        title: isRTL ? "تم النسخ!" : "Copied!",
        description: isRTL ? "تم نسخ رقم الطلب" : "Order number copied to clipboard",
      });
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16 mt-20" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{t("orderSuccess.title")}</h1>
            <p className="text-muted-foreground mb-4">{t("orderSuccess.description")}</p>

            {/* Order Number Display - Shows official iiko POS number */}
            {orderNumber && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {isRTL ? "رقم الطلب الرسمي" : "Official Order Number"}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-primary tracking-wide">{orderNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyOrderNumber}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isRTL 
                    ? "هذا الرقم يطابق رقم الطلب في الكاشير - احتفظ به للتتبع والاستلام" 
                    : "This matches the receipt number - keep it for tracking and pickup"}
                </p>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
              <p className="font-medium mb-1">{t("orderSuccess.whatNext")}</p>
              <p className="text-muted-foreground">{t("orderSuccess.whatNextDesc")}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/" className="gap-2">
                  <Home className="w-4 h-4" />
                  {t("orderSuccess.backHome")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/shop" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {t("orderSuccess.continueShopping")}
                </Link>
              </Button>
            </div>

            {/* Track Order Link */}
            {orderNumber && (
              <div className="mt-4">
                <Button variant="link" asChild>
                  <Link to={`/track?order=${orderNumber}`}>
                    {isRTL ? "تتبع طلبك" : "Track your order"}
                  </Link>
                </Button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3">{t("orderSuccess.needHelp")}</p>
              <Button
                variant="ghost"
                className="gap-2 text-green-600 hover:text-green-700"
                onClick={() => window.open(getWhatsAppUrl(settings.contact), "_blank")}
              >
                <Phone className="w-4 h-4" />
                {t("orderSuccess.contactUs")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default OrderSuccessPage;
