import { useState, useEffect, useMemo, useCallback, DragEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertTriangle, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WeekOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string | null;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  status: string | null;
  total: number;
  delivery_city: string | null;
}

interface WeeklyCalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSwitchToList: () => void;
  alertThreshold?: number;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-orange-500',
  ready: 'bg-green-500',
  out_for_delivery: 'bg-purple-500',
  delivered: 'bg-emerald-600',
  cancelled: 'bg-red-500',
};

const parseHourFromSlot = (slot: string | null): number | null => {
  if (!slot) return null;
  const match = slot.match(/(\d{1,2})/);
  if (!match) return null;
  let hour = parseInt(match[1]);
  const isPM = /pm/i.test(slot);
  const isAM = /am/i.test(slot);
  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return hour;
};

const getHeatColor = (count: number, max: number): string => {
  if (count === 0) return '';
  const intensity = Math.min(count / Math.max(max, 1), 1);
  if (intensity <= 0.25) return 'bg-primary/10';
  if (intensity <= 0.5) return 'bg-primary/25';
  if (intensity <= 0.75) return 'bg-primary/40';
  return 'bg-primary/60';
};

const formatHour = (h: number) => {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
};

const hourToTimeSlot = (hour: number): string => {
  const from = formatHour(hour);
  const to = formatHour(hour + 1 > 20 ? 20 : hour + 1);
  return `${from} – ${to}`;
};

