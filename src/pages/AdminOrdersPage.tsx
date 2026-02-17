import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { 
  Search, 
  Package,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCw,
  Wifi,
  WifiOff,
  Printer,
  Trash2,
  Ban,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ORDER_STATUS_CONFIG, OrderStatus } from '@/types/order';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileOrderCard from '@/components/admin/MobileOrderCard';
import OrderCardEnhanced from '@/components/admin/OrderCardEnhanced';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { OrderDetailsPanel } from '@/components/admin/OrderDetailsPanel';
import { printOrder } from '@/lib/order-print';
import { useOrderNotificationSound } from '@/hooks/useOrderNotificationSound';

const IIKO_POLL_INTERVAL = 30 * 1000;
const FAST_POLL_INTERVAL = 10 * 1000; // Fast DB polling fallback

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  delivery_city: string | null;
  delivery_notes: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number | null;
  discount: number | null;
  total: number;
  items: any;
  created_at: string;
  source: string | null;
  order_type: string | null;
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  branch_name: string | null;
  iiko_synced: boolean | null;
  iiko_order_id: string | null;
  iiko_order_number: string | null;
  iiko_sync_error: string | null;
  iiko_sync_attempts: number | null;
  updated_at: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_name_en: string | null;
  quantity: number;
  unit: string;
  price_per_unit: number;
  subtotal: number;
  notes: string | null;
  voice_note_path: string | null;
  voice_note_duration: number | null;
}

const AdminOrdersPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { playStatusChangeSound, playCustomSound } = useOrderNotificationSound();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('pending');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isRTL, toast]);

  const syncFromIiko = useCallback(async () => {
    if (!syncEnabled || isSyncing) return;
    
    setIsSyncing(true);
    try {
      console.log('[Admin] Syncing all active orders from iiko...');
      
      const { data, error } = await supabase.functions.invoke('iiko-status-sync', {
        body: null,
        method: 'GET',
      });

      if (!error && data?.success) {
        console.log('[Admin] iiko sync complete:', data);
        setLastSyncTime(new Date());
        
        if (data.synced > 0) {
          await fetchOrders();
        }
      }
    } catch (err) {
      console.warn('[Admin] iiko sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [syncEnabled, isSyncing, fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!syncEnabled) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const initialSyncTimeout = setTimeout(() => {
      syncFromIiko();
    }, 3000);

    pollIntervalRef.current = setInterval(() => {
      syncFromIiko();
    }, IIKO_POLL_INTERVAL);

    console.log(`[Admin] Started iiko polling every ${IIKO_POLL_INTERVAL / 1000}s`);

    return () => {
      clearTimeout(initialSyncTimeout);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [syncEnabled, syncFromIiko]);

  // Realtime subscription with reconnection logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const setupChannel = () => {
      const channel = supabase
        .channel('admin-orders-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            console.log('[Admin] ⚡ Realtime order change:', payload.eventType);
            retryCount = 0; // Reset retry on successful message
            if (payload.eventType === 'INSERT') {
              setOrders(prev => {
                // Prevent duplicates
                if (prev.some(o => o.id === (payload.new as Order).id)) return prev;
                return [payload.new as Order, ...prev];
              });
              // Play distinctive notification sound for new orders
              playCustomSound(880, 200);
              setTimeout(() => playCustomSound(1108, 200), 250);
              setTimeout(() => playCustomSound(1318, 300), 500);
            } else if (payload.eventType === 'UPDATE') {
              setOrders(prev => 
                prev.map(o => o.id === (payload.new as Order).id ? payload.new as Order : o)
              );
            } else if (payload.eventType === 'DELETE') {
              setOrders(prev => prev.filter(o => o.id !== (payload.old as Order).id));
            }
          }
        )
        .subscribe((status) => {
          console.log('[Admin] Realtime status:', status);
          if (status === 'CHANNEL_ERROR' && retryCount < maxRetries) {
            retryCount++;
            console.log(`[Admin] Realtime reconnecting... attempt ${retryCount}`);
            setTimeout(() => {
              supabase.removeChannel(channel);
              setupChannel();
            }, Math.min(1000 * retryCount, 10000));
          }
        });

      return channel;
    };

    const channel = setupChannel();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fast DB polling fallback - catches anything realtime misses
  useEffect(() => {
    const fastPoll = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, updated_at')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error || !data) return;

        // Check for new orders or status changes
        let needsFullRefresh = false;
        for (const freshOrder of data) {
          const existing = orders.find(o => o.id === freshOrder.id);
          if (!existing) {
            needsFullRefresh = true;
            break;
          }
          if (existing.status !== freshOrder.status || existing.updated_at !== freshOrder.updated_at) {
            needsFullRefresh = true;
            break;
          }
        }

        if (needsFullRefresh) {
          console.log('[Admin] 🔄 Fast poll detected changes, refreshing...');
          await fetchOrders();
        }
      } catch (err) {
        console.warn('[Admin] Fast poll error:', err);
      }
    }, FAST_POLL_INTERVAL);

    return () => clearInterval(fastPoll);
  }, [orders, fetchOrders]);

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    } catch (error: any) {
      console.error('Error fetching order items:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      
      if (newStatus === 'confirmed' && order) {
        toast({
          title: isRTL ? 'جاري الإرسال...' : 'Sending to POS...',
          description: isRTL ? 'جاري إرسال الطلب لـ iiko' : 'Sending order to iiko POS',
        });

        const { data: iikoResult, error: iikoError } = await supabase.functions.invoke('iiko-create-order', {
          body: { order_id: orderId }
        });

        if (iikoError) {
          console.error('iiko sync error:', iikoError);
          toast({
            title: isRTL ? 'خطأ في iiko' : 'iiko Error',
            description: iikoError.message || (isRTL ? 'فشل الإرسال لـ POS' : 'Failed to send to POS'),
            variant: 'destructive',
          });
          return;
        }

        if (iikoResult && !iikoResult.success) {
          console.error('iiko create failed:', iikoResult);
          toast({
            title: isRTL ? 'فشل إرسال الطلب' : 'Order Send Failed',
            description: iikoResult.error || (isRTL ? 'فشل الإرسال لـ iiko POS' : 'Failed to send to iiko POS'),
            variant: 'destructive',
          });
          return;
        }

        setOrders(prev => 
          prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' as OrderStatus } : o)
        );

        toast({
          title: isRTL ? '✓ تم الإرسال لـ iiko' : '✓ Sent to iiko',
          description: isRTL 
            ? `تم إرسال الطلب للـ POS بنجاح. iiko ID: ${iikoResult.iikoOrderId}` 
            : `Order sent to POS successfully. iiko ID: ${iikoResult.iikoOrderId}`,
        });
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => 
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );

      toast({
        title: isRTL ? 'تم التحديث' : 'Updated',
        description: isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated',
      });
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
    setOrderDetailsOpen(true);
  };

  const handleQuickPrint = async (order: Order) => {
    let items = orderItems[order.id];
    if (!items) {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        if (error) throw error;
        items = data || [];
        setOrderItems(prev => ({ ...prev, [order.id]: items! }));
      } catch (err) {
        console.error('Error fetching items for print:', err);
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: isRTL ? 'فشل تحميل بيانات الطلب' : 'Failed to load order data',
          variant: 'destructive',
        });
        return;
      }
    }

    const config = ORDER_STATUS_CONFIG[order.status];
    const success = printOrder(order, items, {
      isRTL,
      currency: isRTL ? 'د.إ' : 'AED',
      statusLabel: isRTL ? config?.label : config?.labelEn,
      formatDate,
    });

    if (!success) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow pop-ups',
        variant: 'destructive',
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled');
  };

  const confirmDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setDeleteReason('');
    setDeleteConfirmOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    if (!deleteReason.trim()) {
      toast({
        title: isRTL ? 'مطلوب' : 'Required',
        description: isRTL ? 'الرجاء إدخال سبب الحذف' : 'Please enter a reason for deletion',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`[Admin] Deleting order ${orderToDelete.order_number} - Reason: ${deleteReason}`);

      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderToDelete.id);

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.id);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      setDeleteConfirmOpen(false);
      setOrderToDelete(null);
      setDeleteReason('');

      toast({
        title: isRTL ? 'تم حذف الطلب' : 'Order Deleted',
        description: isRTL ? `تم حذف الطلب ${orderToDelete.order_number} بنجاح` : `Order ${orderToDelete.order_number} has been deleted`,
      });
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <AdminLayout title="Orders Management" titleAr="إدارة الطلبات">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              {isRTL ? 'إدارة الطلبات' : 'Orders Management'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">
                {isRTL 
                  ? `${orders.length} طلب`
                  : `${orders.length} orders`
                }
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-xs">
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span className="text-muted-foreground">
                            {isRTL ? 'جاري المزامنة...' : 'Syncing...'}
                          </span>
                        </>
                      ) : syncEnabled ? (
                        <>
                          <Wifi className="w-3.5 h-3.5 text-primary" />
                          <span className="text-muted-foreground">
                            {lastSyncTime 
                              ? formatDistanceToNow(lastSyncTime, { 
                                  addSuffix: true, 
                                  locale: isRTL ? ar : enUS 
                                })
                              : (isRTL ? 'متصل بـ iiko' : 'Connected to iiko')
                            }
                          </span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {isRTL ? 'المزامنة متوقفة' : 'Sync paused'}
                          </span>
                        </>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRTL 
                      ? `يتم مزامنة حالة الطلبات تلقائياً كل ${IIKO_POLL_INTERVAL / 1000} ثانية من iiko POS`
                      : `Order status syncs automatically every ${IIKO_POLL_INTERVAL / 1000} seconds from iiko POS`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={syncEnabled ? "outline" : "ghost"}
                    size="icon"
                    onClick={() => setSyncEnabled(!syncEnabled)}
                  >
                    {syncEnabled ? (
                      <Wifi className="w-4 h-4 text-primary" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {syncEnabled 
                    ? (isRTL ? 'إيقاف المزامنة التلقائية' : 'Pause auto-sync')
                    : (isRTL ? 'تشغيل المزامنة التلقائية' : 'Enable auto-sync')
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={syncFromIiko} 
                    disabled={isSyncing}
                  >
                    <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isRTL ? 'مزامنة الآن من iiko' : 'Sync now from iiko'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`w-4 h-4 me-2 ${loading ? 'animate-spin' : ''}`} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? 'بحث برقم الطلب أو اسم العميل...' : 'Search by order number or customer...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pe-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders - Tabs System with Enhanced Cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 gap-1 mb-6">
              <TabsTrigger value="pending" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">{isRTL ? 'جديدة' : 'New'}</span>
                <span className="sm:hidden">New</span>
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ms-1 text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">{isRTL ? 'مؤكدة' : 'Confirmed'}</span>
                <span className="sm:hidden">Confirm</span>
                {orders.filter(o => o.status === 'confirmed').length > 0 && (
                  <span className="ms-1 text-xs bg-blue-500/20 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'confirmed').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">{isRTL ? 'تحضير' : 'Preparing'}</span>
                <span className="sm:hidden">Prep</span>
                {orders.filter(o => o.status === 'preparing').length > 0 && (
                  <span className="ms-1 text-xs bg-orange-500/20 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'preparing').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="ready" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">{isRTL ? 'جاهزة' : 'Ready'}</span>
                <span className="sm:hidden">Ready</span>
                {orders.filter(o => o.status === 'ready').length > 0 && (
                  <span className="ms-1 text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'ready').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="out_for_delivery" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">{isRTL ? 'توصيل' : 'Delivery'}</span>
                <span className="sm:hidden">Deliv</span>
                {orders.filter(o => o.status === 'out_for_delivery').length > 0 && (
                  <span className="ms-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'out_for_delivery').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">{isRTL ? 'تم' : 'Done'}</span>
                <span className="sm:hidden">Done</span>
                {orders.filter(o => o.status === 'delivered').length > 0 && (
                  <span className="ms-1 text-xs bg-green-600/20 text-green-600 px-1.5 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'delivered').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">{isRTL ? 'ملغية' : 'Cancelled'}</span>
                <span className="sm:hidden">Cancel</span>
                {orders.filter(o => o.status === 'cancelled').length > 0 && (
                  <span className="ms-1 text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                    {orders.filter(o => o.status === 'cancelled').length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => {
              const tabOrders = orders
                .filter(o => o.status === status && (
                  !searchQuery || 
                  o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  o.customer_phone.includes(searchQuery) ||
                  (o.iiko_order_number && o.iiko_order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (o.iiko_order_id && o.iiko_order_id.toLowerCase().includes(searchQuery.toLowerCase()))
                ))
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

              return (
                <TabsContent key={status} value={status} className="space-y-3">
                  {tabOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {isRTL ? 'لا توجد طلبات' : 'No orders found'}
                    </div>
                  ) : (
                    tabOrders.map((order) => (
                      <OrderCardEnhanced
                        key={order.id}
                        order={order}
                        isExpanded={expandedOrder === order.id}
                        orderItems={orderItems[order.id]}
                        onToggleExpand={toggleExpand}
                        onUpdateStatus={updateOrderStatus}
                        onViewDetails={openOrderDetails}
                        onQuickPrint={handleQuickPrint}
                        onCancelOrder={handleCancelOrder}
                        onDeleteOrder={confirmDeleteOrder}
                        formatDate={formatDate}
                      />
                    ))
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}

        {/* Order Details Drawer/Dialog */}
        {isMobile ? (
          <Drawer open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
                </DrawerTitle>
              </DrawerHeader>
              {selectedOrder && (
                <OrderDetailsPanel
                  order={selectedOrder}
                  orderItems={orderItems[selectedOrder.id] || []}
                  formatDate={formatDate}
                />
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
                </DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <OrderDetailsPanel
                  order={selectedOrder}
                  orderItems={orderItems[selectedOrder.id] || []}
                  formatDate={formatDate}
                />
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تأكيد حذف الطلب' : 'Confirm Delete Order'}
              </DialogTitle>
              <DialogDescription>
                {isRTL
                  ? 'سيتم حذف الطلب نهائياً. الرجاء إدخال سبب الحذف.'
                  : 'This action cannot be undone. Please enter a reason for deletion.'}
              </DialogDescription>
            </DialogHeader>
            {orderToDelete && (
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-semibold">
                    {isRTL ? 'رقم الطلب' : 'Order Number'}: {orderToDelete.order_number}
                  </p>
                  <p className="text-muted-foreground">
                    {isRTL ? 'العميل' : 'Customer'}: {orderToDelete.customer_name}
                  </p>
                </div>
                <textarea
                  placeholder={isRTL ? 'أدخل سبب الحذف...' : 'Enter deletion reason...'}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full min-h-24 px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteOrder}
                disabled={isDeleting || !deleteReason.trim()}
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin me-2" />
                ) : (
                  <Trash2 className="w-4 h-4 me-2" />
                )}
                {isRTL ? 'حذف نهائي' : 'Delete Permanently'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
