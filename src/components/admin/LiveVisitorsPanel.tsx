import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Smartphone, Monitor, Globe, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitorSession {
  id: string;
  session_id: string;
  current_page: string;
  page_title: string | null;
  last_seen: string;
  created_at: string;
  is_mobile: boolean | null;
  referrer: string | null;
}

const PAGE_LABELS: Record<string, { ar: string; en: string }> = {
  '/': { ar: 'الرئيسية', en: 'Home' },
  '/products': { ar: 'المنتجات', en: 'Products' },
  '/shop': { ar: 'المتجر', en: 'Shop' },
  '/menu': { ar: 'القائمة', en: 'Menu' },
  '/cart': { ar: 'السلة', en: 'Cart' },
  '/checkout': { ar: 'الدفع', en: 'Checkout' },
  '/track': { ar: 'تتبع الطلب', en: 'Track Order' },
  '/about': { ar: 'عن السرايا', en: 'About' },
  '/contact': { ar: 'التواصل', en: 'Contact' },
  '/catering': { ar: 'التموين', en: 'Catering' },
  '/restaurant': { ar: 'المطعم', en: 'Restaurant' },
  '/offers': { ar: 'العروض', en: 'Offers' },
  '/boxes': { ar: 'الصناديق', en: 'Boxes' },
};

const ACTIVE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

function getPageLabel(path: string, isRTL: boolean): string {
  const exact = PAGE_LABELS[path];
  if (exact) return isRTL ? exact.ar : exact.en;
  // Partial match
  for (const [key, val] of Object.entries(PAGE_LABELS)) {
    if (path.startsWith(key) && key !== '/') return isRTL ? val.ar : val.en;
  }
  return path;
}

function getSecondsAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
}

function formatSecondsAgo(seconds: number, isRTL: boolean): string {
  if (seconds < 60) return isRTL ? `منذ ${seconds} ث` : `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  return isRTL ? `منذ ${mins} د` : `${mins}m ago`;
}

const LiveVisitorsPanel = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [visitors, setVisitors] = useState<VisitorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchVisitors = useCallback(async () => {
    const threshold = new Date(Date.now() - ACTIVE_THRESHOLD_MS).toISOString();
    const { data } = await supabase
      .from('visitor_sessions' as any)
      .select('*')
      .gte('last_seen', threshold)
      .order('last_seen', { ascending: false });

    if (data) {
      setVisitors(data as unknown as VisitorSession[]);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVisitors();

    // Real-time subscription
    const channel = supabase
      .channel('live_visitors_admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visitor_sessions' },
        () => fetchVisitors()
      )
      .subscribe();

    // Also refresh every 30s as fallback
    const interval = setInterval(fetchVisitors, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchVisitors]);

  // Group by page
  const pageGroups = visitors.reduce<Record<string, number>>((acc, v) => {
    const page = v.current_page;
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {});

  const mobileCount = visitors.filter(v => v.is_mobile).length;
  const desktopCount = visitors.length - mobileCount;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="relative">
            <Eye className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-chart-2 rounded-full animate-pulse" />
          </div>
          <span>{isRTL ? 'الزوار الآن' : 'Live Visitors'}</span>
          {!loading && (
            <Badge variant="outline" className="border-chart-2/50 text-chart-2 ms-auto">
              <span className="w-2 h-2 bg-chart-2 rounded-full inline-block me-1.5 animate-pulse" />
              {visitors.length} {isRTL ? 'زائر' : 'online'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin me-2" />
            <span className="text-sm">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
            {isRTL ? 'لا يوجد زوار نشطون حالياً' : 'No active visitors right now'}
          </div>
        ) : (
          <>
            {/* Device breakdown */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Monitor className="w-4 h-4" />
                <span>{desktopCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                <span>{mobileCount}</span>
              </div>
            </div>

            {/* Page breakdown */}
            {Object.keys(pageGroups).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {isRTL ? 'توزيع الصفحات' : 'Pages'}
                </p>
                {Object.entries(pageGroups)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 bg-chart-2 rounded-full flex-shrink-0" />
                        <span className="text-sm truncate">{getPageLabel(page, isRTL)}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline truncate" dir="ltr">{page}</span>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{count}</Badge>
                    </div>
                  ))}
              </div>
            )}

            {/* Individual visitors */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {isRTL ? 'الجلسات النشطة' : 'Active Sessions'}
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {visitors.map((visitor) => {
                  const secsAgo = getSecondsAgo(visitor.last_seen);
                  const isVeryRecent = secsAgo < 60;
                  return (
                    <div
                      key={visitor.session_id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-sm",
                        isVeryRecent ? "bg-chart-2/10" : "bg-muted/50"
                      )}
                    >
                      {visitor.is_mobile
                        ? <Smartphone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        : <Monitor className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      }
                      <span className="flex-1 truncate">{getPageLabel(visitor.current_page, isRTL)}</span>
                      <span className={cn(
                        "text-xs flex-shrink-0",
                        isVeryRecent ? "text-chart-2" : "text-muted-foreground"
                      )}>
                        {formatSecondsAgo(secsAgo, isRTL)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Last updated */}
        <p className="text-xs text-muted-foreground text-end">
          {isRTL ? 'آخر تحديث: ' : 'Updated: '}
          {lastUpdated.toLocaleTimeString(isRTL ? 'ar-AE' : 'en-AE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </CardContent>
    </Card>
  );
};

export default LiveVisitorsPanel;
