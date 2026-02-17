import { useLanguage } from "@/contexts/LanguageContext";
import { useSeasonalEvents } from "@/hooks/useSeasonalEvents";

const SeasonalBanner = () => {
  const { activeEvent: event } = useSeasonalEvents();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  if (!event) return null;

  const message = isArabic ? event.message_ar : event.message_en;

  return (
    <div
      className="w-full"
      style={{
        background: `linear-gradient(to right, ${event.gradient_from}, ${event.gradient_to})`,
        padding: "16px",
        textAlign: "center",
        color: "white",
        fontWeight: 700,
        letterSpacing: "0.05em",
        zIndex: 1000,
        display: "block",
        minHeight: "44px",
      }}
    >
      <p style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{message}</p>
    </div>
  );
};

export default SeasonalBanner;
