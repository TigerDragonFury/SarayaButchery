import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ORDER_STATUS_CONFIG, OrderStatus } from '@/types/order';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import {
  Eye, Phone, MapPin, Clock, ChevronDown, ChevronUp,
  Store, Truck, Calendar, CheckCircle2, XCircle, AlertCircle, RotateCw, Printer,
  Ban, Trash2
} from 'lucide-react';
import { printOrder } from '@/lib/order-print';

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

interface MobileOrderCardProps {
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

const MobileOrderCard = ({
  order, isExpanded, orderItems, onToggleExpand, onUpdateStatus, onViewDetails, onQuickPrint, onCancelOrder, onDeleteOrder, formatDate
}: MobileOrderCardProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const currency = isRTL ? 'د.إ' : 'AED';

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
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Card Header - clickable */}
      <div className="p-3 space-y-2" onClick={() => onToggleExpand(order.id)}>
        {/* Row 1: Order number + total */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            {order.iiko_order_number ? (
              <>
                <span className="font-mono font-bold text-primary text-sm">#{order.iiko_order_number}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{order.order_number}</span>
              </>
            ) : (
              <span className="font-mono font-bold text-sm">#{order.order_number}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <IikoStatus />
            <span className="font-bold text-sm">{order.total} {currency}</span>
          </div>
        </div>

        {/* Row 2: Customer + type badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm truncate">{order.customer_name}</span>
            {order.order_type === 'pickup' ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-orange-50 text-orange-600 border-orange-200 shrink-0">
                <Store className="w-2.5 h-2.5 me-0.5" />
                {isRTL ? 'استلام' : 'Pickup'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200 shrink-0">
                <Truck className="w-2.5 h-2.5 me-0.5" />
                {isRTL ? 'توصيل' : 'Delivery'}
              </Badge>
            )}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
        </div>

        {/* Row 3: Status + date */}
        <div className="flex items-center justify-between">
          <Select
            value={order.status}
            onValueChange={(v) => onUpdateStatus(order.id, v as OrderStatus)}
          >
            <SelectTrigger className="w-auto h-7 text-xs gap-1 px-2" onClick={(e) => e.stopPropagation()}>
              {getStatusBadge(order.status)}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {isRTL ? config.label : config.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDate(order.created_at)}
          </div>
        </div>

        {/* Scheduled badge */}
        {order.scheduled_date && (
          <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 rounded-md px-2 py-1 w-fit">
            <Calendar className="w-3 h-3" />
            {order.scheduled_date} {order.scheduled_time_slot && `• ${order.scheduled_time_slot}`}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-3 space-y-3">
          {/* Delivery Info */}
          <div>
            <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">
              {order.order_type === 'pickup'
                ? (isRTL ? 'معلومات الاستلام' : 'Pickup Info')
                : (isRTL ? 'معلومات التوصيل' : 'Delivery Info')
              }
            </h4>
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm">
                  {order.order_type === 'pickup'
                    ? (order.branch_name || (isRTL ? 'الفرع الرئيسي' : 'Main Branch'))
                    : order.delivery_address
                  }
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                <a href={`tel:${order.customer_phone}`} className="text-sm text-primary">{order.customer_phone}</a>
              </p>
              {order.delivery_notes && (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded">📝 {order.delivery_notes}</p>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wider">
              {isRTL ? 'المنتجات' : 'Products'}
            </h4>
            {orderItems ? (
              <div className="space-y-1.5">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-2 bg-background rounded-lg text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} × {item.price_per_unit} {currency}
                      </p>
                      {item.notes && <p className="text-xs text-primary mt-0.5">{item.notes}</p>}
                      {item.voice_note_path && (
                        <VoiceNotePlayer storagePath={item.voice_note_path} duration={item.voice_note_duration || 0} size="sm" />
                      )}
                    </div>
                    <span className="font-bold text-sm shrink-0 ms-2">{item.subtotal} {currency}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Skeleton className="h-16 w-full rounded-lg" />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onQuickPrint(order)}
            >
              <Printer className="w-3.5 h-3.5 me-1.5" />
              {isRTL ? 'طباعة' : 'Print'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails(order)}
            >
              <Eye className="w-3.5 h-3.5 me-1.5" />
              {isRTL ? 'التفاصيل' : 'Details'}
            </Button>
            {order.status !== 'cancelled' && order.status !== 'delivered' && onCancelOrder && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
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
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => onDeleteOrder(order)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOrderCard;
