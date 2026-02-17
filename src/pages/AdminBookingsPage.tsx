import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, parseISO, startOfWeek } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  CalendarDays, Search, Download, Printer, Filter, 
  Clock, Package, Truck, CheckCircle, XCircle, ChefHat,
  Eye, RotateCcw, Sun, Sunset, Moon, ShoppingBag, List, CalendarRange,
  AlertTriangle, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import WeeklyCalendarView from '@/components/admin/WeeklyCalendarView';

type OrderStatus = Database['public']['Enums']['order_status'];

interface BookingOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string | null;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  status: OrderStatus | null;
  total: number;
  subtotal: number;
  delivery_fee: number | null;
  delivery_address: string;
  delivery_city: string | null;
  delivery_notes: string | null;
  driver_id: string | null;
  created_at: string | null;
  items: any;
  source: string | null;
  branch_name: string | null;
}

interface DriverInfo {
  id: string;
  name: string;
}

const STATUS_CONFIG: Record<string, { label: string; labelEn: string; color: string; icon: any }> = {
  pending: { label: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30', icon: Clock },
  confirmed: { label: 'مؤكد', labelEn: 'Confirmed', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30', icon: CheckCircle },
  preparing: { label: 'قيد التحضير', labelEn: 'Preparing', color: 'bg-orange-500/15 text-orange-600 border-orange-500/30', icon: ChefHat },
  ready: { label: 'جاهز', labelEn: 'Ready', color: 'bg-green-500/15 text-green-600 border-green-500/30', icon: Package },
  out_for_delivery: { label: 'في الطريق', labelEn: 'On the way', color: 'bg-purple-500/15 text-purple-600 border-purple-500/30', icon: Truck },
  delivered: { label: 'تم التوصيل', labelEn: 'Delivered', color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30', icon: CheckCircle },
  cancelled: { label: 'ملغي', labelEn: 'Cancelled', color: 'bg-red-500/15 text-red-600 border-red-500/30', icon: XCircle },
};

const parseTimeSlot = (slot: string | null): { from: string | null; to: string | null } => {
  if (!slot) return { from: null, to: null };
  const parts = slot.split('–').map(s => s.trim());
  if (parts.length === 1) {
    const p2 = slot.split('-').map(s => s.trim());
    return { from: p2[0] || null, to: p2[1] || null };
  }
  return { from: parts[0] || null, to: parts[1] || null };
};

const getTimeBlock = (timeSlot: string | null): 'morning' | 'afternoon' | 'evening' | 'unscheduled' => {
  if (!timeSlot) return 'unscheduled';
  const { from } = parseTimeSlot(timeSlot);
  if (!from) return 'unscheduled';
  const hourMatch = from.match(/(\d{1,2})/);
  if (!hourMatch) return 'unscheduled';
  let hour = parseInt(hourMatch[1]);
  const isPM = /pm/i.test(from);
  const isAM = /am/i.test(from);
  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const TIME_BLOCKS = {
  morning: { labelAr: 'صباحاً (قبل 12)', labelEn: 'Morning (Before 12)', icon: Sun },
  afternoon: { labelAr: 'ظهراً (12–5)', labelEn: 'Afternoon (12–5)', icon: Sunset },
  evening: { labelAr: 'مساءً (بعد 5)', labelEn: 'Evening (After 5)', icon: Moon },
  unscheduled: { labelAr: 'بدون وقت محدد', labelEn: 'No Time Set', icon: Clock },
};

const AdminBookingsPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [orders, setOrders] = useState<BookingOrder[]>([]);
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'weekly'>('list');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('scheduled_date', dateStr)
        .order('scheduled_time_slot', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders((data as BookingOrder[]) || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error(isRTL ? 'فشل في تحميل الحجوزات' : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [dateStr, isRTL]);

  const fetchDrivers = useCallback(async () => {
    const { data } = await supabase.from('drivers').select('id, name');
    if (data) setDrivers(data);
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [fetchOrders, fetchDrivers]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const record = payload.new as BookingOrder;
          if (record?.scheduled_date === dateStr) {
            fetchOrders();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dateStr, fetchOrders]);

  // Fallback polling
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (deliveryTypeFilter !== 'all' && order.order_type !== deliveryTypeFilter) return false;
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (driverFilter !== 'all') {
        if (driverFilter === 'unassigned' && order.driver_id) return false;
        if (driverFilter !== 'unassigned' && order.driver_id !== driverFilter) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          order.order_number.toLowerCase().includes(q) ||
          order.customer_name.toLowerCase().includes(q) ||
          order.customer_phone.includes(q)
        );
      }
      return true;
    });
  }, [orders, deliveryTypeFilter, statusFilter, driverFilter, searchQuery]);

  // Summary
  const summary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    const statusCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const s = o.status || 'pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    return { totalOrders, totalRevenue, statusCounts };
  }, [filteredOrders]);

  // Group by time block
  const groupedOrders = useMemo(() => {
    const groups: Record<string, BookingOrder[]> = {
      morning: [], afternoon: [], evening: [], unscheduled: []
    };
    filteredOrders.forEach(order => {
      const block = getTimeBlock(order.scheduled_time_slot);
      groups[block].push(order);
    });
    return groups;
  }, [filteredOrders]);

  // Hourly pressure detection
  // Fetch alert threshold from settings
  const { data: alertThresholdData } = useQuery({
    queryKey: ['bookings-alert-threshold'],
    queryFn: async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'bookings_config')
        .single();
      return (data?.value as any)?.alertThreshold || 5;
    },
    staleTime: 1000 * 60 * 5,
  });
  const PRESSURE_THRESHOLD = alertThresholdData || 5;

  const hourlyPressure = useMemo(() => {
    const hourCounts: Record<number, { count: number; orders: BookingOrder[] }> = {};
    orders.forEach(order => {
      const { from } = parseTimeSlot(order.scheduled_time_slot);
      if (!from) return;
      const hourMatch = from.match(/(\d{1,2})/);
      if (!hourMatch) return;
      let hour = parseInt(hourMatch[1]);
      const isPM = /pm/i.test(from);
      const isAM = /am/i.test(from);
      if (isPM && hour !== 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
      if (!hourCounts[hour]) hourCounts[hour] = { count: 0, orders: [] };
      hourCounts[hour].count++;
      hourCounts[hour].orders.push(order);
    });
    return Object.entries(hourCounts)
      .filter(([_, data]) => data.count >= PRESSURE_THRESHOLD)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        count: data.count,
        label: parseInt(hour) > 12 ? `${parseInt(hour) - 12} PM` : parseInt(hour) === 12 ? '12 PM' : parseInt(hour) === 0 ? '12 AM' : `${parseInt(hour)} AM`,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [orders, PRESSURE_THRESHOLD]);

  // Toast alert + push notification for pressure hours (once per date change)
  const [lastAlertDate, setLastAlertDate] = useState('');
  const [lastPushDate, setLastPushDate] = useState('');
  useEffect(() => {
    if (hourlyPressure.length > 0 && dateStr !== lastAlertDate && !loading) {
      setLastAlertDate(dateStr);
      const hoursText = hourlyPressure.map(h => `${h.label} (${h.count})`).join('، ');
      toast.warning(
        isRTL 
          ? `⚠️ ضغط عالي: ${hourlyPressure.length} ساعات تتجاوز ${PRESSURE_THRESHOLD} طلبات: ${hoursText}`
          : `⚠️ High pressure: ${hourlyPressure.length} hours exceed ${PRESSURE_THRESHOLD} orders: ${hoursText}`,
        { duration: 8000 }
      );

      // Send push notification to admins (once per date)
      if (dateStr !== lastPushDate) {
        setLastPushDate(dateStr);
        const hoursListAr = hourlyPressure.map(h => `${h.label}: ${h.count} طلبات`).join(' | ');
        const hoursListEn = hourlyPressure.map(h => `${h.label}: ${h.count} orders`).join(' | ');
        supabase.functions.invoke('push-notification', {
          body: {
            topic: 'admin_orders',
            title: '🔥 High Booking Pressure Alert',
            titleAr: '🔥 تنبيه ضغط حجوزات عالي',
            body: `${dateStr} — ${hourlyPressure.length} hours exceed ${PRESSURE_THRESHOLD} orders: ${hoursListEn}`,
            bodyAr: `${dateStr} — ${hourlyPressure.length} ساعات تتجاوز ${PRESSURE_THRESHOLD} طلبات: ${hoursListAr}`,
            data: { type: 'pressure_alert', date: dateStr },
          },
        }).then(({ error }) => {
          if (error) console.error('Push pressure alert failed:', error);
          else console.log('Pressure alert push sent to admins');
        });
      }
    }
  }, [hourlyPressure, dateStr, lastAlertDate, lastPushDate, loading, isRTL, PRESSURE_THRESHOLD]);

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return isRTL ? 'غير معين' : 'Unassigned';
    return drivers.find(d => d.id === driverId)?.name || driverId.slice(0, 8);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error(isRTL ? 'فشل في تحديث الحالة' : 'Failed to update status');
    } else {
      toast.success(isRTL ? 'تم تحديث الحالة' : 'Status updated');
      fetchOrders();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order #', 'Customer', 'Phone', 'Time', 'Type', 'Status', 'Total', 'Zone', 'Driver'];
    const rows = filteredOrders.map(o => [
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.scheduled_time_slot || '-',
      o.order_type || 'delivery',
      o.status || 'pending',
      o.total.toFixed(2),
      o.delivery_city || '-',
      getDriverName(o.driver_id),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(isRTL ? 'تم تصدير الملف' : 'CSV exported');
  };

  const handlePrint = (order: BookingOrder) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8"/>
        <title>Receipt - ${order.order_number}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 4mm; line-height: 1.4; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          .row { display: flex; justify-content: space-between; }
          .item { margin: 2px 0; }
          h1 { font-size: 16px; margin-bottom: 4px; }
          h2 { font-size: 13px; margin-bottom: 2px; }
          .footer { margin-top: 8px; font-size: 10px; text-align: center; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="center">
          <h1 class="bold">ملحمة السرايا</h1>
          <h2>Al Saraya Butchery</h2>
          <p>أبوظبي - الإمارات</p>
        </div>
        <div class="divider"></div>
        <div class="row"><span>${isRTL ? 'رقم الطلب' : 'Order'}:</span><span class="bold">${order.order_number}</span></div>
        <div class="row"><span>${isRTL ? 'التاريخ' : 'Date'}:</span><span>${order.scheduled_date || '-'}</span></div>
        <div class="row"><span>${isRTL ? 'الوقت' : 'Time'}:</span><span>${order.scheduled_time_slot || '-'}</span></div>
        <div class="row"><span>${isRTL ? 'النوع' : 'Type'}:</span><span>${order.order_type === 'pickup' ? (isRTL ? 'استلام' : 'Pickup') : (isRTL ? 'توصيل' : 'Delivery')}</span></div>
        <div class="divider"></div>
        <div class="row"><span>${isRTL ? 'العميل' : 'Customer'}:</span><span>${order.customer_name}</span></div>
        <div class="row"><span>${isRTL ? 'الهاتف' : 'Phone'}:</span><span>${order.customer_phone}</span></div>
        ${order.delivery_address ? `<div class="row"><span>${isRTL ? 'العنوان' : 'Address'}:</span><span style="max-width:45mm;text-align:end">${order.delivery_address}</span></div>` : ''}
        <div class="divider"></div>
        <p class="bold">${isRTL ? 'المنتجات' : 'Items'}:</p>
        ${items.map((item: any) => `
          <div class="item">
            <div class="row">
              <span>${item.productName || item.product_name || '-'}</span>
              <span>${item.quantity || 1} × ${(item.pricePerUnit || item.price_per_unit || 0).toFixed(2)}</span>
            </div>
            <div style="text-align:end;font-size:11px">${(item.totalPrice || item.subtotal || 0).toFixed(2)} AED</div>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="row"><span>${isRTL ? 'المجموع الفرعي' : 'Subtotal'}:</span><span>${order.subtotal.toFixed(2)} AED</span></div>
        ${order.delivery_fee ? `<div class="row"><span>${isRTL ? 'رسوم التوصيل' : 'Delivery'}:</span><span>${order.delivery_fee.toFixed(2)} AED</span></div>` : ''}
        <div class="row bold"><span>${isRTL ? 'الإجمالي' : 'Total'}:</span><span>${order.total.toFixed(2)} AED</span></div>
        <div class="divider"></div>
        <div class="footer">
          <p>TRN: 104272297100003</p>
          <p>${isRTL ? 'شكراً لتعاملكم معنا' : 'Thank you for your order'}</p>
        </div>
        <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const StatusBadge = ({ status }: { status: string | null }) => {
    const s = status || 'pending';
    const config = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
    return (
      <Badge variant="outline" className={cn('text-xs font-medium border', config.color)}>
        {isRTL ? config.label : config.labelEn}
      </Badge>
    );
  };

  // Mobile card view
  const OrderCard = ({ order }: { order: BookingOrder }) => (
    <Card className="lg:hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-sm">{order.order_number}</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isRTL ? 'العميل' : 'Customer'}</span>
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isRTL ? 'الهاتف' : 'Phone'}</span>
            <span dir="ltr">{order.customer_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isRTL ? 'الوقت' : 'Time'}</span>
            <span>{order.scheduled_time_slot || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isRTL ? 'النوع' : 'Type'}</span>
            <Badge variant="secondary" className="text-xs">
              {order.order_type === 'pickup' ? (isRTL ? 'استلام' : 'Pickup') : (isRTL ? 'توصيل' : 'Delivery')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isRTL ? 'المنطقة' : 'Zone'}</span>
            <span>{order.delivery_city || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isRTL ? 'السائق' : 'Driver'}</span>
            <span>{getDriverName(order.driver_id)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
            <span>{order.total.toFixed(2)} AED</span>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setSelectedOrder(order); setDetailsOpen(true); }}>
            <Eye className="w-3 h-3 me-1" />{isRTL ? 'عرض' : 'View'}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handlePrint(order)}>
            <Printer className="w-3 h-3 me-1" />{isRTL ? 'طباعة' : 'Print'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[180px]">
                <CalendarDays className="w-4 h-4" />
                {isToday(selectedDate) 
                  ? (isRTL ? 'اليوم' : 'Today') + ' - ' + format(selectedDate, 'dd/MM')
                  : format(selectedDate, 'dd/MM/yyyy')
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                locale={isRTL ? ar : undefined}
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={fetchOrders} title={isRTL ? 'تحديث' : 'Refresh'}>
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none gap-1 h-8 px-3"
              onClick={() => setViewMode('list')}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">{isRTL ? 'قائمة' : 'List'}</span>
            </Button>
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none gap-1 h-8 px-3"
              onClick={() => setViewMode('weekly')}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">{isRTL ? 'أسبوعي' : 'Weekly'}</span>
            </Button>
          </div>

          <div className="flex-1" />

          <Button variant="outline" size="sm" className="gap-1" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? 'تصدير CSV' : 'Export CSV'}</span>
          </Button>
        </div>
      </div>

      {/* Weekly Calendar View */}
      {viewMode === 'weekly' && (
        <WeeklyCalendarView
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          onSwitchToList={() => setViewMode('list')}
          alertThreshold={PRESSURE_THRESHOLD}
        />
      )}

      {viewMode === 'list' && (
      <>
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isRTL ? 'بحث بالرقم أو الاسم أو الهاتف...' : 'Search order #, name, phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>

          <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'الكل' : 'All Types'}</SelectItem>
              <SelectItem value="delivery">{isRTL ? 'توصيل' : 'Delivery'}</SelectItem>
              <SelectItem value="pickup">{isRTL ? 'استلام' : 'Pickup'}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'كل الحالات' : 'All Status'}</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <SelectItem key={key} value={key}>{isRTL ? val.label : val.labelEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'كل السائقين' : 'All Drivers'}</SelectItem>
              <SelectItem value="unassigned">{isRTL ? 'غير معين' : 'Unassigned'}</SelectItem>
              {drivers.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الطلبات' : 'Total Orders'}</p>
              <p className="text-2xl font-bold">{summary.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{isRTL ? 'الإيرادات' : 'Revenue'}</p>
              <p className="text-2xl font-bold">{summary.totalRevenue.toFixed(0)} <span className="text-sm font-normal">AED</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">{isRTL ? 'توزيع الحالات' : 'Status Breakdown'}</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(summary.statusCounts).map(([status, count]) => {
                const config = STATUS_CONFIG[status];
                return (
                  <Badge key={status} variant="outline" className={cn('text-xs border', config?.color)}>
                    {isRTL ? config?.label : config?.labelEn}: {count}
                  </Badge>
                );
              })}
              {Object.keys(summary.statusCounts).length === 0 && (
                <span className="text-xs text-muted-foreground">{isRTL ? 'لا توجد طلبات' : 'No orders'}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Pressure Alerts */}
      {hourlyPressure.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-bold text-sm text-destructive">
                {isRTL ? 'تنبيه ضغط عالي' : 'High Pressure Alert'}
              </h3>
              <Bell className="w-4 h-4 text-destructive animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-2">
              {hourlyPressure.map(hp => (
                <Badge key={hp.hour} variant="outline" className="border-destructive/40 text-destructive bg-destructive/10 gap-1.5 text-xs">
                  <Clock className="w-3 h-3" />
                  {hp.label}: <span className="font-bold">{hp.count}</span> {isRTL ? 'طلبات' : 'orders'}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isRTL 
                ? `⚠️ الساعات أعلاه تتجاوز ${PRESSURE_THRESHOLD} طلبات — يُنصح بتوزيع السائقين مسبقاً`
                : `⚠️ Hours above exceed ${PRESSURE_THRESHOLD} orders — consider pre-assigning drivers`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">{isRTL ? 'لا توجد حجوزات' : 'No bookings'}</p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? `لا توجد طلبات مجدولة ليوم ${format(selectedDate, 'dd/MM/yyyy')}` : `No orders scheduled for ${format(selectedDate, 'dd/MM/yyyy')}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(['morning', 'afternoon', 'evening', 'unscheduled'] as const).map(block => {
            const blockOrders = groupedOrders[block];
            if (blockOrders.length === 0) return null;
            const blockConfig = TIME_BLOCKS[block];
            const BlockIcon = blockConfig.icon;

            return (
              <div key={block}>
                <div className="flex items-center gap-2 mb-2">
                  <BlockIcon className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {isRTL ? blockConfig.labelAr : blockConfig.labelEn} ({blockOrders.length})
                  </h3>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-2">
                  {blockOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground">
                        <th className="px-3 py-2 text-start font-medium">{isRTL ? 'الوقت' : 'Time'}</th>
                        <th className="px-3 py-2 text-start font-medium">{isRTL ? 'رقم الطلب' : 'Order #'}</th>
                        <th className="px-3 py-2 text-start font-medium">{isRTL ? 'العميل' : 'Customer'}</th>
                        <th className="px-3 py-2 text-start font-medium">{isRTL ? 'النوع' : 'Type'}</th>
                        <th className="px-3 py-2 text-start font-medium">{isRTL ? 'المنطقة' : 'Zone'}</th>
                        <th className="px-3 py-2 text-start font-medium">{isRTL ? 'السائق' : 'Driver'}</th>
                        <th className="px-3 py-2 text-start font-medium">{isRTL ? 'الحالة' : 'Status'}</th>
                        <th className="px-3 py-2 text-end font-medium">{isRTL ? 'الإجمالي' : 'Total'}</th>
                        <th className="px-3 py-2 text-center font-medium">{isRTL ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockOrders.map((order, idx) => (
                        <tr key={order.id} className={cn("border-t hover:bg-muted/30 transition-colors", idx % 2 === 0 && "bg-muted/10")}>
                          <td className="px-3 py-2.5 text-xs">{order.scheduled_time_slot || '-'}</td>
                          <td className="px-3 py-2.5 font-mono font-bold text-primary text-xs">{order.order_number}</td>
                          <td className="px-3 py-2.5">
                            <div className="text-sm font-medium">{order.customer_name}</div>
                            <div className="text-xs text-muted-foreground" dir="ltr">{order.customer_phone}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant="secondary" className="text-xs">
                              {order.order_type === 'pickup' ? (isRTL ? 'استلام' : 'Pickup') : (isRTL ? 'توصيل' : 'Delivery')}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-xs">{order.delivery_city || '-'}</td>
                          <td className="px-3 py-2.5 text-xs">{getDriverName(order.driver_id)}</td>
                          <td className="px-3 py-2.5"><StatusBadge status={order.status} /></td>
                          <td className="px-3 py-2.5 text-end font-bold text-sm">{order.total.toFixed(2)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedOrder(order); setDetailsOpen(true); }}>
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handlePrint(order)}>
                                <Printer className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {selectedOrder.order_number}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">{isRTL ? 'العميل' : 'Customer'}</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{isRTL ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-medium" dir="ltr">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{isRTL ? 'التاريخ' : 'Date'}</p>
                    <p className="font-medium">{selectedOrder.scheduled_date || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{isRTL ? 'الوقت' : 'Time'}</p>
                    <p className="font-medium">{selectedOrder.scheduled_time_slot || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{isRTL ? 'نوع الطلب' : 'Order Type'}</p>
                    <p className="font-medium">{selectedOrder.order_type === 'pickup' ? (isRTL ? 'استلام من المحل' : 'Pickup') : (isRTL ? 'توصيل' : 'Delivery')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{isRTL ? 'الحالة' : 'Status'}</p>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  {selectedOrder.delivery_address && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">{isRTL ? 'العنوان' : 'Address'}</p>
                      <p className="font-medium">{selectedOrder.delivery_address}</p>
                    </div>
                  )}
                  {selectedOrder.delivery_notes && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">{isRTL ? 'ملاحظات' : 'Notes'}</p>
                      <p className="font-medium">{selectedOrder.delivery_notes}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">{isRTL ? 'المنتجات' : 'Items'}</h4>
                  <div className="space-y-2">
                    {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                        <span>{item.productName || item.product_name || '-'}</span>
                        <span className="font-medium">{item.quantity || 1} × {(item.pricePerUnit || item.price_per_unit || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} AED</span>
                  </div>
                  {selectedOrder.delivery_fee ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                      <span>{selectedOrder.delivery_fee.toFixed(2)} AED</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-base">
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span>{selectedOrder.total.toFixed(2)} AED</span>
                  </div>
                </div>

                <Separator />

                {/* Change Status */}
                <div>
                  <p className="text-sm font-medium mb-2">{isRTL ? 'تغيير الحالة' : 'Change Status'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(s => {
                      const config = STATUS_CONFIG[s];
                      const isActive = selectedOrder.status === s;
                      return (
                        <Button
                          key={s}
                          size="sm"
                          variant={isActive ? 'default' : 'outline'}
                          className="text-xs"
                          disabled={isActive}
                          onClick={() => {
                            handleStatusChange(selectedOrder.id, s);
                            setSelectedOrder({ ...selectedOrder, status: s });
                          }}
                        >
                          {isRTL ? config.label : config.labelEn}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" variant="outline" onClick={() => handlePrint(selectedOrder)}>
                    <Printer className="w-4 h-4 me-2" />{isRTL ? 'طباعة الفاتورة' : 'Print Receipt'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingsPage;
