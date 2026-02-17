import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSeasonalEvents } from "@/hooks/useSeasonalEvents";
import { Moon, Clock } from "lucide-react";

const RamadanCountdown = () => {
  const { isRTL } = useLanguage();
  const { events } = useSeasonalEvents();

  // Find Ramadan event from database
  const ramadanEvent = events.find(e => e.id === "ramadan");

  const now = new Date();
  const year = now.getFullYear();
  
  // Use countdownMonth/Day if set, otherwise fall back to startMonth/Day
  const startMonth = ramadanEvent?.countdownMonth || ramadanEvent?.startMonth || 2;
  const startDay = ramadanEvent?.countdownDay || ramadanEvent?.startDay || 19;
  
  const ramadanStart = new Date(year, startMonth - 1, startDay);
  const ramadanEnd = ramadanEvent
    ? new Date(year, ramadanEvent.endMonth - 1, ramadanEvent.endDay, 23, 59, 59)
    : new Date(year, 2, 20, 23, 59, 59);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [phase, setPhase] = useState<"before" | "during" | "after">("before");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (now < ramadanStart) {
        setPhase("before");
        const diff = ramadanStart.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      } else if (now <= ramadanEnd) {
        setPhase("during");
        const diff = ramadanEnd.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      } else {
        setPhase("after");
      }
    };
    update();
    // Update every 30s instead of every 1s to reduce main thread work
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [ramadanStart?.getTime(), ramadanEnd?.getTime()]);

  if (phase === "after") return null;
  if (ramadanEvent && !ramadanEvent.is_active) return null;

  const label = phase === "before"
    ? (isRTL ? "يبدأ رمضان بعد" : "Ramadan starts in")
    : (isRTL ? "العروض تنتهي بعد" : "Offers end in");

  const units = isRTL
    ? ["ثانية", "دقيقة", "ساعة", "يوم"]
    : ["Sec", "Min", "Hrs", "Days"];

  return (
    <section className="py-6 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30">
      <div className="container mx-auto px-4 max-w-[900px] text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Moon className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {isRTL ? "🌙 رمضان كريم" : "🌙 Ramadan Kareem"}
          </span>
          <Moon className="w-5 h-5 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm mb-3 flex items-center justify-center gap-1">
          <Clock className="w-4 h-4" /> {label}
        </p>
        <div className="flex justify-center gap-3" dir="ltr">
          {[
            { val: timeLeft.days, unit: units[3] },
            { val: timeLeft.hours, unit: units[2] },
            { val: timeLeft.minutes, unit: units[1] },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl lg:text-3xl font-bold text-foreground bg-background/80 rounded-lg px-3 py-2 min-w-[60px] border border-border/50 tabular-nums">
                {String(item.val).padStart(2, "0")}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{item.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RamadanCountdown;
