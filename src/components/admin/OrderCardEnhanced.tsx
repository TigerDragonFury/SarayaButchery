import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ORDER_STATUS_CONFIG, ORDER_STATUS_FLOW, OrderStatus } from '@/types/order';
import {
  Eye, Phone, MapPin, Clock, ChevronDown, ChevronUp,
  Store, Truck, Calendar, CheckCircle2, XCircle, AlertCircle, RotateCw, Printer,
  Ban, Trash2, Share2, Image, ArrowLeft, ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import { shareInvoiceImage } from '@/lib/invoice-image';
import { useStoreSettings } from '@/hooks/useStoreSettings';

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
}

interface OrderCardEnhancedProps {
  order: Order;
  isExpanded: boolean;
  orderItems?: OrderItem[];
  onToggleExpand: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
  onQuickPrint: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
  onDeleteOrder?: (order: Order) => void;
  formatDate: (date: string) => string;
}

// Helper function to calculate delay in minutes
const getDelayMinutes = (createdAt: string): number => {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 60000);
};

// Helper function to get delay color and label
const getDelayIndicator = (delayMinutes: number, isRTL: boolean) => {
  if (delayMinutes < 5) {
    return {
      color: 'bg-green-500/20 text-green-600 border-green-300/50',
      bgClass: 'bg-green-500',
      label: isRTL ? 'في الوقت' : 'On Time'
    };
  } else if (delayMinutes < 10) {
    return {
      color: 'bg-yellow-500/20 text-yellow-600 border-yellow-300/50',
      bgClass: 'bg-yellow-500',
      label: isRTL ? 'متأخر قليلاً' : 'Slightly Late'
    };
  } else {
    return {
      color: 'bg-red-500/20 text-red-600 border-red-300/50',
      bgClass: 'bg-red-500',
      label: isRTL ? 'متأخر' : 'Late'
    };
  }
};