const WeeklyCalendarView = ({ selectedDate, onSelectDate, onSwitchToList, alertThreshold = 5 }: WeeklyCalendarViewProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [weekStart, setWeekStart] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 0 }));
  const [weekOrders, setWeekOrders] = useState<WeekOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cellDetailOpen, setCellDetailOpen] = useState(false);
  const [cellOrders, setCellOrders] = useState<WeekOrder[]>([]);
  const [cellLabel, setCellLabel] = useState('');
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [draggingOrderId, setDraggingOrderId] = useState<string | null>(null);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const fetchWeekOrders = useCallback(async () => {
    setLoading(true);
    const from = format(weekDays[0], 'yyyy-MM-dd');
    const to = format(weekDays[6], 'yyyy-MM-dd');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_phone, order_type, scheduled_date, scheduled_time_slot, status, total, delivery_city')
        .gte('scheduled_date', from)
        .lte('scheduled_date', to)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setWeekOrders((data as WeekOrder[]) || []);
    } catch {
      toast.error(isRTL ? 'فشل في تحميل بيانات الأسبوع' : 'Failed to load week data');
    } finally {
      setLoading(false);
    }
  }, [weekDays, isRTL]);

  useEffect(() => { fetchWeekOrders(); }, [fetchWeekOrders]);

  const grid = useMemo(() => {
    const g: Record<string, Record<number, WeekOrder[]>> = {};
    weekDays.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      g[key] = {};
      HOURS.forEach(h => { g[key][h] = []; });
    });
    weekOrders.forEach(order => {
      if (!order.scheduled_date) return;
      const dayKey = order.scheduled_date;
      if (!g[dayKey]) return;
      const hour = parseHourFromSlot(order.scheduled_time_slot);
      if (hour !== null && g[dayKey][hour]) {
        g[dayKey][hour].push(order);
      } else {
        if (g[dayKey][8]) g[dayKey][8].push(order);
      }
    });
    return g;
  }, [weekOrders, weekDays]);

  const maxCount = useMemo(() => {
    let max = 0;
    Object.values(grid).forEach(hours => {
      Object.values(hours).forEach(orders => {
        if (orders.length > max) max = orders.length;
      });
    });
    return max;
  }, [grid]);

  const daySummaries = useMemo(() => {
    return weekDays.map(day => {
      const key = format(day, 'yyyy-MM-dd');
      const dayOrders = weekOrders.filter(o => o.scheduled_date === key);
      const total = dayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
      return { count: dayOrders.length, total };
    });
  }, [weekDays, weekOrders]);

  // Drag & Drop handlers
  const handleDragStart = (e: DragEvent, order: WeekOrder) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ orderId: order.id, orderNumber: order.order_number }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingOrderId(order.id);
  };

  const handleDragEnd = () => {
    setDraggingOrderId(null);
    setDragOverCell(null);
  };

  const handleDragOver = (e: DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell(cellKey);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = async (e: DragEvent, dayKey: string, hour: number) => {
    e.preventDefault();
    setDragOverCell(null);
    setDraggingOrderId(null);

    try {
      const raw = e.dataTransfer.getData('text/plain');
      const { orderId, orderNumber } = JSON.parse(raw);
      const newTimeSlot = hourToTimeSlot(hour);

      const { error } = await supabase
        .from('orders')
        .update({ scheduled_date: dayKey, scheduled_time_slot: newTimeSlot })
        .eq('id', orderId);

      if (error) throw error;

      // Optimistic update
      setWeekOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, scheduled_date: dayKey, scheduled_time_slot: newTimeSlot } : o
      ));

      toast.success(
        isRTL
          ? `تم نقل الطلب ${orderNumber} إلى ${dayKey} • ${formatHour(hour)}`
          : `Moved order ${orderNumber} to ${dayKey} • ${formatHour(hour)}`
      );
    } catch (err) {
      console.error('Drop failed:', err);
      toast.error(isRTL ? 'فشل في نقل الطلب' : 'Failed to move order');
      fetchWeekOrders();
    }
  };

  const handleCellClick = (dayKey: string, hour: number) => {
    const orders = grid[dayKey]?.[hour] || [];
    if (orders.length === 0) {
      const day = weekDays.find(d => format(d, 'yyyy-MM-dd') === dayKey);
      if (day) {
        onSelectDate(day);
        onSwitchToList();
      }
      return;
    }
    setCellOrders(orders);
    const hourLabel = formatHour(hour);
    setCellLabel(`${dayKey} • ${hourLabel}`);
    setCellDetailOpen(true);
  };

  const handleDayClick = (day: Date) => {
    onSelectDate(day);
    onSwitchToList();
  };

  const goToPrevWeek = () => setWeekStart(prev => addDays(prev, -7));
  const goToNextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const goToCurrentWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={goToPrevWeek} className="h-8 w-8">
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="text-xs">
            {isRTL ? 'هذا الأسبوع' : 'This Week'}
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek} className="h-8 w-8">
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {format(weekDays[0], 'dd MMM', { locale: isRTL ? ar : undefined })} – {format(weekDays[6], 'dd MMM yyyy', { locale: isRTL ? ar : undefined })}
        </span>
      </div>

      {/* Heatmap Legend + Drag hint */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span>{isRTL ? 'أقل' : 'Less'}</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-4 rounded-sm border border-border" />
          <div className="w-4 h-4 rounded-sm bg-primary/10" />
          <div className="w-4 h-4 rounded-sm bg-primary/25" />
          <div className="w-4 h-4 rounded-sm bg-primary/40" />
          <div className="w-4 h-4 rounded-sm bg-primary/60" />
        </div>
        <span>{isRTL ? 'أكثر' : 'More'}</span>
        <span className="ms-3">
          <AlertTriangle className="w-3 h-3 inline text-destructive me-1" />
          {isRTL ? `تنبيه عند ≥ ${alertThreshold} طلبات` : `Alert at ≥ ${alertThreshold} orders`}
        </span>
        <span className="ms-3">
          <GripVertical className="w-3 h-3 inline text-muted-foreground me-1" />
          {isRTL ? 'اسحب الطلب لنقله' : 'Drag orders to reschedule'}
        </span>
      </div>

      {/* Weekly Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-xs font-medium text-muted-foreground w-16 sticky start-0 bg-card z-10">
                  {isRTL ? 'الساعة' : 'Hour'}
                </th>
                {weekDays.map((day, i) => {
                  const today = isToday(day);
                  const selected = isSameDay(day, selectedDate);
                  return (
                    <th key={i} className="p-1 min-w-[90px]">
                      <button
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          "w-full rounded-lg p-2 transition-colors text-center",
                          today && "ring-2 ring-primary",
                          selected && "bg-primary/10",
                          "hover:bg-muted"
                        )}
                      >
                        <div className="text-[10px] text-muted-foreground">
                          {format(day, 'EEE', { locale: isRTL ? ar : undefined })}
                        </div>
                        <div className={cn("text-sm font-bold", today && "text-primary")}>
                          {format(day, 'd')}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {daySummaries[i].count > 0 && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              {daySummaries[i].count} {isRTL ? 'طلب' : 'orders'}
                            </Badge>
                          )}
                        </div>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="border-t border-border/50">
                  <td className="p-1.5 text-[10px] font-mono text-muted-foreground text-center sticky start-0 bg-card z-10 border-e">
                    {formatHour(hour)}
                  </td>
                  {weekDays.map((day, dayIdx) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const cellData = grid[dayKey]?.[hour] || [];
                    const count = cellData.length;
                    const isAlert = count >= alertThreshold;
                    const cellKey = `${dayKey}-${hour}`;
                    const isDropTarget = dragOverCell === cellKey;

                    return (
                      <td key={dayIdx} className="p-0.5">
                        <div
                          onDragOver={(e) => handleDragOver(e, cellKey)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, dayKey, hour)}
                          onClick={() => handleCellClick(dayKey, hour)}
                          className={cn(
                            "w-full min-h-[2.5rem] rounded-md border transition-all relative cursor-pointer",
                            "hover:border-primary/40 hover:shadow-sm",
                            count === 0 && "bg-muted/20 border-transparent",
                            count > 0 && getHeatColor(count, maxCount),
                            count > 0 && "border-transparent",
                            isAlert && "ring-1 ring-destructive/50",
                            isDropTarget && "ring-2 ring-primary border-primary bg-primary/20 scale-[1.02]",
                            draggingOrderId && "cursor-copy"
                          )}
                        >
                          {count > 0 && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[2.5rem]">
                              <span className={cn(
                                "text-xs font-bold",
                                isAlert ? "text-destructive" : "text-foreground"
                              )}>
                                {count}
                              </span>
                              {isAlert && <AlertTriangle className="w-2.5 h-2.5 text-destructive" />}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Day Summary Row */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const s = daySummaries[i];
          return (
            <Card key={i} className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              isToday(day) && "ring-1 ring-primary"
            )} onClick={() => handleDayClick(day)}>
              <CardContent className="p-2 text-center">
                <div className="text-xs text-muted-foreground">
                  {format(day, 'EEE', { locale: isRTL ? ar : undefined })}
                </div>
                <div className="text-lg font-bold">{s.count}</div>
                <div className="text-[10px] text-muted-foreground">
                  {s.total > 0 ? `${s.total.toFixed(0)} AED` : '-'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cell Detail Dialog - with draggable order cards */}
      <Dialog open={cellDetailOpen} onOpenChange={setCellDetailOpen}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              {cellLabel}
              <Badge variant="outline" className="text-[10px]">
                <GripVertical className="w-3 h-3 me-1" />
                {isRTL ? 'اسحب لنقل' : 'Drag to move'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {cellOrders.map(order => (
              <div
                key={order.id}
                draggable
                onDragStart={(e) => {
                  handleDragStart(e, order);
                  setCellDetailOpen(false);
                }}
                onDragEnd={handleDragEnd}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border cursor-grab hover:bg-muted/50 active:cursor-grabbing group"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <div>
                    <div className="font-mono text-xs font-bold text-primary">{order.order_number}</div>
                    <div className="text-sm">{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.scheduled_time_slot || '-'}</div>
                  </div>
                </div>
                <div className="text-end">
                  <Badge variant="secondary" className="text-[10px] mb-1">
                    {order.order_type === 'pickup' ? (isRTL ? 'استلام' : 'Pickup') : (isRTL ? 'توصيل' : 'Delivery')}
                  </Badge>
                  <div className="text-sm font-bold">{order.total.toFixed(0)} AED</div>
                  <div className={cn(
                    "w-2 h-2 rounded-full inline-block ms-1",
                    STATUS_COLORS[order.status || 'pending'] || 'bg-muted'
                  )} />
                </div>
              </div>
            ))}
            {cellOrders.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                {isRTL ? 'لا توجد طلبات' : 'No orders'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyCalendarView;
