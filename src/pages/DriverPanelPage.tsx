import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  Package, 
  CheckCircle2, 
  Play, 
  Pause, 
  Phone,
  Clock,
  User,
  Truck,
  AlertCircle,
  Construction
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, ORDER_STATUS_CONFIG } from '@/types/order';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const DriverPanelPage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [assignedOrder, setAssignedOrder] = useState<Order | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoOrder, setDemoOrder] = useState<Order | null>(null);

  // Initialize demo order
  useEffect(() => {
    if (isDemoMode && !demoOrder) {
      const order: Order = {
        id: 'demo-order-driver',
        order_number: 'ORD-DEMO-DRIVER',
        customer_id: null,
        customer_name: 'أحمد محمد',
        customer_phone: '+971501234567',
        customer_email: null,
        driver_id: 'demo-driver',
        status: 'ready',
        items: [
          {
            productId: 'demo-1',
            productName: 'ريش غنم',
            productNameEn: 'Lamb Ribs',
            quantity: 2,
            unit: 'kg',
            pricePerUnit: 120,
            totalPrice: 240,
          },
          {
            productId: 'demo-2',
            productName: 'كباب لحم',
            productNameEn: 'Beef Kebab',
            quantity: 1.5,
            unit: 'kg',
            pricePerUnit: 85,
            totalPrice: 127.5,
          },
        ],
        subtotal: 367.5,
        delivery_fee: 0,
        discount: 0,
        total: 367.5,
        total_weight: 3.5,
        delivery_address: 'شارع الكورنيش، برج البحر، شقة 1205',
        delivery_city: 'Abu Dhabi',
        delivery_notes: 'الرجاء الاتصال قبل الوصول',
        estimated_arrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        delivered_at: null,
        iiko_order_id: null,
        iiko_synced: false,
        source: 'demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDemoOrder(order);
      setAssignedOrder(order);
      setLoading(false);
    }
  }, [isDemoMode, demoOrder]);

  // Start GPS tracking
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
      (position) => {
        setCurrentLocation(position);
        console.log('Location updated:', position.coords);
        
        // In real mode, would send to database
        if (!isDemoMode && assignedOrder) {
          // supabase.from('driver_locations').insert(...)
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: isRTL ? 'خطأ في الموقع' : 'Location Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setWatchId(id);
    setIsTracking(true);
    toast({
      title: isRTL ? 'تم بدء التتبع' : 'Tracking Started',
      description: isRTL ? 'يتم مشاركة موقعك مع العميل' : 'Your location is being shared with the customer',
    });
  }, [isDemoMode, assignedOrder, toast, isRTL]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    toast({
      title: isRTL ? 'تم إيقاف التتبع' : 'Tracking Stopped',
    });
  }, [watchId, toast, isRTL]);

  // Update order status
  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (isDemoMode) {
      setAssignedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      setDemoOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: isRTL ? 'تم تحديث الحالة' : 'Status Updated',
        description: ORDER_STATUS_CONFIG[newStatus][isRTL ? 'label' : 'labelEn'],
      });

      if (newStatus === 'out_for_delivery') {
        startTracking();
      } else if (newStatus === 'delivered') {
        stopTracking();
      }
      return;
    }

    // Real mode - update in database
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', assignedOrder?.id);

      if (error) throw error;

      // Sync delivery status to iiko if order is linked
      if (assignedOrder?.iiko_order_id && (newStatus === 'out_for_delivery' || newStatus === 'delivered')) {
        const driverAction = newStatus === 'out_for_delivery' ? 'Start Delivery' : 'Mark Delivered';
        
        try {
          const { error: iikoError } = await supabase.functions.invoke('iiko-delivery-update', {
            body: {
              orderId: assignedOrder.id,
              newStatus,
              driverAction,
            },
          });
          
          if (iikoError) {
            console.warn('iiko sync warning:', iikoError);
            // Don't fail the update, just warn
            toast({
              title: isRTL ? 'تحذير' : 'Warning',
              description: isRTL ? 'تم التحديث محلياً. مزامنة iiko قد تأخرت.' : 'Updated locally. iiko sync may be delayed.',
            });
          } else {
            console.log('iiko status synced successfully');
          }
        } catch (syncErr) {
          console.warn('iiko sync error:', syncErr);
        }
      }

      toast({
        title: isRTL ? 'تم تحديث الحالة' : 'Status Updated',
      });

      // Handle tracking based on new status
      if (newStatus === 'out_for_delivery') {
        startTracking();
      } else if (newStatus === 'delivered') {
        stopTracking();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل تحديث الحالة' : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const displayOrder = isDemoMode ? demoOrder : assignedOrder;
  const statusConfig = displayOrder ? ORDER_STATUS_CONFIG[displayOrder.status] : null;

  return (
    <PageLayout>
      <PageHero
        title={isRTL ? 'لوحة السائق' : 'Driver Panel'}
        subtitle={isRTL ? 'إدارة التوصيلات وتتبع الموقع' : 'Manage deliveries and location tracking'}
        backgroundImage="/placeholder.svg"
      />

      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Construction className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                  {isRTL ? 'وضع العرض التجريبي' : 'Demo Mode'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'نظام السائق قيد التطوير' : 'Driver system under development'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="demo-mode" 
                checked={isDemoMode} 
                onCheckedChange={setIsDemoMode}
              />
              <Label htmlFor="demo-mode" className="text-sm">
                {isRTL ? 'تجريبي' : 'Demo'}
              </Label>
            </div>
          </div>
        </div>

        {loading && !isDemoMode ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : displayOrder ? (
          <div className="space-y-6">
            {/* Current Order Card */}
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {isRTL ? 'الطلب الحالي' : 'Current Order'}
                  </CardTitle>
                  {statusConfig && (
                    <Badge className={statusConfig.color}>
                      {isRTL ? statusConfig.label : statusConfig.labelEn}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Number */}
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{isRTL ? 'رقم الطلب' : 'Order Number'}</p>
                  <p className="text-2xl font-mono font-bold">{displayOrder.order_number}</p>
                </div>

                {/* Customer Info */}
                <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{displayOrder.customer_name}</p>
                    <a 
                      href={`tel:${displayOrder.customer_phone}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {displayOrder.customer_phone}
                    </a>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{isRTL ? 'عنوان التوصيل' : 'Delivery Address'}</p>
                    <p className="text-sm text-muted-foreground">{displayOrder.delivery_address}</p>
                    <p className="text-sm text-muted-foreground">{displayOrder.delivery_city}</p>
                    {displayOrder.delivery_notes && (
                      <p className="text-sm text-yellow-600 mt-1">
                        ⚠️ {displayOrder.delivery_notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="p-4 bg-card border rounded-lg">
                  <p className="font-medium mb-2">{isRTL ? 'المنتجات' : 'Items'}</p>
                  <div className="space-y-1 text-sm">
                    {displayOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.productName}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} {item.unit === 'kg' ? (isRTL ? 'كجم' : 'kg') : (isRTL ? 'قطعة' : 'pc')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                    <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span>{displayOrder.total} {isRTL ? 'د.إ' : 'AED'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPS Tracking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  {isRTL ? 'تتبع الموقع' : 'Location Tracking'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tracking Status */}
                <div className={`p-4 rounded-lg flex items-center justify-between ${isTracking ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'}`}>
                  <div className="flex items-center gap-3">
                    {isTracking ? (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                        </span>
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {isRTL ? 'يتم مشاركة موقعك' : 'Sharing Location'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">
                          {isRTL ? 'التتبع متوقف' : 'Tracking Off'}
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    variant={isTracking ? 'destructive' : 'default'}
                    size="sm"
                    onClick={isTracking ? stopTracking : startTracking}
                  >
                    {isTracking ? (
                      <>
                        <Pause className="w-4 h-4 me-2" />
                        {isRTL ? 'إيقاف' : 'Stop'}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 me-2" />
                        {isRTL ? 'بدء' : 'Start'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Current Coordinates */}
                {currentLocation && (
                  <div className="text-xs text-muted-foreground text-center font-mono">
                    {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {isRTL ? 'إجراءات التوصيل' : 'Delivery Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayOrder.status === 'ready' && (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => updateOrderStatus('out_for_delivery')}
                  >
                    <Play className="w-5 h-5 me-2" />
                    {isRTL ? 'بدء التوصيل' : 'Start Delivery'}
                  </Button>
                )}

                {displayOrder.status === 'out_for_delivery' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    size="lg"
                    onClick={() => updateOrderStatus('delivered')}
                  >
                    <CheckCircle2 className="w-5 h-5 me-2" />
                    {isRTL ? 'تم التوصيل' : 'Mark as Delivered'}
                  </Button>
                )}

                {displayOrder.status === 'delivered' && (
                  <div className="text-center p-6 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                    <p className="font-bold text-green-700 dark:text-green-400">
                      {isRTL ? 'تم التوصيل بنجاح!' : 'Delivered Successfully!'}
                    </p>
                  </div>
                )}

                {/* Call Customer */}
                <Button variant="outline" className="w-full" asChild>
                  <a href={`tel:${displayOrder.customer_phone}`}>
                    <Phone className="w-4 h-4 me-2" />
                    {isRTL ? 'اتصل بالعميل' : 'Call Customer'}
                  </a>
                </Button>

                {/* Open in Maps */}
                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayOrder.delivery_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="w-4 h-4 me-2" />
                    {isRTL ? 'فتح في الخرائط' : 'Open in Maps'}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* No Order Assigned */
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? 'لا توجد طلبات' : 'No Orders Assigned'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'لم يتم تعيين أي طلبات لك حالياً. انتظر تعيين طلب جديد.'
                  : 'You have no orders assigned currently. Wait for a new assignment.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default DriverPanelPage;
