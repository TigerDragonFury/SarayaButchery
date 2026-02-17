import { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Play,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Package
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order, ORDER_STATUS_CONFIG } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

interface DriverOrderCardProps {
  order: Order;
  onStartDelivery: () => void;
  onMarkDelivered: () => void;
  onNavigate: () => void;
  isTracking?: boolean;
}

const DriverOrderCard = ({ 
  order, 
  onStartDelivery, 
  onMarkDelivered, 
  onNavigate,
  isTracking = false
}: DriverOrderCardProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  const triggerHaptic = async (type: 'light' | 'success') => {
    if (Capacitor.isNativePlatform()) {
      try {
        if (type === 'success') {
          await Haptics.notification({ type: NotificationType.Success });
        } else {
          await Haptics.impact({ style: ImpactStyle.Light });
        }
      } catch (e) {
        // Haptics not available
      }
    }
  };

  const handleStartDelivery = async () => {
    await triggerHaptic('success');
    onStartDelivery();
  };

  const handleMarkDelivered = async () => {
    await triggerHaptic('success');
    onMarkDelivered();
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      {/* Order Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer active:bg-muted/50 transition-colors"
        onClick={() => {
          triggerHaptic('light');
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold truncate">
                {order.order_number}
              </span>
              <Badge className={cn("shrink-0 text-xs", statusConfig.color)}>
                {isRTL ? statusConfig.label : statusConfig.labelEn}
              </Badge>
            </div>
            <p className="font-semibold text-lg truncate">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {order.delivery_city}
            </p>
          </div>
          
          {/* Driver sees item count only - NO PRICES for security */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-5 h-5" />
              <span className="text-lg font-bold">
                {order.items.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'منتجات' : 'items'}
            </p>
            <Button variant="ghost" size="sm" className="mt-1 p-1 h-auto">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2">
          {/* Customer Contact */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 h-14 text-base"
              asChild
            >
              <a href={`tel:${order.customer_phone}`}>
                <Phone className="w-5 h-5 me-2" />
                {isRTL ? 'اتصال' : 'Call'}
              </a>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-14 text-base"
              asChild
            >
              <a href={`https://wa.me/${order.customer_phone.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 me-2" />
                {isRTL ? 'واتساب' : 'WhatsApp'}
              </a>
            </Button>
          </div>

          {/* Full Address */}
          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium mb-1">{isRTL ? 'عنوان التوصيل' : 'Delivery Address'}</p>
            <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
            {order.delivery_notes && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-start gap-1">
                <span className="shrink-0">⚠️</span>
                {order.delivery_notes}
              </p>
            )}
          </div>

          {/* Order Items - Quantities only, NO PRICES */}
          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              {isRTL ? 'المنتجات' : 'Items'}
            </p>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="flex-1">{isRTL ? item.productName : (item.productNameEn || item.productName)}</span>
                  <span className="text-muted-foreground font-mono shrink-0">
                    {item.quantity} {item.unit === 'kg' ? (isRTL ? 'كجم' : 'kg') : (isRTL ? 'قطعة' : 'pc')}
                  </span>
                </div>
              ))}
            </div>
            {/* Weight summary instead of price */}
            {order.total_weight && order.total_weight > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-sm font-medium">
                <span>{isRTL ? 'الوزن الإجمالي' : 'Total Weight'}</span>
                <span>{order.total_weight} {isRTL ? 'كجم' : 'kg'}</span>
              </div>
            )}
          </div>

          {/* Navigation Button */}
          <Button 
            variant="secondary" 
            className="w-full h-14 text-base"
            onClick={onNavigate}
          >
            <Navigation className="w-5 h-5 me-2" />
            {isRTL ? 'فتح في الخرائط' : 'Open in Maps'}
          </Button>
        </div>
      )}

      {/* Action Buttons - Always Visible */}
      <div className="p-4 bg-muted/30 border-t border-border">
        {order.status === 'ready' && (
          <Button 
            className="w-full h-16 text-lg font-bold"
            onClick={handleStartDelivery}
          >
            <Play className="w-6 h-6 me-3" />
            {isRTL ? 'بدء التوصيل' : 'Start Delivery'}
          </Button>
        )}

        {order.status === 'out_for_delivery' && (
          <div className="space-y-3">
            {isTracking && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                {isRTL ? 'يتم مشاركة موقعك' : 'Sharing location'}
              </div>
            )}
            <Button 
              className="w-full h-16 text-lg font-bold bg-green-600 hover:bg-green-700"
              onClick={handleMarkDelivered}
            >
              <CheckCircle2 className="w-6 h-6 me-3" />
              {isRTL ? 'تم التوصيل' : 'Mark Delivered'}
            </Button>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <p className="font-bold text-green-600">
              {isRTL ? 'تم التوصيل بنجاح!' : 'Delivered Successfully!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOrderCard;
