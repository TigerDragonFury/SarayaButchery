import { Package, Receipt, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderDetailsProps {
  order: Order;
  className?: string;
}

export const OrderDetails = ({ order, className }: OrderDetailsProps) => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Order Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
            </CardTitle>
            <div className="text-end">
              {/* Show iiko order number prominently if available */}
              {'iiko_order_number' in order && (order as any).iiko_order_number ? (
                <>
                  <span className="font-mono text-lg font-bold text-primary block">
                    {(order as any).iiko_order_number}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {order.order_number}
                  </span>
                </>
              ) : (
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {order.order_number}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{isRTL ? 'تاريخ الطلب' : 'Order Date'}</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            {order.estimated_arrival && (
              <div>
                <p className="text-muted-foreground">{isRTL ? 'الوصول المتوقع' : 'Expected Arrival'}</p>
                <p className="font-medium">{formatDate(order.estimated_arrival)}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Delivery Address */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{isRTL ? 'عنوان التوصيل' : 'Delivery Address'}</p>
              <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
              <p className="text-sm text-muted-foreground">{order.delivery_city}</p>
              {order.delivery_notes && (
                <p className="text-sm text-muted-foreground italic mt-1">
                  {isRTL ? 'ملاحظات: ' : 'Notes: '}{order.delivery_notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isRTL ? 'المنتجات' : 'Items'} ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start justify-between py-2">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  {item.productNameEn && language === 'en' && (
                    <p className="text-sm text-muted-foreground">{item.productNameEn}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit === 'kg' ? (isRTL ? 'كجم' : 'kg') : 
                      item.unit === 'box' ? (isRTL ? 'بوكس' : 'box') : 
                      (isRTL ? 'قطعة' : 'pc')}
                    {' × '}
                    {item.pricePerUnit} {isRTL ? 'د.إ' : 'AED'}
                  </p>
                  {item.customerNotes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      📝 {item.customerNotes}
                    </p>
                  )}
                </div>
                <p className="font-semibold">
                  {item.totalPrice} {isRTL ? 'د.إ' : 'AED'}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{order.subtotal} {isRTL ? 'د.إ' : 'AED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
              <span>
                {order.delivery_fee === 0 ? (isRTL ? 'مجاني' : 'FREE') : 
                  `${order.delivery_fee} ${isRTL ? 'د.إ' : 'AED'}`}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{isRTL ? 'الخصم' : 'Discount'}</span>
                <span>-{order.discount} {isRTL ? 'د.إ' : 'AED'}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="text-primary">{order.total} {isRTL ? 'د.إ' : 'AED'}</span>
            </div>
            {order.total_weight > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{isRTL ? 'الوزن الإجمالي' : 'Total Weight'}</span>
                <span>{order.total_weight} {isRTL ? 'كجم' : 'kg'}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* iiko Status (for demo/admin view) */}
      {order.iiko_order_id && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="text-muted-foreground">
                {isRTL ? 'رقم الطلب في iiko:' : 'iiko Order ID:'}
              </span>
              <span className="font-mono">{order.iiko_order_id}</span>
              {order.iiko_synced && (
                <span className="text-green-600 text-xs">✓ {isRTL ? 'متزامن' : 'Synced'}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
