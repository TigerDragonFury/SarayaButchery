import { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  MessageSquare,
  Scale,
  FileText,
  Mic,
  Send,
  Camera
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '@/types/order';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import { useAdminEmbedded } from '@/contexts/AdminEmbeddedContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import OrderMessageThread from '@/components/shared/OrderMessageThread';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { prepareButcherNotification, getButcherWhatsAppLink } from '@/lib/whatsapp-order';
import { PhotoConfirmationUpload } from '@/components/butcher/PhotoConfirmationUpload';

interface OrderItem {
  productId: string;
  productName: string;
  productNameEn?: string;
  quantity: number;
  unit: 'kg' | 'piece' | 'box';
  pricePerUnit: number;
  totalPrice: number;
  customerNotes?: string;
  isReady?: boolean;
}

interface VoiceNote {
  order_id: string;
  product_id: string | null;
  storage_path: string;
  duration_seconds: number;
}

const ButcherDashboard = () => {
  const isEmbedded = useAdminEmbedded();
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === 'ar';
  const { isLoading: authLoading, isAdmin } = useAdminAuth('admin');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [itemReadyState, setItemReadyState] = useState<Record<string, Record<string, boolean>>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [messageDialog, setMessageDialog] = useState<{
    orderId: string;
    orderNumber: string;
    productId?: string;
    productName?: string;
  } | null>(null);
  const [photoDialog, setPhotoDialog] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  // Fetch active orders (confirmed and preparing)
  const fetchOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['confirmed', 'preparing'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Map database response to Order type
      const mappedOrders: Order[] = (data || []).map((order) => ({
        ...order,
        items: order.items as unknown as OrderItem[],
        status: order.status as OrderStatus,
        driver_id: order.driver_id,
        customer_id: order.customer_id,
        customer_email: order.customer_email,
        delivery_notes: order.delivery_notes,
        estimated_arrival: order.estimated_arrival,
        delivered_at: order.delivered_at,
        iiko_order_id: order.iiko_order_id,
        iiko_synced: order.iiko_synced ?? false,
      }));

      setOrders(mappedOrders);

      // Initialize ready states for items
      const readyStates: Record<string, Record<string, boolean>> = {};
      mappedOrders.forEach((order) => {
        readyStates[order.id] = {};
        const items = order.items as OrderItem[];
        items?.forEach((item) => {
          readyStates[order.id][item.productId] = item.isReady || false;
        });
      });
      setItemReadyState(readyStates);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch voice notes
  const fetchVoiceNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('order_voice_notes')
        .select('order_id, product_id, storage_path, duration_seconds');

      if (error) {
        console.error('Error fetching voice notes:', error);
        return;
      }

      setVoiceNotes(data || []);
    } catch (err) {
      console.error('Error fetching voice notes:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchVoiceNotes();
    }
  }, [isAdmin, fetchOrders, fetchVoiceNotes]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('butcher-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: 'status=in.(confirmed,preparing)',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchOrders]);

  // Get voice note for a specific order/product
  const getVoiceNote = (orderId: string, productId: string) => {
    return voiceNotes.find(
      (vn) => vn.order_id === orderId && (vn.product_id === productId || vn.product_id === null)
    );
  };

  // Mark item as ready
  const toggleItemReady = async (orderId: string, productId: string, isReady: boolean) => {
    setItemReadyState((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [productId]: isReady,
      },
    }));

    // Check if all items in the order are ready
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const items = order.items as OrderItem[];
    const allReady = items.every((item) => {
      if (item.productId === productId) return isReady;
      return itemReadyState[orderId]?.[item.productId] || false;
    });

    if (allReady) {
      // Update order status to 'ready'
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'ready' })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating order status:', error);
          toast({
            title: isRTL ? 'خطأ' : 'Error',
            description: isRTL ? 'فشل تحديث الحالة' : 'Failed to update status',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: isRTL ? 'الطلب جاهز!' : 'Order Ready!',
          description: isRTL
            ? `الطلب ${order.order_number} جاهز للتوصيل`
            : `Order ${order.order_number} is ready for delivery`,
        });

        // Remove from list
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } catch (err) {
        console.error('Error updating order:', err);
      }
    } else {
      toast({
        title: isRTL ? 'تم التحديث' : 'Updated',
        description: isRTL ? 'تم تحديث حالة المنتج' : 'Item status updated',
      });
    }
  };
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const mins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (mins < 60) return isRTL ? `${mins} دقيقة` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return isRTL ? `${hours} ساعة` : `${hours}h ago`;
  };

  // Get status badge
  const getStatusBadge = (status: OrderStatus) => {
    const config = ORDER_STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={config.color}>
        {isRTL ? config.label : config.labelEn}
      </Badge>
    );
  };

  // Show loading
  if (authLoading) {
    if (isEmbedded) return <div className="flex items-center justify-center p-12"><Skeleton className="h-12 w-48" /></div>;
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="h-12 w-48" />
        </div>
      </PageLayout>
    );
  }

  // Access denied
  if (!isAdmin) {
    if (isEmbedded) return <div className="text-center p-12 text-muted-foreground">{isRTL ? 'غير مصرح' : 'Access Denied'}</div>;
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <ShieldAlert className="w-16 h-16 text-destructive" />
          <h1 className="text-2xl font-bold">{isRTL ? 'غير مصرح' : 'Access Denied'}</h1>
          <p className="text-muted-foreground">
            {isRTL ? 'هذه الصفحة للمسؤولين فقط' : 'This page is for administrators only'}
          </p>
        </div>
      </PageLayout>
    );
  }

  const Wrapper = isEmbedded ? ({ children }: { children: React.ReactNode }) => <>{children}</> : PageLayout;

  return (
    <Wrapper>
      {!isEmbedded && (
        <PageHero
          title={isRTL ? 'لوحة الجزار' : 'Butcher Dashboard'}
          subtitle={isRTL ? 'تحضير الطلبات' : 'Order Preparation'}
          backgroundImage="/placeholder.svg"
        />
      )}

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header with refresh */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">
              {isRTL ? 'الطلبات النشطة' : 'Active Orders'}
              <span className="ms-2 text-muted-foreground">({orders.length})</span>
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 me-2 ${refreshing ? 'animate-spin' : ''}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? 'لا توجد طلبات للتحضير' : 'No Orders to Prepare'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL ? 'جميع الطلبات جاهزة!' : 'All orders are ready!'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Orders list */}
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.items as OrderItem[];
            const readyCount = items.filter((item) => itemReadyState[order.id]?.[item.productId]).length;
            const progress = items.length > 0 ? (readyCount / items.length) * 100 : 0;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-2 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="font-mono">{order.order_number}</span>
                        {getStatusBadge(order.status)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 inline me-1" />
                        {formatTime(order.created_at)} • {getTimeAgo(order.created_at)}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">{order.customer_name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {readyCount}/{items.length} {isRTL ? 'جاهز' : 'ready'}
                      </Badge>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {items.map((item, idx) => {
                      const voiceNote = getVoiceNote(order.id, item.productId);
                      const isReady = itemReadyState[order.id]?.[item.productId] || false;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition-colors ${
                            isReady ? 'bg-muted/50 border-primary/30' : 'bg-background'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Item info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isReady}
                                  onCheckedChange={(checked) =>
                                    toggleItemReady(order.id, item.productId, checked as boolean)
                                  }
                                />
                                <span
                                  className={`font-semibold ${isReady ? 'line-through text-muted-foreground' : ''}`}
                                >
                                  {item.productName}
                                </span>
                              </div>

                              {/* Weight/Quantity */}
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1 text-primary font-medium">
                                  <Scale className="w-4 h-4" />
                                  {item.quantity}{' '}
                                  {item.unit === 'kg'
                                    ? isRTL
                                      ? 'كجم'
                                      : 'KG'
                                    : item.unit === 'piece'
                                    ? isRTL
                                      ? 'قطعة'
                                      : 'pcs'
                                    : isRTL
                                    ? 'صندوق'
                                    : 'box'}
                                </span>
                              </div>

                              {/* Text notes */}
                              {item.customerNotes && (
                                <div className="mt-2 p-2 rounded bg-accent/50 border border-accent">
                                  <p className="text-sm flex items-start gap-1">
                                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                    <span className="text-foreground">
                                      {item.customerNotes}
                                    </span>
                                  </p>
                                </div>
                              )}

                              {/* Voice note */}
                              {voiceNote && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Mic className="w-4 h-4 text-primary" />
                                  <VoiceNotePlayer
                                    storagePath={voiceNote.storage_path}
                                    duration={voiceNote.duration_seconds}
                                    size="sm"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant={isReady ? 'secondary' : 'default'}
                                onClick={() => toggleItemReady(order.id, item.productId, !isReady)}
                              >
                                {isReady ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 me-1" />
                                    {isRTL ? 'جاهز' : 'Ready'}
                                  </>
                                ) : (
                                  <>
                                    <Package className="w-4 h-4 me-1" />
                                    {isRTL ? 'تحضير' : 'Mark Ready'}
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setMessageDialog({
                                    orderId: order.id,
                                    orderNumber: order.order_number,
                                    productId: item.productId,
                                    productName: item.productName,
                                  })
                                }
                              >
                                <Send className="w-4 h-4 me-1" />
                                {isRTL ? 'رسالة' : 'Message'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order notes */}
                  {order.delivery_notes && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                      <p className="text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <span>
                          <strong>{isRTL ? 'ملاحظات التوصيل:' : 'Delivery Notes:'}</strong>{' '}
                          {order.delivery_notes}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Photo Confirmation Button */}
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setPhotoDialog({
                          orderId: order.id,
                          orderNumber: order.order_number,
                        })
                      }
                    >
                      <Camera className="w-4 h-4 me-2" />
                      {isRTL ? 'إرسال صورة التأكيد للعميل' : 'Send Photo Confirmation to Customer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => setMessageDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              {isRTL ? 'إرسال رسالة للعميل' : 'Send Message to Customer'}
            </DialogTitle>
            <DialogDescription>
              {messageDialog && (
                <>
                  {isRTL ? 'طلب رقم' : 'Order'} {messageDialog.orderNumber}
                  {messageDialog.productName && ` • ${messageDialog.productName}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {messageDialog && (
            <OrderMessageThread
              orderId={messageDialog.orderId}
              productId={messageDialog.productId}
              productName={messageDialog.productName}
              senderType="butcher"
              className="min-h-[350px]"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Confirmation Dialog */}
      {photoDialog && (
        <PhotoConfirmationUpload
          orderId={photoDialog.orderId}
          orderNumber={photoDialog.orderNumber}
          open={!!photoDialog}
          onOpenChange={(open) => !open && setPhotoDialog(null)}
        />
      )}
    </Wrapper>
  );
};

export default ButcherDashboard;
