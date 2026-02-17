import { useMemo } from "react";
import { useSeasonalEvents } from "@/hooks/useSeasonalEvents";

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const SeasonalOverlay = () => {
  const { activeEvent: event } = useSeasonalEvents();

  const particles = useMemo(() => {
    if (!event) return [];
    const items: Particle[] = [];
    // Reduce particle count from 18 to 8 for performance
    for (let i = 0; i < 8; i++) {
      items.push({
        id: i,
        emoji: event.emoji[i % event.emoji.length],
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 8 + Math.random() * 10,
        size: 14 + Math.random() * 16,
        opacity: 0.15 + Math.random() * 0.25,
      });
    }
    return items;
  }, [event?.id]);

  if (!event || particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-seasonal-float select-none"
          style={{
            left: `${p.left}%`,
            top: "-40px",
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
};

export default SeasonalOverlay;
