import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SeasonalEventData {
  id: string;
  name_ar: string;
  name_en: string;
  message_ar: string;
  message_en: string;
  emoji: string[];
  gradient_from: string;
  gradient_to: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  is_active: boolean;
  /** Optional: actual event start for countdown (e.g. 1st Ramadan fasting day) */
  countdownMonth?: number;
  countdownDay?: number;
}

function getActiveEvent(events: SeasonalEventData[]): SeasonalEventData | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const event of events) {
    if (!event.is_active) continue;
    
    if (event.startMonth > event.endMonth) {
      // Year-wrapping (e.g., Dec 28 - Jan 3)
      if (
        (month > event.startMonth || (month === event.startMonth && day >= event.startDay)) ||
        (month < event.endMonth || (month === event.endMonth && day <= event.endDay))
      ) {
        return event;
      }
    } else {
      const afterStart = month > event.startMonth || (month === event.startMonth && day >= event.startDay);
      const beforeEnd = month < event.endMonth || (month === event.endMonth && day <= event.endDay);
      if (afterStart && beforeEnd) return event;
    }
  }
  return null;
}

export function useSeasonalEvents() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['seasonal-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'seasonal_events')
        .single();
      if (error) return [];
      return (data?.value as unknown as SeasonalEventData[]) || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const activeEvent = getActiveEvent(events);

  return { events, activeEvent, isLoading };
}
