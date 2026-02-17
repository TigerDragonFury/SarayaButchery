import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Package, Users, Calendar, Crown, FileDown, Loader2, CalendarRange
} from 'lucide-react';
import { format, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

interface DailyStats {
  date: string;
  label: string;
  orders: number;
  revenue: number;
  delivered: number;
  cancelled: number;
}

interface StatusCount {
  name: string;
  nameAr: string;
  value: number;
  color: string;
}

interface TopProduct {
  name: string;
  nameEn: string;
  totalQty: number;
  totalRevenue: number;
  orderCount: number;
}

interface TopCustomer {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)',
  'hsl(217, 91%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
  'hsl(280, 67%, 55%)',
  'hsl(200, 80%, 50%)',
];

const AdminAnalyticsPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState('7');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [prevDailyStats, setPrevDailyStats] = useState<DailyStats[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusCount[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [totals, setTotals] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    deliveredCount: 0,
    cancelledCount: 0,
    topCity: '',
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useCallback(async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#1a1a1a',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const periodLabel = period === 'custom' && dateFrom
        ? `${format(dateFrom, 'yyyy-MM-dd')}_to_${format(dateTo || new Date(), 'yyyy-MM-dd')}`
        : period === '7' ? '7days' : period === '14' ? '14days' : period === '30' ? '30days' : '90days';
      pdf.save(`saraya-analytics-${periodLabel}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setExporting(false);
    }
  }, [period, dateFrom, dateTo]);

  const handleExportProductsCSV = useCallback(() => {
    const headers = isRTL
      ? ['الترتيب', 'المنتج', 'المنتج (EN)', 'عدد الطلبات', 'الكمية', 'الإيرادات (د.إ)']
      : ['Rank', 'Product', 'Product (AR)', 'Orders', 'Quantity', 'Revenue (AED)'];
    const rows = topProducts.map((p, i) => [
      String(i + 1), p.nameEn, p.name, String(p.orderCount), p.totalQty.toFixed(1), p.totalRevenue.toLocaleString(),
    ]);
    downloadCSV(`top-products-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  }, [topProducts, isRTL]);

  const handleExportCustomersCSV = useCallback(() => {
    const headers = isRTL
      ? ['الترتيب', 'اسم العميل', 'رقم الهاتف', 'عدد الطلبات', 'إجمالي الإنفاق (د.إ)', 'آخر طلب']
      : ['Rank', 'Customer', 'Phone', 'Orders', 'Total Spent (AED)', 'Last Order'];
    const rows = topCustomers.map((c, i) => [
      String(i + 1), c.name, c.phone, String(c.orderCount), c.totalSpent.toLocaleString(),
      format(new Date(c.lastOrderDate), 'yyyy-MM-dd'),
    ]);
    downloadCSV(`top-customers-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  }, [topCustomers, isRTL]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      let startDate: Date;
      let endDate: Date = endOfDay(new Date());
      let days: number;

      if (period === 'custom' && dateFrom) {
        startDate = startOfDay(dateFrom);
        endDate = dateTo ? endOfDay(dateTo) : endOfDay(new Date());
        days = differenceInDays(endDate, startDate) + 1;
      } else {
        days = parseInt(period);
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
      }

      // Calculate previous period for comparison
      const periodMs = endDate.getTime() - startDate.getTime();
      const prevEndDate = new Date(startDate.getTime() - 1);
      const prevStartDate = new Date(prevEndDate.getTime() - periodMs);

      try {
        const [ordersRes, itemsRes, prevOrdersRes] = await Promise.all([
          supabase
            .from('orders')
            .select('id, status, total, delivery_city, created_at, delivered_at, customer_name, customer_phone')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: true }),
          supabase
            .from('order_items')
            .select('product_name, product_name_en, quantity, subtotal, order_id')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString()),
          supabase
            .from('orders')
            .select('id, total, created_at')
            .gte('created_at', prevStartDate.toISOString())
            .lte('created_at', prevEndDate.toISOString())
            .order('created_at', { ascending: true }),
        ]);

        const orders = ordersRes.data;
        const items = itemsRes.data;

        if (!orders) { setLoading(false); return; }

        // Daily aggregation
        const dailyMap: Record<string, { orders: number; revenue: number; delivered: number; cancelled: number }> = {};
        for (let i = 0; i < days; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (days - 1 - i));
          const key = d.toISOString().split('T')[0];
          dailyMap[key] = { orders: 0, revenue: 0, delivered: 0, cancelled: 0 };
        }

        const statusMap: Record<string, number> = {};
        const cityMap: Record<string, number> = {};
        let totalRev = 0;

        orders.forEach(o => {
          const day = o.created_at?.split('T')[0] || '';
          if (dailyMap[day]) {
            dailyMap[day].orders++;
            dailyMap[day].revenue += o.total || 0;
            if (o.status === 'delivered') dailyMap[day].delivered++;
            if (o.status === 'cancelled') dailyMap[day].cancelled++;
          }
          statusMap[o.status || 'unknown'] = (statusMap[o.status || 'unknown'] || 0) + 1;
          if (o.delivery_city) cityMap[o.delivery_city] = (cityMap[o.delivery_city] || 0) + 1;
          totalRev += o.total || 0;
        });

        const daily = Object.entries(dailyMap).map(([date, stats]) => ({
          date,
          label: new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', { day: 'numeric', month: 'short' }).format(new Date(date)),
          ...stats,
        }));

        const STATUS_LABELS: Record<string, { en: string; ar: string; color: string }> = {
          pending: { en: 'Pending', ar: 'قيد الانتظار', color: CHART_COLORS[3] },
          confirmed: { en: 'Confirmed', ar: 'مؤكد', color: CHART_COLORS[2] },
          preparing: { en: 'Preparing', ar: 'تحضير', color: CHART_COLORS[5] },
          ready: { en: 'Ready', ar: 'جاهز', color: CHART_COLORS[6] },
          out_for_delivery: { en: 'Out for Delivery', ar: 'في التوصيل', color: CHART_COLORS[0] },
          delivered: { en: 'Delivered', ar: 'تم التوصيل', color: CHART_COLORS[1] },
          cancelled: { en: 'Cancelled', ar: 'ملغي', color: CHART_COLORS[4] },
        };

        const breakdown = Object.entries(statusMap).map(([status, count]) => ({
          name: STATUS_LABELS[status]?.en || status,
          nameAr: STATUS_LABELS[status]?.ar || status,
          value: count,
          color: STATUS_LABELS[status]?.color || '#888',
        }));

        const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
        const delivered = statusMap['delivered'] || 0;
        const cancelled = statusMap['cancelled'] || 0;

        // Top products aggregation
        const productMap: Record<string, TopProduct> = {};
        if (items) {
          items.forEach((item: any) => {
            const key = item.product_name;
            if (!productMap[key]) {
              productMap[key] = {
                name: item.product_name,
                nameEn: item.product_name_en || item.product_name,
                totalQty: 0,
                totalRevenue: 0,
                orderCount: 0,
              };
            }
            productMap[key].totalQty += Number(item.quantity) || 0;
            productMap[key].totalRevenue += Number(item.subtotal) || 0;
            productMap[key].orderCount++;
          });
        }
        const sortedProducts = Object.values(productMap)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 10);

        // Top customers aggregation
        const customerMap: Record<string, TopCustomer> = {};
        orders.forEach(o => {
          const key = o.customer_phone;
          if (!customerMap[key]) {
            customerMap[key] = {
              name: o.customer_name,
              phone: o.customer_phone,
              orderCount: 0,
              totalSpent: 0,
              lastOrderDate: o.created_at || '',
            };
          }
          customerMap[key].orderCount++;
          customerMap[key].totalSpent += o.total || 0;
          if ((o.created_at || '') > customerMap[key].lastOrderDate) {
            customerMap[key].lastOrderDate = o.created_at || '';
          }
        });
        const sortedCustomers = Object.values(customerMap)
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10);

        // Previous period daily aggregation
        const prevDailyMap: Record<string, { revenue: number }> = {};
        const prevDays = Math.round(periodMs / (1000 * 60 * 60 * 24)) + 1;
        for (let i = 0; i < prevDays; i++) {
          const d = new Date(prevStartDate);
          d.setDate(d.getDate() + i);
          const key = d.toISOString().split('T')[0];
          prevDailyMap[key] = { revenue: 0 };
        }
        if (prevOrdersRes.data) {
          prevOrdersRes.data.forEach(o => {
            const day = o.created_at?.split('T')[0] || '';
            if (prevDailyMap[day]) {
              prevDailyMap[day].revenue += o.total || 0;
            }
          });
        }
        const prevDaily = Object.entries(prevDailyMap).map(([date, stats], idx) => ({
          date,
          label: `${isRTL ? 'يوم' : 'Day'} ${idx + 1}`,
          orders: 0,
          revenue: stats.revenue,
          delivered: 0,
          cancelled: 0,
        }));

        setDailyStats(daily);
        setPrevDailyStats(prevDaily);
        setStatusBreakdown(breakdown);
        setTopProducts(sortedProducts);
        setTopCustomers(sortedCustomers);
        setTotals({
          totalOrders: orders.length,
          totalRevenue: totalRev,
          avgOrderValue: orders.length > 0 ? Math.round(totalRev / orders.length) : 0,
          deliveredCount: delivered,
          cancelledCount: cancelled,
          topCity,
        });
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, isRTL, dateFrom, dateTo]);

  const StatCard = ({ icon: Icon, value, label, trend, color }: {
    icon: any; value: string | number; label: string; trend?: 'up' | 'down'; color: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            trend === 'up' 
              ? <TrendingUp className="w-4 h-4 text-green-500" />
              : <TrendingDown className="w-4 h-4 text-red-500" />
          )}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout title="Analytics" titleAr="التحليلات">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" titleAr="التحليلات">
      <div ref={reportRef} className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {isRTL ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" disabled={exporting}>
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                  {isRTL ? 'تصدير' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  📄 {isRTL ? 'تقرير كامل (PDF)' : 'Full Report (PDF)'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportProductsCSV} disabled={topProducts.length === 0}>
                  📊 {isRTL ? 'المنتجات الأكثر مبيعاً (CSV)' : 'Top Products (CSV)'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCustomersCSV} disabled={topCustomers.length === 0}>
                  👥 {isRTL ? 'العملاء الأكثر ولاءً (CSV)' : 'Top Customers (CSV)'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Select value={period} onValueChange={(v) => { setPeriod(v); if (v !== 'custom') { setDateFrom(undefined); setDateTo(undefined); } }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{isRTL ? 'آخر 7 أيام' : 'Last 7 days'}</SelectItem>
                <SelectItem value="14">{isRTL ? 'آخر 14 يوم' : 'Last 14 days'}</SelectItem>
                <SelectItem value="30">{isRTL ? 'آخر 30 يوم' : 'Last 30 days'}</SelectItem>
                <SelectItem value="90">{isRTL ? 'آخر 90 يوم' : 'Last 90 days'}</SelectItem>
                <SelectItem value="custom">{isRTL ? 'فترة مخصصة' : 'Custom Range'}</SelectItem>
              </SelectContent>
            </Select>
            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("gap-2 w-[140px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                      <CalendarRange className="w-4 h-4" />
                      {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : (isRTL ? 'من' : 'From')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      locale={isRTL ? ar : undefined}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("gap-2 w-[140px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                      <CalendarRange className="w-4 h-4" />
                      {dateTo ? format(dateTo, 'dd/MM/yyyy') : (isRTL ? 'إلى' : 'To')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      disabled={(date) => date > new Date() || (dateFrom ? date < dateFrom : false)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      locale={isRTL ? ar : undefined}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={ShoppingCart}
            value={totals.totalOrders}
            label={isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={DollarSign}
            value={`${totals.totalRevenue.toLocaleString()} ${isRTL ? 'د.إ' : 'AED'}`}
            label={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
          />
          <StatCard
            icon={TrendingUp}
            value={`${totals.avgOrderValue} ${isRTL ? 'د.إ' : 'AED'}`}
            label={isRTL ? 'متوسط قيمة الطلب' : 'Avg Order Value'}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          />
          <StatCard
            icon={Package}
            value={totals.deliveredCount}
            label={isRTL ? 'طلبات مكتملة' : 'Delivered'}
            trend="up"
            color="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
          />
          <StatCard
            icon={Users}
            value={totals.topCity || '-'}
            label={isRTL ? 'أكثر مدينة طلباً' : 'Top City'}
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
          />
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isRTL ? 'الإيرادات اليومية' : 'Daily Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} ${isRTL ? 'د.إ' : 'AED'}`, isRTL ? 'الإيرادات' : 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Comparison Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {isRTL ? 'مقارنة الإيرادات مع الفترة السابقة' : 'Revenue Comparison vs Previous Period'}
              </CardTitle>
              <Button
                variant={showComparison ? "default" : "outline"}
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="gap-2"
              >
                <CalendarRange className="w-4 h-4" />
                {showComparison
                  ? (isRTL ? 'إخفاء المقارنة' : 'Hide Comparison')
                  : (isRTL ? 'عرض المقارنة' : 'Show Comparison')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyStats.map((d, i) => ({
                    label: d.label,
                    current: d.revenue,
                    previous: prevDailyStats[i]?.revenue ?? 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString()} ${isRTL ? 'د.إ' : 'AED'}`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="current"
                    name={isRTL ? 'الفترة الحالية' : 'Current Period'}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {showComparison && (
                    <Line
                      type="monotone"
                      dataKey="previous"
                      name={isRTL ? 'الفترة السابقة' : 'Previous Period'}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders & Delivery Chart */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isRTL ? 'الطلبات اليومية' : 'Daily Orders'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="orders" name={isRTL ? 'الطلبات' : 'Orders'} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="delivered" name={isRTL ? 'مكتمل' : 'Delivered'} stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="cancelled" name={isRTL ? 'ملغي' : 'Cancelled'} stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isRTL ? 'توزيع حالات الطلبات' : 'Order Status Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey={isRTL ? 'nameAr' : 'name'}
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value: number, name: string) => [value, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              {isRTL ? 'توزيع الإيرادات حسب المنتجات' : 'Revenue Distribution by Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {isRTL ? 'لا توجد بيانات' : 'No data'}
              </p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts.slice(0, 7).map((p, i) => ({
                        name: isRTL ? p.name : p.nameEn,
                        value: p.totalRevenue,
                        color: CHART_COLORS[i % CHART_COLORS.length],
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={false}
                    >
                      {topProducts.slice(0, 7).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} ${isRTL ? 'د.إ' : 'AED'}`, isRTL ? 'الإيرادات' : 'Revenue']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products - Chart & Table */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Horizontal Bar Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                {isRTL ? 'أفضل 5 منتجات' : 'Top 5 Products'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {isRTL ? 'لا توجد بيانات' : 'No data'}
                </p>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts.slice(0, 5).reverse()}
                      layout="vertical"
                      margin={{ top: 5, right: 10, left: 140, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis
                        dataKey={isRTL ? 'name' : 'nameEn'}
                        type="category"
                        tick={{ fontSize: 10 }}
                        width={140}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()} ${isRTL ? 'د.إ' : 'AED'}`, isRTL ? 'الإيرادات' : 'Revenue']}
                      />
                      <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full Products Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                {isRTL ? 'تفاصيل المنتجات' : 'Product Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {isRTL ? 'لا توجد بيانات منتجات' : 'No product data available'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>{isRTL ? 'المنتج' : 'Product'}</TableHead>
                        <TableHead className="text-center">{isRTL ? 'عدد الطلبات' : 'Orders'}</TableHead>
                        <TableHead className="text-center">{isRTL ? 'الكمية' : 'Qty'}</TableHead>
                        <TableHead className="text-end">{isRTL ? 'الإيرادات' : 'Revenue'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product, idx) => (
                        <TableRow key={product.name}>
                          <TableCell>
                            {idx < 3 ? (
                              <Badge variant="outline" className={
                                idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300' :
                                idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-300' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300'
                              }>
                                {idx + 1}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">{idx + 1}</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <span>{isRTL ? product.name : product.nameEn}</span>
                            {product.nameEn !== product.name && (
                              <span className="block text-xs text-muted-foreground">
                                {isRTL ? product.nameEn : product.name}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{product.orderCount}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm">
                            {product.totalQty.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-end font-bold text-primary">
                            {product.totalRevenue.toLocaleString()} {isRTL ? 'د.إ' : 'AED'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Loyal Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {isRTL ? 'العملاء الأكثر ولاءً' : 'Most Loyal Customers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {isRTL ? 'لا توجد بيانات عملاء' : 'No customer data available'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>{isRTL ? 'اسم العميل' : 'Customer'}</TableHead>
                      <TableHead>{isRTL ? 'رقم الهاتف' : 'Phone'}</TableHead>
                      <TableHead className="text-center">{isRTL ? 'عدد الطلبات' : 'Orders'}</TableHead>
                      <TableHead className="text-end">{isRTL ? 'إجمالي الإنفاق' : 'Total Spent'}</TableHead>
                      <TableHead className="text-center">{isRTL ? 'آخر طلب' : 'Last Order'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer, idx) => (
                      <TableRow key={customer.phone}>
                        <TableCell>
                          {idx < 3 ? (
                            <Badge variant="outline" className={
                              idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300' :
                              idx === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-300' :
                              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300'
                            }>
                              {idx + 1}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">{idx + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground" dir="ltr">{customer.phone}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{customer.orderCount}</Badge>
                        </TableCell>
                        <TableCell className="text-end font-bold text-primary">
                          {customer.totalSpent.toLocaleString()} {isRTL ? 'د.إ' : 'AED'}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', { day: 'numeric', month: 'short' }).format(new Date(customer.lastOrderDate))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
