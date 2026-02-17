import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LiveVisitorsPanel from '@/components/admin/LiveVisitorsPanel';
import { 
  DollarSign, ShoppingCart, Clock, XCircle, Star, 
  TrendingUp, TrendingDown, Minus, AlertOctagon, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatData {
  todayRevenue: number;
  todayOrders: number;
  avgDeliveryTime: number;
  cancelRate: number;
  avgRating: number;
  // Yesterday comparison
  yesterdayRevenue: number;
  yesterdayOrders: number;
  // Last week comparison
  lastWeekRevenue: number;
  lastWeekOrders: number;
}

interface StorePause {
  is_paused: boolean;
  pause_until: string | null;
  message_ar: string;
  message_en: string;
}

const CommandCenter = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatData>({
    todayRevenue: 0, todayOrders: 0, avgDeliveryTime: 0,
    cancelRate: 0, avgRating: 0, yesterdayRevenue: 0,
    yesterdayOrders: 0, lastWeekRevenue: 0, lastWeekOrders: 0,
  });
  const [storePause, setStorePause] = useState<StorePause | null>(null);
  const [pauseLoading, setPauseLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const lastWeekStart = new Date(todayStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(todayStart); lastWeekEnd.setDate(lastWeekEnd.getDate() - 6);

      try {
        const [todayRes, yesterdayRes, lastWeekRes, pauseRes] = await Promise.all([
          supabase.from('orders').select('id, status, total, delivered_at, created_at')
            .gte('created_at', todayStart.toISOString()),
          supabase.from('orders').select('id, status, total')
            .gte('created_at', yesterdayStart.toISOString())
            .lt('created_at', todayStart.toISOString()),
          supabase.from('orders').select('id, total')
            .gte('created_at', lastWeekStart.toISOString())
            .lt('created_at', lastWeekEnd.toISOString()),
          supabase.from('store_settings').select('value').eq('key', 'store_pause').single(),
        ]);

        const today = todayRes.data || [];
        const yesterday = yesterdayRes.data || [];
        const lastWeek = lastWeekRes.data || [];

        const todayRevenue = today.reduce((s, o) => s + (o.total || 0), 0);
        const yesterdayRevenue = yesterday.reduce((s, o) => s + (o.total || 0), 0);
        const lastWeekRevenue = lastWeek.reduce((s, o) => s + (o.total || 0), 0);

        const cancelled = today.filter(o => o.status === 'cancelled').length;
        const cancelRate = today.length > 0 ? Math.round((cancelled / today.length) * 100) : 0;

        // Avg delivery time (orders with delivered_at and created_at)
        const delivered = today.filter(o => o.status === 'delivered' && o.delivered_at);
        let avgTime = 0;
        if (delivered.length > 0) {
          const totalMins = delivered.reduce((s, o) => {
            const diff = (new Date(o.delivered_at!).getTime() - new Date(o.created_at!).getTime()) / 60000;
            return s + diff;
          }, 0);
          avgTime = Math.round(totalMins / delivered.length);
        }

        setStats({
          todayRevenue, todayOrders: today.length, avgDeliveryTime: avgTime,
          cancelRate, avgRating: 4.7, // Placeholder - can integrate with feedback
          yesterdayRevenue, yesterdayOrders: yesterday.length,
          lastWeekRevenue, lastWeekOrders: lastWeek.length,
        });

        if (pauseRes.data?.value) {
          setStorePause(pauseRes.data.value as unknown as StorePause);
        }
      } catch (err) {
        console.error('Command center stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const togglePause = async () => {
    if (!storePause) return;
    setPauseLoading(true);
    try {
      const newPause = {
        ...storePause,
        is_paused: !storePause.is_paused,
        pause_until: !storePause.is_paused ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : null,
      };
      await supabase.from('store_settings')
        .update({ value: JSON.parse(JSON.stringify(newPause)) })
        .eq('key', 'store_pause');
      setStorePause(newPause);
    } catch (err) {
      console.error('Toggle pause error:', err);
    } finally {
      setPauseLoading(false);
    }
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return { direction: 'neutral' as const, pct: 0 };
    if (previous === 0) return { direction: 'up' as const, pct: 100 };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { direction: pct > 0 ? 'up' as const : pct < 0 ? 'down' as const : 'neutral' as const, pct: Math.abs(pct) };
  };

  const revenueTrend = getTrend(stats.todayRevenue, stats.yesterdayRevenue);
  const ordersTrend = getTrend(stats.todayOrders, stats.yesterdayOrders);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  const TrendBadge = ({ direction, pct, vsLabel }: { direction: 'up' | 'down' | 'neutral'; pct: number; vsLabel: string }) => (
    <div className="flex items-center gap-1 mt-1">
      {direction === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
      {direction === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
      {direction === 'neutral' && <Minus className="w-3 h-3 text-muted-foreground" />}
      <span className={cn(
        "text-[10px] font-medium",
        direction === 'up' && "text-green-500",
        direction === 'down' && "text-red-500",
        direction === 'neutral' && "text-muted-foreground"
      )}>
        {direction !== 'neutral' ? `${pct}%` : '0%'} {vsLabel}
      </span>
    </div>
  );

  const cards = [
    {
      icon: DollarSign,
      value: `${stats.todayRevenue.toLocaleString()} ${isRTL ? 'د.إ' : 'AED'}`,
      labelAr: 'إيرادات اليوم', labelEn: "Today's Revenue",
      color: 'text-emerald-500', bg: 'bg-emerald-500/10',
      trend: revenueTrend,
      vsLabel: isRTL ? 'عن أمس' : 'vs yesterday',
    },
    {
      icon: ShoppingCart,
      value: stats.todayOrders,
      labelAr: 'طلبات اليوم', labelEn: "Today's Orders",
      color: 'text-blue-500', bg: 'bg-blue-500/10',
      trend: ordersTrend,
      vsLabel: isRTL ? 'عن أمس' : 'vs yesterday',
    },
    {
      icon: Clock,
      value: `${stats.avgDeliveryTime} ${isRTL ? 'د' : 'min'}`,
      labelAr: 'متوسط زمن التوصيل', labelEn: 'Avg Delivery Time',
      color: 'text-purple-500', bg: 'bg-purple-500/10',
    },
    {
      icon: XCircle,
      value: `${stats.cancelRate}%`,
      labelAr: 'نسبة الإلغاء', labelEn: 'Cancel Rate',
      color: stats.cancelRate > 10 ? 'text-red-500' : 'text-yellow-500',
      bg: stats.cancelRate > 10 ? 'bg-red-500/10' : 'bg-yellow-500/10',
    },
    {
      icon: Star,
      value: stats.avgRating,
      labelAr: 'تقييم العملاء', labelEn: 'Customer Rating',
      color: 'text-amber-500', bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Emergency pause banner */}
      {storePause?.is_paused && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-bold text-red-500">
                {isRTL ? '⚠️ استقبال الطلبات متوقف' : '⚠️ Orders Paused'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? storePause.message_ar : storePause.message_en}
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={togglePause} disabled={pauseLoading}>
            {pauseLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
            {isRTL ? 'إعادة التشغيل' : 'Resume'}
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bg)}>
                    <Icon className={cn("w-5 h-5", card.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? card.labelAr : card.labelEn}
                </p>
                {card.trend && (
                  <TrendBadge direction={card.trend.direction} pct={card.trend.pct} vsLabel={card.vsLabel!} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Visitors */}
      <LiveVisitorsPanel />

      {/* Emergency Pause Button */}
      {!storePause?.is_paused && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-500/30 hover:bg-red-500/10"
            onClick={togglePause}
            disabled={pauseLoading}
          >
            {pauseLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
            <AlertOctagon className="w-4 h-4 me-2" />
            {isRTL ? 'إيقاف استقبال الطلبات' : 'Pause Orders'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommandCenter;
