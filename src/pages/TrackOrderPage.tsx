import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Package, ArrowLeft, ArrowRight, Phone, MessageCircle, Volume2, VolumeX, RefreshCw, CheckCircle2, Share2, MapPin, Star, AlertTriangle, ThumbsUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useOrderTracking, useDemoOrderTracking } from '@/hooks/useOrderTracking';
import { useProximityAlert } from '@/hooks/useProximityAlert';
import { OrderStatusTimeline } from '@/components/tracking/OrderStatusTimeline';
import { LiveTrackingMap } from '@/components/tracking/LiveTrackingMap';
import { OrderDetails } from '@/components/tracking/OrderDetails';
import { OrderPhotoConfirmation } from '@/components/tracking/OrderPhotoConfirmation';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import { useHeroImages } from '@/hooks/useHeroImages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TrackOrderPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { getHeroImage } = useHeroImages();

  const [searchInput, setSearchInput] = useState(orderNumber || '');
  const { order, updates, driverLocation, loading, error, refetch, soundEnabled, toggleSound, lastSyncTime, isSyncing, isLocationLive } = useOrderTracking(orderNumber || '');
  const { demoOrder, demoLocation, startDemo } = useDemoOrderTracking();

  // Use demo order if no real order
  const displayOrder = order || demoOrder;
  const displayLocation = driverLocation || demoLocation;
  const isDemo = !order && !!demoOrder;

  // Proximity alert for driver approaching
  // For demo, use sample coordinates; for real orders, we'd use geocoded delivery address
  const demoDeliveryCoords = { lat: 24.4988, lng: 54.4055 }; // Al Reem Island sample
  const proximityAlert = useProximityAlert(
    displayOrder?.id || null,
    displayLocation?.latitude || null,
    displayLocation?.longitude || null,
    demoDeliveryCoords.lat,
    demoDeliveryCoords.lng,
    soundEnabled
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim()}`);
    }
  };

  const handleStartDemo = () => {
    startDemo();
  };

  const logFeedback = async (type: 'rating' | 'suggestion' | 'complaint') => {
    if (isDemo || !displayOrder) return;
    try {
      await supabase.from('customer_feedback').insert({
        order_id: displayOrder.id,
        order_number: displayOrder.iiko_order_number || displayOrder.order_number,
        customer_name: displayOrder.customer_name,
        customer_phone: displayOrder.customer_phone,
        feedback_type: type,
      } as any);
    } catch (e) {
      console.error('Failed to log feedback:', e);
    }
  };

  return (
    <PageLayout>
      <PageHero
        title={isRTL ? 'تتبع طلبك' : 'Track Your Order'}
        subtitle={isRTL ? 'تابع حالة طلبك وموقع السائق مباشرة' : 'Follow your order status and driver location in real-time'}
        backgroundImage={getHeroImage('track')}
      />

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Order Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {isRTL ? 'البحث عن طلب' : 'Find Your Order'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder={isRTL ? 'أدخل رقم الطلب الرسمي (من الفاتورة)' : 'Enter official order number (from receipt)'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="w-4 h-4 me-2" />
                {isRTL ? 'بحث' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive/50">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {isRTL ? 'الطلب غير موجود' : 'Order Not Found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'لم نتمكن من العثور على طلب بهذا الرقم. تأكد من إدخال الرقم بشكل صحيح.'
                  : 'We could not find an order with this number. Please check and try again.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/track')}>
                  {isRTL ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
                  {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
                </Button>
                <Button variant="default" onClick={handleStartDemo}>
                  {isRTL ? '🎭 جرّب العرض التجريبي' : '🎭 Try Demo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Display */}
        {displayOrder && !loading && (
          <div className="space-y-6">
            {/* Demo Badge */}
            {isDemo && (
              <div className="text-center">
                <Badge variant="secondary" className="font-medium">
                  {isRTL ? '🎭 عرض تجريبي - البيانات ليست حقيقية' : '🎭 Demo Mode - Data is simulated'}
                </Badge>
              </div>
            )}

            {/* Proximity Alert Banner */}
            {proximityAlert.isNear && (
              <div className={cn(
                "p-4 rounded-xl border-2 animate-pulse",
                "bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20",
                "border-green-500/50"
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-500/30 flex items-center justify-center animate-bounce">
                    <MapPin className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-green-700 dark:text-green-400">
                      {isRTL ? '🚗 السائق على وشك الوصول!' : '🚗 Driver is almost there!'}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {isRTL 
                        ? `السائق على بُعد ${proximityAlert.distance} متر فقط. استعد لاستلام طلبك!`
                        : `Driver is only ${proximityAlert.distance}m away. Get ready to receive your order!`}
                    </p>
                  </div>
                  <Badge className="bg-green-500 text-white shrink-0">
                    {proximityAlert.distance}m
                  </Badge>
                </div>
              </div>
            )}

            {/* Post-Delivery Review Banner */}
            {displayOrder.status === 'delivered' && !isDemo && (
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-lg">
                        {isRTL ? '✨ تم توصيل طلبك بنجاح!' : '✨ Your order has been delivered!'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL 
                          ? 'رأيك يهمنا! شاركنا تجربتك لنستمر في تقديم الأفضل 🙏'
                          : 'Your feedback matters! Share your experience to help us keep improving 🙏'}
                      </p>
                      <Button
                        className="mt-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
                        asChild
                      >
                        <a
                          href={`https://wa.me/971566808565?text=${encodeURIComponent(
                            isRTL
                              ? `⭐ تقييم الطلب رقم: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nمرحباً، أود تقييم طلبي:\n\n🥩 جودة اللحوم: /5\n🚚 سرعة التوصيل: /5\n📦 التغليف: /5\n\n💬 ملاحظات إضافية: `
                              : `⭐ Order Review: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nHi, I'd like to rate my order:\n\n🥩 Meat Quality: /5\n🚚 Delivery Speed: /5\n📦 Packaging: /5\n\n💬 Additional notes: `
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4 me-2" />
                          {isRTL ? 'قيّم طلبك عبر واتساب' : 'Rate via WhatsApp'}
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photo Confirmation (if available) */}
            {!isDemo && orderNumber && (
              <OrderPhotoConfirmation orderNumber={orderNumber} />
            )}

            {/* Order Status Timeline */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">
                      {isRTL ? 'حالة الطلب' : 'Order Status'}
                    </h3>
                    {/* iiko Sync Indicator */}
                    {!isDemo && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {isSyncing ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                              )}
                              <span className="hidden sm:inline">
                                {isSyncing 
                                  ? (isRTL ? 'جاري التحديث...' : 'Syncing...')
                                  : lastSyncTime 
                                    ? formatDistanceToNow(lastSyncTime, { 
                                        addSuffix: true, 
                                        locale: isRTL ? ar : enUS 
                                      })
                                    : (isRTL ? 'متصل' : 'Connected')
                                }
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isRTL 
                              ? 'يتم تحديث الحالة تلقائياً كل 30 ثانية من نظام الكاشير'
                              : 'Status updates automatically every 30 seconds from POS'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Manual Refresh */}
                    {!isDemo && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={refetch}
                              disabled={isSyncing || loading}
                              className="shrink-0"
                            >
                              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isRTL ? 'تحديث الآن' : 'Refresh now'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {/* Sound Toggle */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={toggleSound}
                            className="shrink-0"
                          >
                            {soundEnabled ? (
                              <Volume2 className="w-5 h-5 text-primary" />
                            ) : (
                              <VolumeX className="w-5 h-5 text-muted-foreground" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {soundEnabled 
                            ? (isRTL ? 'إيقاف الإشعارات الصوتية' : 'Mute notifications')
                            : (isRTL ? 'تشغيل الإشعارات الصوتية' : 'Enable sound notifications')
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <OrderStatusTimeline currentStatus={displayOrder.status} />
              </CardContent>
            </Card>

            {/* Live Map (only show when out for delivery) */}
            {(displayOrder.status === 'out_for_delivery' || isDemo) && displayLocation && (
              <Card>
                <CardContent className="p-6">
                  <LiveTrackingMap
                    driverLocation={displayLocation}
                    deliveryAddress={displayOrder.delivery_address}
                    driverName={isRTL ? 'محمد السائق' : 'Mohammed Driver'}
                    driverPhone="+971501234567"
                    estimatedArrival={displayOrder.estimated_arrival || undefined}
                    isDemo={isDemo}
                    isLocationLive={isDemo || isLocationLive}
                  />
                </CardContent>
              </Card>
            )}

            {/* Order Details */}
            <OrderDetails order={displayOrder} />

            {/* Share & Contact Options */}
            <Card>
              <CardContent className="p-6">
                {/* Share Tracking Link */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-bold text-lg mb-3">
                    {isRTL ? 'شارك رابط التتبع' : 'Share Tracking Link'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isRTL 
                      ? 'شارك رابط التتبع مع العائلة أو الأصدقاء ليتابعوا حالة الطلب'
                      : 'Share the tracking link with family or friends to follow the order status'}
                  </p>
                  <Button 
                    variant="default" 
                    className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20BD5A] text-white"
                    onClick={() => {
                      const shareNumber = displayOrder.iiko_order_number?.replace('#', '') || displayOrder.order_number;
                      const displayNum = displayOrder.iiko_order_number || displayOrder.order_number;
                      const trackingUrl = `${window.location.origin}/track/${shareNumber}`;
                      const message = isRTL 
                        ? `🍖 تتبع طلبي من ملحمة السرايا!\n\nرقم الطلب: ${displayNum}\n\n📍 تابع موقع السائق مباشرة:\n${trackingUrl}`
                        : `🍖 Track my order from Al Saraya Butchery!\n\nOrder: ${displayNum}\n\n📍 Follow the driver location live:\n${trackingUrl}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                  >
                    <Share2 className="w-4 h-4 me-2" />
                    {isRTL ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
                  </Button>
                </div>

                {/* Need Help Section */}
                <h3 className="font-bold text-lg mb-4">
                  {isRTL ? 'تحتاج مساعدة؟' : 'Need Help?'}
                </h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button variant="outline" asChild>
                    <a href="tel:+971566808565">
                      <Phone className="w-4 h-4 me-2" />
                      {isRTL ? 'اتصل بنا' : 'Call Us'}
                    </a>
                  </Button>
                  <Button variant="default" asChild>
                    <a 
                      href={`https://wa.me/971566808565?text=${encodeURIComponent(
                        isRTL 
                          ? `مرحباً، أحتاج مساعدة بخصوص الطلب رقم: ${displayOrder.iiko_order_number || displayOrder.order_number}`
                          : `Hi, I need help with order: ${displayOrder.iiko_order_number || displayOrder.order_number}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 me-2" />
                      {isRTL ? 'واتساب' : 'WhatsApp'}
                    </a>
                  </Button>
                </div>

                {/* Feedback & Complaints */}
                <Separator className="my-4" />
                <h3 className="font-bold text-lg mb-2">
                  {isRTL ? 'ملاحظاتك تهمنا' : 'Your Feedback Matters'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL 
                    ? 'شاركنا رأيك أو أي ملاحظة لتحسين خدمتنا'
                    : 'Share your feedback or suggestions to help us improve'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="h-auto py-3 justify-start"
                    onClick={() => logFeedback('rating')}
                    asChild
                  >
                    <a
                      href={`https://wa.me/971566808565?text=${encodeURIComponent(
                        isRTL
                          ? `⭐ تقييم الطلب رقم: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nمرحباً، أود تقييم طلبي:\n\n✅ الجودة: \n✅ التوصيل: \n✅ التغليف: \n\nملاحظات إضافية: `
                          : `⭐ Order Feedback: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nHi, I'd like to rate my order:\n\n✅ Quality: \n✅ Delivery: \n✅ Packaging: \n\nAdditional notes: `
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Star className="w-4 h-4 me-2 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm">{isRTL ? 'تقييم الطلب' : 'Rate Order'}</span>
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 justify-start"
                    onClick={() => logFeedback('suggestion')}
                    asChild
                  >
                    <a
                      href={`https://wa.me/971566808565?text=${encodeURIComponent(
                        isRTL
                          ? `💡 اقتراح تحسين - طلب رقم: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nمرحباً، لديّ اقتراح لتحسين الخدمة:\n\n`
                          : `💡 Improvement Suggestion - Order: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nHi, I have a suggestion to improve the service:\n\n`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ThumbsUp className="w-4 h-4 me-2 flex-shrink-0" />
                      <span className="text-sm">{isRTL ? 'اقتراح تحسين' : 'Suggestion'}</span>
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 justify-start border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => logFeedback('complaint')}
                    asChild
                  >
                    <a
                      href={`https://wa.me/971566808565?text=${encodeURIComponent(
                        isRTL
                          ? `⚠️ شكوى بخصوص الطلب رقم: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nمرحباً، أود تقديم شكوى بخصوص:\n\nالمشكلة: \nالتفاصيل: `
                          : `⚠️ Complaint about Order: ${displayOrder.iiko_order_number || displayOrder.order_number}\n\nHi, I'd like to file a complaint about:\n\nIssue: \nDetails: `
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <AlertTriangle className="w-4 h-4 me-2 flex-shrink-0" />
                      <span className="text-sm">{isRTL ? 'تقديم شكوى' : 'File Complaint'}</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Back to home */}
            <div className="text-center">
              <Button variant="ghost" asChild>
                <Link to="/">
                  {isRTL ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
                  {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TrackOrderPage;
