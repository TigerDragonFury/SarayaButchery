import { useState, useEffect, forwardRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { usePixel } from "@/contexts/PixelContext";
import { cn } from "@/lib/utils";

const StickyCTA = forwardRef<HTMLDivElement, object>((_, ref) => {
  const { t, isRTL } = useLanguage();
  const { trackEvent } = usePixel();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Hide on cart, checkout, and success pages
  const hiddenPaths = ["/cart", "/checkout", "/order-success", "/driver", "/admin"];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    // Show after scrolling 300px
    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 300) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleClick = () => {
    trackEvent("InitiateCheckout", {
      content_name: "Sticky CTA Order Now",
      content_category: "Conversion",
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (shouldHide || !isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background to-transparent",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-lg">
        <div className="relative bg-primary rounded-2xl shadow-2xl shadow-primary/30 p-4">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-primary-foreground font-bold text-lg">
                {t("stickyCTA.title")}
              </p>
              <p className="text-primary-foreground/80 text-sm">
                {t("stickyCTA.subtitle")}
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 gap-2 font-bold shadow-lg"
              onClick={handleClick}
            >
              <Link to="/shop">
                <ShoppingBag className="w-5 h-5" />
                {t("stickyCTA.button")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

StickyCTA.displayName = 'StickyCTA';

export default StickyCTA;
