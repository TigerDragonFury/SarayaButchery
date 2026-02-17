import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MapPin, 
  Package, 
  Truck, 
  Users, 
  Clock,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Phone,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Save,
  Loader2,
  Power
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus, ORDER_STATUS_CONFIG, DriverAvailability } from '@/types/order';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import { useOrderNotificationSound } from '@/hooks/useOrderNotificationSound';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DashboardOrder {
  id: string;
  order_number: string;
  iiko_order_number: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string | null;
  delivery_notes: string | null;
  status: OrderStatus;
  total: number;
  items: any;
  driver_id: string | null;
  iiko_synced: boolean | null;
  source: string | null;
  created_at: string;
}

interface DashboardDriver {
  id: string;
  name: string;
  phone: string;
  availability: DriverAvailability;
  current_order_id: string | null;
  vehicle_type: string | null;
  vehicle_number: string | null;
}

const AdminDeliveryDashboard = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { playStatusChangeSound } = useOrderNotificationSound();
  const isRTL = language === 'ar';

  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [drivers, setDrivers] = useState<DashboardDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('orders');
  const [orderVoiceNotes, setOrderVoiceNotes] = useState<Record<string, { storage_path: string; duration_seconds: number }[]>>({});
  const previousOrderCountRef = useRef(0);

  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DashboardDriver | null>(null);
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', vehicle_type: 'motorcycle', vehicle_number: '' });
  const [savingDriver, setSavingDriver] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState<string>('all');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [togglingDelivery, setTogglingDelivery] = useState(false);

  // Fetch delivery availability setting
  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'delivery_available')
        .maybeSingle();
      if (data) setDeliveryAvailable(data.value as boolean);
    };
    fetchDeliveryStatus();
  }, []);

  const toggleDeliveryAvailability = async () => {
    setTogglingDelivery(true);
    const newValue = !deliveryAvailable;
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ key: 'delivery_available', value: newValue as any }, { onConflict: 'key' });
      if (error) throw error;
      setDeliveryAvailable(newValue);
      toast({
        title: newValue
          ? (isRTL ? '✅ التوصيل متاح الآن' : '✅ Delivery is now available')
          : (isRTL ? '🚫 التوصيل متوقف الآن' : '🚫 Delivery is now unavailable'),
      });
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setTogglingDelivery(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, driversRes, voiceRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, iiko_order_number, customer_name, customer_phone, delivery_address, delivery_city, delivery_notes, status, total, items, driver_id, iiko_synced, source, created_at')
          .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'])
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('drivers')
          .select('id, name, phone, availability, current_order_id, vehicle_type, vehicle_number'),
        supabase
          .from('order_voice_notes')
          .select('order_id, storage_path, duration_seconds'),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as DashboardOrder[]);
      if (driversRes.data) setDrivers(driversRes.data as DashboardDriver[]);

      if (voiceRes.data) {
        const grouped: Record<string, { storage_path: string; duration_seconds: number }[]> = {};
        voiceRes.data.forEach((note: any) => {
          if (!grouped[note.order_id]) grouped[note.order_id] = [];
          grouped[note.order_id].push({ storage_path: note.storage_path, duration_seconds: note.duration_seconds });
        });
        setOrderVoiceNotes(grouped);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sound alert for new orders
  useEffect(() => {
    const newOrderCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    const previousCount = previousOrderCountRef.current;
    
    // Play sound only if we have new orders (and not on initial load)
    if (previousCount > 0 && newOrderCount > previousCount) {
      playStatusChangeSound('confirmed');
      toast({
        title: isRTL ? '🔔 طلب جديد!' : '🔔 New Order!',
        description: isRTL ? `${newOrderCount - previousCount} طلب جديد جاهز للتأكيد` : `${newOrderCount - previousCount} new order(s) ready`,
      });
    }
    
    previousOrderCountRef.current = newOrderCount;
  }, [orders, isRTL, toast, playStatusChangeSound]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  // Today's delivered count
  const [deliveredToday, setDeliveredToday] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  useEffect(() => {
    const fetchTodayStats = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('orders')
        .select('id, total')
        .eq('status', 'delivered')
        .gte('delivered_at', todayStart.toISOString());
      setDeliveredToday(data?.length || 0);
      setTodayRevenue(data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0);
    };
    fetchTodayStats();
  }, []);

  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
  const activeDeliveries = orders.filter(o => o.status === 'out_for_delivery');
  const availableDrivers = drivers.filter(d => d.availability === 'available');
  const busyDrivers = drivers.filter(d => d.availability === 'on_delivery');

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = !driverSearch || d.name.toLowerCase().includes(driverSearch.toLowerCase()) || d.phone.includes(driverSearch);
    const matchesStatus = driverStatusFilter === 'all' || d.availability === driverStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetDriverForm = () => {
    setDriverForm({ name: '', phone: '', vehicle_type: 'motorcycle', vehicle_number: '' });
    setEditingDriver(null);
  };

  const handleAddDriver = async () => {
    if (!driverForm.name || !driverForm.phone) {
      toast({ title: isRTL ? 'أدخل الاسم ورقم الهاتف' : 'Enter name and phone', variant: 'destructive' });
      return;
    }
    setSavingDriver(true);
    try {
      const { error } = await supabase.from('drivers').insert({
        name: driverForm.name,
        phone: driverForm.phone,
        vehicle_type: driverForm.vehicle_type || 'motorcycle',
        vehicle_number: driverForm.vehicle_number || null,
      });
      if (error) throw error;
      toast({ title: isRTL ? 'تم إضافة السائق بنجاح' : 'Driver added successfully' });
      resetDriverForm();
      setIsAddDriverOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingDriver(false);
    }
  };

  const handleEditDriver = async () => {
    if (!editingDriver) return;
    setSavingDriver(true);
    try {
      const { error } = await supabase.from('drivers').update({
        name: driverForm.name,
        phone: driverForm.phone,
        vehicle_type: driverForm.vehicle_type || 'motorcycle',
        vehicle_number: driverForm.vehicle_number || null,
      }).eq('id', editingDriver.id);
      if (error) throw error;
      toast({ title: isRTL ? 'تم تحديث بيانات السائق' : 'Driver updated' });
      resetDriverForm();
      setEditingDriver(null);
      fetchData();
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingDriver(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا السائق؟' : 'Are you sure you want to delete this driver?')) return;
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', driverId);
      if (error) throw error;
      toast({ title: isRTL ? 'تم حذف السائق' : 'Driver deleted' });
      fetchData();
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateDriverStatus = async (driverId: string, newStatus: DriverAvailability) => {
    try {
      const { error } = await supabase.from('drivers').update({ availability: newStatus }).eq('id', driverId);
      if (error) throw error;
      toast({ title: isRTL ? 'تم تحديث حالة السائق' : 'Driver status updated' });
      fetchData();
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openEditDriver = (driver: DashboardDriver) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type || 'motorcycle',
      vehicle_number: driver.vehicle_number || '',
    });
  };

  const assignDriver = async (orderId: string, driverId: string) => {
    try {
      // Create driver_orders record
      await supabase.from('driver_orders').insert({
        driver_id: driverId,
        order_id: orderId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
      });
      // Update order
      await supabase.from('orders').update({ driver_id: driverId }).eq('id', orderId);
      // Update driver
      await supabase.from('drivers').update({ availability: 'on_delivery', current_order_id: orderId }).eq('id', driverId);
      
      toast({ title: isRTL ? 'تم تعيين السائق' : 'Driver Assigned' });
      fetchData();
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast({ title: isRTL ? 'تم التحديث' : 'Status Updated' });
      fetchData();
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = ORDER_STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={config?.color}>
        {isRTL ? config?.label : config?.labelEn}
      </Badge>
    );
  };

  const getAvailabilityBadge = (availability: DriverAvailability) => {
    const configs: Record<DriverAvailability, { label: string; labelEn: string; className: string }> = {
      available: { label: 'متاح', labelEn: 'Available', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      on_delivery: { label: 'في التوصيل', labelEn: 'On Delivery', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      offline: { label: 'غير متصل', labelEn: 'Offline', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    };
    const config = configs[availability];
    return <Badge className={config.className}>{isRTL ? config.label : config.labelEn}</Badge>;
  };

  return (
    <AdminLayout title="Delivery Dashboard" titleAr="لوحة إدارة التوصيل">
      <div className="space-y-6">
        {/* Delivery Toggle + Stats */}
        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            variant={deliveryAvailable ? 'default' : 'destructive'}
            className="w-full md:w-auto self-start font-bold text-base py-6"
            disabled={togglingDelivery}
            onClick={toggleDeliveryAvailability}
          >
            {togglingDelivery ? (
              <Loader2 className="w-5 h-5 me-2 animate-spin" />
            ) : (
              <Power className="w-5 h-5 me-2" />
            )}
            {deliveryAvailable
              ? (isRTL ? '🟢 التوصيل متاح — اضغط لإيقاف' : '🟢 Delivery ON — Click to disable')
              : (isRTL ? '🔴 التوصيل متوقف — اضغط لتفعيل' : '🔴 Delivery OFF — Click to enable')
            }
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Package, value: pendingOrders.length, labelAr: 'طلبات قيد الانتظار', labelEn: 'Pending Orders', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
            { icon: Truck, value: activeDeliveries.length, labelAr: 'توصيلات نشطة', labelEn: 'Active Deliveries', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
            { icon: Users, value: availableDrivers.length, labelAr: 'سائقين متاحين', labelEn: 'Available Drivers', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
            { icon: CheckCircle2, value: deliveredToday, labelAr: 'تم التوصيل اليوم', labelEn: 'Delivered Today', color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Clock, value: `${busyDrivers.length}`, labelAr: 'سائقين في التوصيل', labelEn: 'Busy Drivers', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
            { icon: DollarSign, value: `${todayRevenue}`, labelAr: 'إيرادات اليوم', labelEn: "Today's Revenue", color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20', suffix: isRTL ? ' د.إ' : ' AED' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{card.value}{card.suffix || ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isRTL ? card.labelAr : card.labelEn}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 me-2" />
              {isRTL ? 'الطلبات' : 'Orders'}
            </TabsTrigger>
            <TabsTrigger value="drivers">
              <Users className="w-4 h-4 me-2" />
              {isRTL ? 'السائقين' : 'Drivers'}
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="w-4 h-4 me-2" />
              {isRTL ? 'الخريطة' : 'Map'}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{isRTL ? 'الطلبات النشطة' : 'Active Orders'}</h2>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 me-2 ${loading ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{isRTL ? 'لا توجد طلبات نشطة حالياً' : 'No active orders at the moment'}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-bold text-primary">
                              {order.iiko_order_number || order.order_number}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          {order.iiko_order_number && (
                            <p className="text-xs text-muted-foreground font-mono mb-1">{order.order_number}</p>
                          )}
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customer_phone}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {order.delivery_address}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{order.total} {isRTL ? 'د.إ' : 'AED'}</p>
                          <p className="text-xs text-muted-foreground">
                            {Array.isArray(order.items) ? order.items.length : 0} {isRTL ? 'منتجات' : 'items'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline me-1" />
                            {formatTime(order.created_at)}
                          </p>
                          {orderVoiceNotes[order.id]?.map((note, idx) => (
                            <VoiceNotePlayer key={idx} storagePath={note.storage_path} duration={note.duration_seconds} size="sm" />
                          ))}
                        </div>

                        <div className="flex flex-col gap-2 min-w-[150px]">
                          {!order.driver_id && order.status !== 'delivered' && (
                            <Select onValueChange={(driverId) => assignDriver(order.id, driverId)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={isRTL ? 'تعيين سائق' : 'Assign Driver'} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDrivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                                ))}
                                {availableDrivers.length === 0 && (
                                  <SelectItem value="none" disabled>
                                    {isRTL ? 'لا يوجد سائقين متاحين' : 'No drivers available'}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}

                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <Select value={order.status} onValueChange={(status) => updateOrderStatus(order.id, status as OrderStatus)}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                                <SelectItem value="confirmed">{isRTL ? 'تم التأكيد' : 'Confirmed'}</SelectItem>
                                <SelectItem value="preparing">{isRTL ? 'قيد التحضير' : 'Preparing'}</SelectItem>
                                <SelectItem value="ready">{isRTL ? 'جاهز' : 'Ready'}</SelectItem>
                                <SelectItem value="out_for_delivery">{isRTL ? 'في الطريق' : 'Out for Delivery'}</SelectItem>
                                <SelectItem value="delivered">{isRTL ? 'تم التوصيل' : 'Delivered'}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}

                          {order.iiko_synced && (
                            <Badge variant="outline" className="text-xs justify-center">✓ iiko</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{isRTL ? 'إدارة السائقين' : 'Driver Management'}</h2>
              <div className="flex gap-2">
                <Dialog open={isAddDriverOpen} onOpenChange={(open) => { setIsAddDriverOpen(open); if (!open) resetDriverForm(); }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 me-2" />
                      {isRTL ? 'إضافة سائق' : 'Add Driver'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isRTL ? 'إضافة سائق جديد' : 'Add New Driver'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'اسم السائق' : 'Driver Name'} *</Label>
                        <Input
                          value={driverForm.name}
                          onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                          placeholder={isRTL ? 'أحمد محمد' : 'Ahmed Mohammed'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'} *</Label>
                        <Input
                          value={driverForm.phone}
                          onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                          placeholder="+971501234567"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'نوع المركبة' : 'Vehicle Type'}</Label>
                        <Select value={driverForm.vehicle_type} onValueChange={(v) => setDriverForm({ ...driverForm, vehicle_type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="motorcycle">{isRTL ? 'دراجة نارية' : 'Motorcycle'}</SelectItem>
                            <SelectItem value="car">{isRTL ? 'سيارة' : 'Car'}</SelectItem>
                            <SelectItem value="van">{isRTL ? 'فان' : 'Van'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رقم المركبة' : 'Vehicle Number'}</Label>
                        <Input
                          value={driverForm.vehicle_number}
                          onChange={(e) => setDriverForm({ ...driverForm, vehicle_number: e.target.value })}
                          placeholder="DXB-1234"
                          dir="ltr"
                        />
                      </div>
                      <Button className="w-full" onClick={handleAddDriver} disabled={savingDriver}>
                        {savingDriver && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        <Plus className="w-4 h-4 me-2" />
                        {isRTL ? 'إضافة السائق' : 'Add Driver'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 me-2 ${loading ? 'animate-spin' : ''}`} />
                  {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder={isRTL ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={driverStatusFilter} onValueChange={setDriverStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                  <SelectItem value="available">{isRTL ? 'متاح' : 'Available'}</SelectItem>
                  <SelectItem value="on_delivery">{isRTL ? 'في التوصيل' : 'On Delivery'}</SelectItem>
                  <SelectItem value="offline">{isRTL ? 'غير متصل' : 'Offline'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Edit Driver Dialog */}
            <Dialog open={!!editingDriver} onOpenChange={(open) => { if (!open) { setEditingDriver(null); resetDriverForm(); } }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isRTL ? 'تعديل بيانات السائق' : 'Edit Driver'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'اسم السائق' : 'Driver Name'} *</Label>
                    <Input
                      value={driverForm.name}
                      onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'} *</Label>
                    <Input
                      value={driverForm.phone}
                      onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'نوع المركبة' : 'Vehicle Type'}</Label>
                    <Select value={driverForm.vehicle_type} onValueChange={(v) => setDriverForm({ ...driverForm, vehicle_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motorcycle">{isRTL ? 'دراجة نارية' : 'Motorcycle'}</SelectItem>
                        <SelectItem value="car">{isRTL ? 'سيارة' : 'Car'}</SelectItem>
                        <SelectItem value="van">{isRTL ? 'فان' : 'Van'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رقم المركبة' : 'Vehicle Number'}</Label>
                    <Input
                      value={driverForm.vehicle_number}
                      onChange={(e) => setDriverForm({ ...driverForm, vehicle_number: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  <Button className="w-full" onClick={handleEditDriver} disabled={savingDriver}>
                    {savingDriver && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                    <Save className="w-4 h-4 me-2" />
                    {isRTL ? 'حفظ التعديلات' : 'Save Changes'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {filteredDrivers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{isRTL ? 'لا يوجد سائقين' : 'No drivers found'}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-start p-3 font-semibold text-muted-foreground">#</th>
                        <th className="text-start p-3 font-semibold text-muted-foreground">{isRTL ? 'الاسم' : 'Name'}</th>
                        <th className="text-start p-3 font-semibold text-muted-foreground">{isRTL ? 'الهاتف' : 'Phone'}</th>
                        <th className="text-start p-3 font-semibold text-muted-foreground">{isRTL ? 'المركبة' : 'Vehicle'}</th>
                        <th className="text-start p-3 font-semibold text-muted-foreground">{isRTL ? 'رقم اللوحة' : 'Plate'}</th>
                        <th className="text-start p-3 font-semibold text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</th>
                        <th className="text-start p-3 font-semibold text-muted-foreground">{isRTL ? 'الطلب الحالي' : 'Current Order'}</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">{isRTL ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDrivers.map((driver, idx) => (
                        <tr key={driver.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-3 text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="p-3 font-medium">{driver.name}</td>
                          <td className="p-3 font-mono text-muted-foreground dir-ltr" dir="ltr">
                            <a href={`tel:${driver.phone}`} className="hover:text-primary flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {driver.phone}
                            </a>
                          </td>
                          <td className="p-3 capitalize">{driver.vehicle_type || '—'}</td>
                          <td className="p-3 font-mono">{driver.vehicle_number || '—'}</td>
                          <td className="p-3">
                            <Select value={driver.availability} onValueChange={(val) => handleUpdateDriverStatus(driver.id, val as DriverAvailability)}>
                              <SelectTrigger className="h-8 text-xs w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">{isRTL ? 'متاح' : 'Available'}</SelectItem>
                                <SelectItem value="on_delivery">{isRTL ? 'في التوصيل' : 'On Delivery'}</SelectItem>
                                <SelectItem value="offline">{isRTL ? 'غير متصل' : 'Offline'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            {driver.current_order_id ? (
                              <Badge variant="secondary" className="text-xs">
                                {isRTL ? 'طلب جاري' : 'Active'}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDriver(driver)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDriver(driver.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
                  {isRTL ? `عرض ${filteredDrivers.length} من ${drivers.length} سائق` : `Showing ${filteredDrivers.length} of ${drivers.length} driver(s)`}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{isRTL ? 'خريطة المتتبع قريباً...' : 'Live tracking map coming soon...'}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDeliveryDashboard;
