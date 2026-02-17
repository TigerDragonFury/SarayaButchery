import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useOrderNotificationSound } from '@/hooks/useOrderNotificationSound';
import { cn } from '@/lib/utils';
import {
  ChefHat, CheckCircle2, Clock, Package, ArrowLeft,
  Maximize, Minimize, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { OrderStatus } from '@/types/order';

interface KitchenOrder {
  id: string;
  order_number: string;
  iiko_order_number: string | null;
  customer_name: string;
  status: OrderStatus;
  items: any;
  created_at: string;
  total: number;
}

interface KitchenOrderItem {
  id: string;
  product_name: string;
  product_name_en: string | null;
  quantity: number;
  unit: string;
  notes: string | null;
}

const KitchenModePage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { toast } = useToast();
  const { playStatusChangeSound } = useOrderNotificationSound();
  const { isLoading: authLoading } = useAdminAuth('admin');

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, KitchenOrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, iiko_order_number, customer_name, status, items, created_at, total')
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data || []);

      // Fetch items for all orders
      if (data && data.length > 0) {
        const { data: items } = await supabase
          .from('order_items')
          .select('id, order_id, product_name, product_name_en, quantity, unit, notes')
          .in('order_id', data.map(o => o.id));

        if (items) {
          const grouped: Record<string, KitchenOrderItem[]> = {};
          items.forEach((item: any) => {
            if (!grouped[item.order_id]) grouped[item.order_id] = [];
            grouped[item.order_id].push(item);
          });
          setOrderItems(grouped);
        }
      }
    } catch (err) {
      console.error('Kitchen fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
        playStatusChangeSound('confirmed');
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, playStatusChangeSound]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrder(orderId);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast({
        title: isRTL ? '✓ تم التحديث' : '✓ Updated',
        description: isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated',
      });
      fetchOrders();
    } catch (err: any) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const getTimeColor = (createdAt: string) => {
    const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
    if (mins > 10) return 'text-red-500 bg-red-500/10';
    if (mins > 5) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-muted-foreground bg-muted';
  };

  const getStatusColumn = (status: OrderStatus) => {
    const config: Record<string, { labelAr: string; labelEn: string; color: string }> = {
      pending: { labelAr: 'جديدة', labelEn: 'New', color: 'border-yellow-500' },
      confirmed: { labelAr: 'مؤكدة', labelEn: 'Confirmed', color: 'border-blue-500' },
      preparing: { labelAr: 'تحت التحضير', labelEn: 'Preparing', color: 'border-orange-500' },
      ready: { labelAr: 'جاهزة', labelEn: 'Ready', color: 'border-green-500' },
    };
    return config[status] || config.pending;
  };

  const getNextAction = (status: OrderStatus): { label: string; labelAr: string; nextStatus: OrderStatus; color: string } | null => {
    switch (status) {
      case 'pending': return { label: 'Accept', labelAr: 'قبول', nextStatus: 'confirmed', color: 'bg-blue-500 hover:bg-blue-600 text-white' };
      case 'confirmed': return { label: 'Start Preparing', labelAr: 'بدأ التحضير', nextStatus: 'preparing', color: 'bg-orange-500 hover:bg-orange-600 text-white' };
      case 'preparing': return { label: 'Ready', labelAr: 'جاهز', nextStatus: 'ready', color: 'bg-green-500 hover:bg-green-600 text-white' };
      default: return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-96" />)}
        </div>
      </div>
    );
  }

  const statusGroups: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready'];

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Kitchen Header */}
      <header className="sticky top-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ChefHat className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">{isRTL ? 'شاشة المطبخ' : 'Kitchen Display'}</h1>
          <Badge variant="outline" className="animate-pulse text-green-500 border-green-500">
            {isRTL ? 'مباشر' : 'LIVE'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {orders.length} {isRTL ? 'طلب' : 'orders'}
          </Badge>
          <Button variant="ghost" size="icon" onClick={fetchOrders}>
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-[calc(100vh-64px)] overflow-hidden">
        {statusGroups.map(status => {
          const col = getStatusColumn(status);
          const statusOrders = orders.filter(o => o.status === status);
          return (
            <div key={status} className={cn("flex flex-col rounded-xl border-t-4 bg-card/50", col.color)}>
              <div className="p-3 flex items-center justify-between border-b">
                <h2 className="font-bold text-lg">{isRTL ? col.labelAr : col.labelEn}</h2>
                <Badge variant="secondary" className="text-lg px-3">{statusOrders.length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {statusOrders.map(order => {
                  const action = getNextAction(order.status);
                  const items = orderItems[order.id] || [];
                  const timeColor = getTimeColor(order.created_at);

                  return (
                    <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        {/* Order header */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-primary text-lg">
                            #{order.iiko_order_number || order.order_number}
                          </span>
                          <Badge className={cn("text-xs", timeColor)}>
                            <Clock className="w-3 h-3 me-1" />
                            {formatDistanceToNow(new Date(order.created_at), {
                              locale: isRTL ? ar : enUS,
                              addSuffix: false,
                            })}
                          </Badge>
                        </div>

                        {/* Customer */}
                        <p className="text-sm font-medium">{order.customer_name}</p>

                        {/* Items */}
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm bg-muted/50 rounded-md px-2 py-1.5">
                              <div className="min-w-0 flex-1">
                                <span className="font-medium">{isRTL ? item.product_name : (item.product_name_en || item.product_name)}</span>
                                {item.notes && (
                                  <p className="text-xs text-primary truncate">📝 {item.notes}</p>
                                )}
                              </div>
                              <span className="font-bold shrink-0 ms-2">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                          ))}
                          {items.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              {isRTL ? 'جاري التحميل...' : 'Loading...'}
                            </p>
                          )}
                        </div>

                        {/* Action button */}
                        {action && (
                          <Button
                            className={cn("w-full h-14 text-lg font-bold", action.color)}
                            onClick={() => updateStatus(order.id, action.nextStatus)}
                            disabled={updatingOrder === order.id}
                          >
                            {updatingOrder === order.id ? (
                              <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                              isRTL ? action.labelAr : action.label
                            )}
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <div className="flex items-center justify-center gap-2 text-green-500 py-2">
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="font-bold">{isRTL ? 'جاهز للتسليم' : 'Ready for pickup'}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {statusOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Package className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">{isRTL ? 'لا توجد طلبات' : 'No orders'}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenModePage;
