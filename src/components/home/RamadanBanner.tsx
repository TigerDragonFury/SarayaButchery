import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Moon, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { lazy, Suspense } from "react";

const RamadanCountdown = lazy(() => import("@/components/shared/RamadanCountdown"));

const RamadanBanner = () => {
  const { isRTL } = useLanguage();

  // Show banner from Feb 14 to Mar 30, 2026
  const now = new Date();
  const showFrom = new Date("2026-02-14T00:00:00+04:00");
  const showUntil = new Date("2026-03-30T23:59:59+04:00");
  if (now < showFrom || now > showUntil) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4 py-8 lg:py-10 max-w-[1280px] relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 text-sm font-semibold text-primary">
            <Moon className="w-4 h-4" />
            {isRTL ? "عروض رمضان الخاصة" : "Ramadan Special Offers"}
            <Moon className="w-4 h-4" />
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold text-foreground">
            {isRTL
              ? "🔥 عروض رمضان — اطلب لحوم الإفطار الطازجة"
              : "🔥 Ramadan Special Offers — Order Fresh Halal Meat for Iftar"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "باقات إفطار وسحور جاهزة • شواء رمضان • واغيو فاخر • توصيل مبرّد قبل الإفطار"
              : "Ready Iftar & Suhoor packs • Ramadan BBQ • Premium Wagyu • Refrigerated delivery before Iftar"}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link to="/ramadan-meat-offers-abu-dhabi">
                {isRTL ? "👉 اطلب الآن للإفطار" : "👉 Order Now for Iftar"}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2">
              <a href="https://wa.me/971566808565?text=رمضان كريم 🌙 أريد طلب لحوم الإفطار" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5" />
                {isRTL ? "واتساب رمضان" : "Ramadan WhatsApp"}
              </a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground pt-2">
            <Link to="/ramadan-bbq-box-abu-dhabi" className="hover:text-primary transition-colors underline">
              {isRTL ? "باقة شواء رمضان" : "Ramadan BBQ Box"}
            </Link>
            <Link to="/ramadan-wagyu-offer" className="hover:text-primary transition-colors underline">
              {isRTL ? "عرض واغيو رمضان" : "Wagyu Ramadan Offer"}
            </Link>
            <Link to="/ramadan-meat-delivery-abu-dhabi" className="hover:text-primary transition-colors underline">
              {isRTL ? "توصيل رمضان" : "Ramadan Delivery"}
            </Link>
          </div>
        </div>
      </div>
      <Suspense fallback={null}><RamadanCountdown /></Suspense>
    </section>
  );
};

export default RamadanBanner;