const OrderCardEnhanced = ({
  order, isExpanded, orderItems, onToggleExpand, onUpdateStatus, onViewDetails, onQuickPrint, onCancelOrder, onDeleteOrder, formatDate
}: OrderCardEnhancedProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { settings: storeSettings } = useStoreSettings();
  const isRTL = language === 'ar';
  const currency = isRTL ? 'د.إ' : 'AED';
  const [isSharing, setIsSharing] = useState(false);
  const delayMinutes = getDelayMinutes(order.created_at);
  const delayIndicator = getDelayIndicator(delayMinutes, isRTL);

  const getStatusBadge = (status: OrderStatus) => {
    const config = ORDER_STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={config?.color || ''}>
        {isRTL ? config?.label : config?.labelEn}
      </Badge>
    );
  };

  const IikoStatus = () => {
    if (order.status === 'pending') return null;
    if (order.iiko_synced) return <CheckCircle2 className="w-4 h-4 text-primary" />;
    if (order.iiko_sync_error) return <XCircle className="w-4 h-4 text-destructive" />;
    if (order.iiko_sync_attempts && order.iiko_sync_attempts > 0) return <RotateCw className="w-4 h-4 text-amber-500" />;
    return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  return (
    <Card className={`overflow-hidden border transition-all ${delayIndicator.bgClass}/10 border-l-4 border-l-${delayIndicator.bgClass}`}>
      {/* Card Header - clickable */}
      <div className="p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => onToggleExpand(order.id)}>
        {/* Row 1: Order number + total + delay indicator */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            {order.iiko_order_number ? (
              <>
                <span className="font-mono font-bold text-primary text-sm">#{order.iiko_order_number}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{order.order_number}</span>
              </>
            ) : (
              <span className="font-mono font-bold text-sm">#{order.order_number}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-bold text-sm">{order.total} {currency}</span>
            <Badge variant="outline" className={`text-[10px] ${delayIndicator.color} border`}>
              {delayMinutes} {isRTL ? 'دقيقة' : 'min'}
            </Badge>
          </div>
        </div>

        {/* Row 2: Customer + order type */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm truncate">{order.customer_name}</span>
            {order.order_type === 'pickup' ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-orange-500/10 text-orange-600 border-orange-300/50 shrink-0">
                <Store className="w-2.5 h-2.5 me-0.5" />
                {isRTL ? 'استلام' : 'Pickup'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 border-blue-300/50 shrink-0">
                <Truck className="w-2.5 h-2.5 me-0.5" />
                {isRTL ? 'توصيل' : 'Delivery'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <IikoStatus />
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Row 3: Status + time */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            {getStatusBadge(order.status)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(order.created_at), {
              locale: isRTL ? ar : enUS,
              addSuffix: false,
            })}
          </div>
        </div>

        {/* Scheduled badge if applicable */}
        {order.scheduled_date && (
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 rounded-md px-2.5 py-1.5 w-fit">
            <Calendar className="w-3 h-3" />
            {order.scheduled_date} {order.scheduled_time_slot && `• ${order.scheduled_time_slot}`}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20 p-4 space-y-4">
          {/* Delivery/Pickup Info */}
          <div>
            <h4 className="text-xs font-semibold mb-2.5 text-muted-foreground uppercase tracking-wider">
              {order.order_type === 'pickup'
                ? (isRTL ? 'معلومات الاستلام' : 'Pickup Info')
                : (isRTL ? 'معلومات التوصيل' : 'Delivery Info')
              }
            </h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                <span>
                  {order.order_type === 'pickup'
                    ? (order.branch_name || (isRTL ? 'الفرع الرئيسي' : 'Main Branch'))
                    : order.delivery_address
                  }
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">{order.customer_phone}</a>
              </p>
              {order.delivery_notes && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded border border-border/50">📝 {order.delivery_notes}</p>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold mb-2.5 text-muted-foreground uppercase tracking-wider">
              {isRTL ? 'المنتجات' : 'Products'}
            </h4>
            {orderItems ? (
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-2.5 bg-card rounded-lg text-sm border border-border/30">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} × {item.price_per_unit} {currency}
                      </p>
                      {item.notes && <p className="text-xs text-primary mt-1">{item.notes}</p>}
                      {item.voice_note_path && (
                        <VoiceNotePlayer storagePath={item.voice_note_path} duration={item.voice_note_duration || 0} size="sm" />
                      )}
                    </div>
                    <span className="font-bold text-sm shrink-0 ms-2">{item.subtotal} {currency}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
              </div>
            )}
          </div>

          {/* Next Status Button */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (() => {
            const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
            const nextStatus = currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1
              ? ORDER_STATUS_FLOW[currentIndex + 1]
              : null;
            if (!nextStatus) return null;
            const nextConfig = ORDER_STATUS_CONFIG[nextStatus];
            return (
              <Button
                size="lg"
                className="w-full mb-2 font-bold text-sm"
                onClick={() => onUpdateStatus(order.id, nextStatus)}
              >
                {isRTL ? (
                  <>
                    <ArrowLeft className="w-4 h-4 me-2" />
                    {nextConfig.label}
                  </>
                ) : (
                  <>
                    {nextConfig.labelEn}
                    <ArrowRight className="w-4 h-4 ms-2" />
                  </>
                )}
              </Button>
            );
          })()}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px]"
              onClick={() => onQuickPrint(order)}
            >
              <Printer className="w-3.5 h-3.5 me-1.5" />
              {isRTL ? 'طباعة' : 'Print'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px]"
              onClick={() => onViewDetails(order)}
            >
              <Eye className="w-3.5 h-3.5 me-1.5" />
              {isRTL ? 'التفاصيل' : 'Details'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px]"
              disabled={isSharing}
              onClick={async (e) => {
                e.stopPropagation();
                setIsSharing(true);
                try {
                  const items = orderItems || [];
                  const c = storeSettings.contact;
                  const orderWithBiz = { ...order, vat_number: c?.vat_number, license_number: c?.license_number, adcci_number: c?.adcci_number, company_name_en: c?.company_name_en, company_name_ar: c?.company_name_ar };
                  const success = await shareInvoiceImage(orderWithBiz, items, { isRTL, currency });
                  if (success) {
                    toast({
                      title: isRTL ? '✓ تم' : '✓ Done',
                      description: isRTL ? 'تم إنشاء صورة الفاتورة' : 'Invoice image generated',
                    });
                  }
                } catch (err) {
                  console.error('Share error:', err);
                } finally {
                  setIsSharing(false);
                }
              }}
            >
              {isSharing ? (
                <RotateCw className="w-3.5 h-3.5 me-1.5 animate-spin" />
              ) : (
                <Image className="w-3.5 h-3.5 me-1.5" />
              )}
              {isRTL ? 'مشاركة صورة' : 'Share Image'}
            </Button>
            {order.status !== 'cancelled' && order.status !== 'delivered' && onCancelOrder && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-[100px] text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => onCancelOrder(order.id)}
              >
                <Ban className="w-3.5 h-3.5 me-1.5" />
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
            {onDeleteOrder && (
              <Button
                variant="outline"
                size="sm"
                className="min-w-[40px] text-destructive border-destructive/30 hover:bg-destructive/10 px-2"
                onClick={() => onDeleteOrder(order)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default OrderCardEnhanced;
