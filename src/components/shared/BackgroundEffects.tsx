import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BackgroundEffectsConfig {
  stars_enabled: boolean;
  particles_enabled: boolean;
  embers_enabled: boolean;
  stars_count: number;
  particles_count: number;
  embers_count: number;
  stars_color: string;
  particles_color: string;
  embers_color: string;
}

export const DEFAULT_EFFECTS: BackgroundEffectsConfig = {
  stars_enabled: false,
  particles_enabled: false,
  embers_enabled: false,
  stars_count: 60,
  particles_count: 30,
  embers_count: 20,
  stars_color: '41 30% 90%',
  particles_color: '7 100% 27%',
  embers_color: '25 85% 40%',
};

const BackgroundEffects = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const { data: config } = useQuery({
    queryKey: ['background-effects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'background_effects')
        .maybeSingle();
      if (data?.value) return { ...DEFAULT_EFFECTS, ...(data.value as Partial<BackgroundEffectsConfig>) };
      return DEFAULT_EFFECTS;
    },
    staleTime: 1000 * 60 * 5,
  });

  const effects = config || DEFAULT_EFFECTS;
  const anyEnabled = effects.stars_enabled || effects.particles_enabled || effects.embers_enabled;

  useEffect(() => {
    if (!anyEnabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const hslToRgba = (hsl: string, alpha: number) => {
      const parts = hsl.split(' ').map(s => parseFloat(s));
      if (parts.length < 3) return `rgba(200,200,200,${alpha})`;
      const h = parts[0], s = parts[1] / 100, l = parts[2] / 100;
      const a2 = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        return l - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      };
      return `rgba(${Math.round(f(0)*255)},${Math.round(f(8)*255)},${Math.round(f(4)*255)},${alpha})`;
    };

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; type: 'star' | 'particle' | 'ember'; twinkle?: number };
    const items: Particle[] = [];

    if (effects.stars_enabled) {
      for (let i = 0; i < effects.stars_count; i++) {
        items.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: 0, vy: 0, size: Math.random() * 2 + 0.5, alpha: Math.random(),
          type: 'star', twinkle: Math.random() * Math.PI * 2,
        });
      }
    }
    if (effects.particles_enabled) {
      for (let i = 0; i < effects.particles_count; i++) {
        items.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 3 + 1, alpha: Math.random() * 0.4 + 0.1, type: 'particle',
        });
      }
    }
    if (effects.embers_enabled) {
      for (let i = 0; i < effects.embers_count; i++) {
        items.push({
          x: Math.random() * canvas.width, y: canvas.height + Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.5, vy: -(Math.random() * 1 + 0.5),
          size: Math.random() * 3 + 1, alpha: Math.random() * 0.6 + 0.2, type: 'ember',
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      items.forEach(p => {
        if (p.type === 'star') {
          p.twinkle! += 0.02;
          const a = (Math.sin(p.twinkle!) + 1) / 2 * 0.8 + 0.2;
          ctx.fillStyle = hslToRgba(effects.stars_color, a * p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'particle') {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          ctx.fillStyle = hslToRgba(effects.particles_color, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ember') {
          p.x += p.vx + Math.sin(p.y * 0.01) * 0.3;
          p.y += p.vy;
          p.alpha -= 0.001;
          if (p.y < -10 || p.alpha <= 0) {
            p.x = Math.random() * canvas.width;
            p.y = canvas.height + 10;
            p.alpha = Math.random() * 0.6 + 0.2;
          }
          ctx.fillStyle = hslToRgba(effects.embers_color, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [anyEnabled, effects]);

  if (!anyEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
};

export default BackgroundEffects;
