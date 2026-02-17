import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  Package, 
  RefreshCw,
  LogOut,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import DriverOrderCard from '@/components/driver/DriverOrderCard';
import DriverAppShell from '@/components/driver/DriverAppShell';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const DriverMobilePage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true); // Demo mode for development

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // For now, use demo mode instead of redirecting
        // In production: navigate('/driver/login');
        setIsDemoMode(true);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if user is a driver
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!driverData) {
        toast({
          title: isRTL ? 'غير مصرح' : 'Unauthorized',
          description: isRTL ? 'هذا الحساب ليس حساب سائق' : 'This account is not a driver account',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setDriverId(driverData.id);
      setIsAuthenticated(true);
      setIsDemoMode(false);
      await fetchOrders(driverData.id);
    };

    checkAuth();
  }, [navigate, toast, isRTL]);

  // Fetch real orders for authenticated driver
  const fetchOrders = async (driverIdParam: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('driver_id', driverIdParam)
        .in('status', ['ready', 'out_for_delivery', 'delivered'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to Order type, handling the items JSON field
      const mappedOrders: Order[] = (data || []).map((order: any) => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : [],
      }));
      
      setOrders(mappedOrders);
      
      // Start tracking if there's an active delivery
      const activeDelivery = mappedOrders.find(o => o.status === 'out_for_delivery');
      if (activeDelivery) {
        startTracking();
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Demo orders for development
  const demoOrders: Order[] = [
    {
      id: 'demo-1',
      order_number: 'ORD-20260129-0001',
      customer_id: null,
      customer_name: 'أحمد محمد',
      customer_phone: '+971501234567',
      customer_email: null,
      driver_id: 'demo-driver',
      status: 'ready',
      items: [
        { productId: '1', productName: 'ريش غنم', productNameEn: 'Lamb Ribs', quantity: 2, unit: 'kg', pricePerUnit: 120, totalPrice: 240 },
        { productId: '2', productName: 'كباب لحم', productNameEn: 'Beef Kebab', quantity: 1.5, unit: 'kg', pricePerUnit: 85, totalPrice: 127.5 },
      ],
      subtotal: 367.5,
      delivery_fee: 0,
      discount: 0,
      total: 367.5,
      total_weight: 3.5,
      delivery_address: 'شارع الكورنيش، برج البحر، شقة 1205، أبوظبي',
      delivery_city: 'Abu Dhabi',
      delivery_notes: 'الرجاء الاتصال قبل الوصول',
      estimated_arrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      delivered_at: null,
      iiko_order_id: null,
      iiko_synced: false,
      source: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      order_number: 'ORD-20260129-0002',
      customer_id: null,
      customer_name: 'سارة العلي',
      customer_phone: '+971507654321',
      customer_email: null,
      driver_id: 'demo-driver',
      status: 'out_for_delivery',
      items: [
        { productId: '3', productName: 'شيش طاووق', productNameEn: 'Shish Tawook', quantity: 1, unit: 'kg', pricePerUnit: 75, totalPrice: 75 },
      ],
      subtotal: 75,
      delivery_fee: 15,
      discount: 0,
      total: 90,
      total_weight: 1,
      delivery_address: 'العين، شارع خليفة، فيلا 45',
      delivery_city: 'Al Ain',
      delivery_notes: null,
      estimated_arrival: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      delivered_at: null,
      iiko_order_id: 'IIKO-123',
      iiko_synced: true,
      source: 'website',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Initialize with demo data
  useEffect(() => {
    setOrders(demoOrders);
    setDriverId('demo-driver');
    setLoading(false);
    // Start tracking if there's an out_for_delivery order
    const activeDelivery = demoOrders.find(o => o.status === 'out_for_delivery');
    if (activeDelivery) {
      startTracking();
    }
  }, []);

  // GPS Tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'المتصفح لا يدعم تتبع الموقع' : 'Browser does not support location tracking',
        variant: 'destructive',
      });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        console.log('Location updated:', position.coords);
        
        // In production, send to database
        if (driverId && driverId !== 'demo-driver') {
          try {
            await supabase.from('driver_locations').insert({
              driver_id: driverId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              heading: position.coords.heading,
              speed: position.coords.speed,
              accuracy: position.coords.accuracy,
            });
          } catch (err) {
            console.error('Error saving location:', err);
          }
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setWatchId(id);
    setIsTracking(true);
  }, [driverId, isRTL, toast]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Haptic feedback
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus, updated_at: new Date().toISOString() } : order
    ));

    toast({
      title: isRTL ? 'تم تحديث الحالة' : 'Status Updated',
      description: ORDER_STATUS_CONFIG[newStatus][isRTL ? 'label' : 'labelEn'],
    });

    if (newStatus === 'out_for_delivery') {
      startTracking();
    } else if (newStatus === 'delivered') {
      stopTracking();
    }
  };

  // Open in maps
  const openInMaps = (order: Order) => {
    const address = encodeURIComponent(order.delivery_address);
    const url = Capacitor.isNativePlatform()
      ? `maps://?q=${address}` // iOS
      : `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };

  // Refresh orders
  const refreshOrders = async () => {
    setRefreshing(true);
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    
    toast({
      title: isRTL ? 'تم التحديث' : 'Refreshed',
    });
  };

  // Filter orders
  const activeOrders = orders.filter(o => ['ready', 'out_for_delivery'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');

  if (loading) {
    return (
      <DriverAppShell>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </DriverAppShell>
    );
  }

  return (
    <DriverAppShell>
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border rounded-xl p-3 text-center">
            <Package className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
            <p className="text-2xl font-bold">{activeOrders.length}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'نشط' : 'Active'}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <Navigation className="w-6 h-6 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold">
              {orders.filter(o => o.status === 'out_for_delivery').length}
            </p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'في الطريق' : 'In Transit'}</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold">{completedOrders.length}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'مكتمل' : 'Done'}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={refreshOrders}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 me-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 me-2" />
          )}
          {isRTL ? 'تحديث الطلبات' : 'Refresh Orders'}
        </Button>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              <Package className="w-4 h-4 me-2" />
              {isRTL ? 'نشط' : 'Active'} ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">
              <CheckCircle2 className="w-4 h-4 me-2" />
              {isRTL ? 'مكتمل' : 'Done'} ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {isRTL ? 'لا توجد طلبات نشطة' : 'No active orders'}
                </p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <DriverOrderCard
                  key={order.id}
                  order={order}
                  isTracking={isTracking && order.status === 'out_for_delivery'}
                  onStartDelivery={() => updateOrderStatus(order.id, 'out_for_delivery')}
                  onMarkDelivered={() => updateOrderStatus(order.id, 'delivered')}
                  onNavigate={() => openInMaps(order)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-4">
            {completedOrders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border">
                <CheckCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {isRTL ? 'لا توجد طلبات مكتملة اليوم' : 'No completed orders today'}
                </p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <DriverOrderCard
                  key={order.id}
                  order={order}
                  onStartDelivery={() => {}}
                  onMarkDelivered={() => {}}
                  onNavigate={() => openInMaps(order)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DriverAppShell>
  );
};

export default DriverMobilePage;
