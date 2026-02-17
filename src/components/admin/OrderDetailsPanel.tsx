import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';
import { Store, Truck, Calendar, MapPin, Phone, Copy, Check, Printer, Download, MessageCircle, MessageSquare, Send } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ORDER_STATUS_CONFIG, OrderStatus } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import {
  generateOrderConfirmationTemplate,
  generatePreparingTemplate,
  generateOrderReadyTemplate,
  generateDeliveryTemplate,
  generateDeliveryConfirmationTemplate,
  sendTemplateMessage,
} from '@/lib/whatsapp-order';

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

interface OrderDetailsPanelProps {
  order: Order | null;
  orderItems?: OrderItem[];
  formatDate: (date: string) => string;
}

export const OrderDetailsPanel = ({ order, orderItems, formatDate }: OrderDetailsPanelProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const currency = isRTL ? 'د.إ' : 'AED';
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (!order) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const config = ORDER_STATUS_CONFIG[order.status];

  const generatePrintHTML = () => {
    const statusLabel = isRTL ? config?.label : config?.labelEn;
    const dir = isRTL ? 'rtl' : 'ltr';
    const alignEnd = isRTL ? 'left' : 'right';
    const orderNum = order.iiko_order_number || order.order_number;
    const orderTypeLabel = order.order_type === 'pickup'
      ? (isRTL ? 'استلام' : 'Pickup')
      : (isRTL ? 'توصيل' : 'Delivery');

    const itemsHTML = orderItems?.map(item => `
      <tr>
        <td style="padding:3px 0;font-size:12px;border-bottom:1px dashed #ccc;">${item.product_name}${item.notes ? `<br><span style="font-size:10px;color:#555;">📝 ${item.notes}</span>` : ''}</td>
        <td style="padding:3px 4px;font-size:12px;text-align:center;border-bottom:1px dashed #ccc;direction:ltr;white-space:nowrap;">${item.quantity} ${item.unit}</td>
        <td style="padding:3px 0;font-size:12px;text-align:${alignEnd};border-bottom:1px dashed #ccc;font-weight:700;white-space:nowrap;">${item.subtotal} ${currency}</td>
      </tr>
    `).join('') || '';

    return `<!DOCTYPE html>
<html dir="${dir}" lang="${isRTL ? 'ar' : 'en'}">
<head>
<meta charset="UTF-8">
<title>#${orderNum}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width: 72mm;
    max-width: 72mm;
    margin: 0 auto;
    padding: 4mm 0;
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    font-size: 12px;
    color: #000;
    direction: ${dir};
    -webkit-print-color-adjust: exact;
  }
  .receipt { page-break-inside: avoid; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .sep { border-top: 1px dashed #000; margin: 6px 0; }
  .sep-double { border-top: 2px solid #000; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  .row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 12px; }
  .total-row { font-size: 16px; font-weight: 900; padding: 4px 0; }
  @media print {
    html, body { width: 72mm; max-width: 72mm; }
    .no-print { display: none !important; }
  }
  @media screen {
    body { border: 1px solid #ccc; padding: 10px; margin: 20px auto; }
  }
</style>
</head>
<body>
<div class="receipt">
  <div class="center" style="padding-bottom:6px;">
    <div style="font-size:16px;font-weight:800;">${isRTL ? 'ملحمة السرايا' : 'Al Saraya Butchery'}</div>
    <div style="font-size:10px;color:#555;">📞 +971 56 680 8565</div>
  </div>
  <div class="sep-double"></div>
  <div style="padding:4px 0;">
    <div class="row"><span class="bold">${isRTL ? 'فاتورة رقم' : 'Invoice #'}</span><span class="bold">${orderNum}</span></div>
    <div class="row"><span>${isRTL ? 'التاريخ' : 'Date'}</span><span>${formatDate(order.created_at)}</span></div>
    <div class="row"><span>${isRTL ? 'الحالة' : 'Status'}</span><span>${statusLabel}</span></div>
    <div class="row"><span>${isRTL ? 'النوع' : 'Type'}</span><span>${orderTypeLabel}</span></div>
    ${order.scheduled_date ? `<div class="row"><span>${isRTL ? 'موعد' : 'Scheduled'}</span><span>${order.scheduled_date}${order.scheduled_time_slot ? ` ${order.scheduled_time_slot}` : ''}</span></div>` : ''}
  </div>
  <div class="sep"></div>
  <div style="padding:4px 0;">
    <div class="row"><span class="bold">${isRTL ? 'العميل' : 'Customer'}</span><span>${order.customer_name}</span></div>
    <div class="row"><span>${isRTL ? 'الهاتف' : 'Phone'}</span><span style="direction:ltr;">${order.customer_phone}</span></div>
    ${order.order_type === 'pickup'
      ? `<div class="row"><span>${isRTL ? 'الفرع' : 'Branch'}</span><span>${order.branch_name || (isRTL ? 'الرئيسي' : 'Main')}</span></div>`
      : `<div style="font-size:11px;padding:2px 0;"><span class="bold">${isRTL ? 'العنوان:' : 'Address:'}</span> ${order.delivery_address}</div>`
    }
    ${order.delivery_notes ? `<div style="font-size:11px;padding:2px 0;"><span class="bold">${isRTL ? 'ملاحظات:' : 'Notes:'}</span> ${order.delivery_notes}</div>` : ''}
  </div>
  <div class="sep-double"></div>
  <table>
    <thead>
      <tr style="border-bottom:1px solid #000;">
        <th style="padding:4px 0;font-size:11px;text-align:${isRTL ? 'right' : 'left'};">${isRTL ? 'المنتج' : 'Item'}</th>
        <th style="padding:4px 4px;font-size:11px;text-align:center;">${isRTL ? 'الكمية' : 'Qty'}</th>
        <th style="padding:4px 0;font-size:11px;text-align:${alignEnd};">${isRTL ? 'المبلغ' : 'Amt'}</th>
      </tr>
    </thead>
    <tbody>${itemsHTML}</tbody>
  </table>
  <div class="sep-double"></div>
  <div>
    <div class="row"><span>${isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span><span>${order.subtotal} ${currency}</span></div>
    ${order.delivery_fee && order.delivery_fee > 0 ? `<div class="row"><span>${isRTL ? 'التوصيل' : 'Delivery'}</span><span>${order.delivery_fee} ${currency}</span></div>` : ''}
    ${order.discount && order.discount > 0 ? `<div class="row"><span>${isRTL ? 'خصم' : 'Discount'}</span><span>-${order.discount} ${currency}</span></div>` : ''}
    <div class="sep"></div>
    <div class="row total-row"><span>${isRTL ? 'الإجمالي' : 'TOTAL'}</span><span>${order.total} ${currency}</span></div>
  </div>
  <div class="sep-double"></div>
  <div class="center" style="padding:6px 0;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${window.location.origin}/track?order=${order.iiko_order_number || order.order_number}`)}&color=000000" style="width:80px;height:80px;" />
    <div style="font-size:9px;color:#555;margin-top:3px;">${isRTL ? 'امسح لتتبع الطلب' : 'Scan to track order'}</div>
  </div>
  <div class="sep"></div>
  <div class="center" style="padding:6px 0;font-size:10px;color:#555;">
    ${isRTL ? 'شكراً لتسوقكم من ملحمة السرايا' : 'Thank you for shopping at Al Saraya'}
    <br>${isRTL ? 'ملحمة السرايا الجديدة للحوم ذ.م.م' : 'New Al Saraya Butchery L.L.C.'}
    <br><span style="font-size:9px;">${isRTL ? 'رقم الرخصة' : 'License'}: CN-3659621</span>
    <br><span style="font-size:9px;">${isRTL ? 'عضوية الغرفة' : 'ADCCI'}: 10002085</span>
    <br><span style="font-size:9px;">${isRTL ? 'الرقم الضريبي' : 'TRN'}: 104312751400003</span>
    <br>alsarayabutcheryllc.com
  </div>
</div>
</body>
</html>`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow pop-ups', variant: 'destructive' });
      return;
    }
    printWindow.document.write(generatePrintHTML());
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow pop-ups', variant: 'destructive' });
      return;
    }
    printWindow.document.write(generatePrintHTML());
    printWindow.document.close();
    toast({ title: isRTL ? 'تلميح' : 'Tip', description: isRTL ? 'اختر "حفظ كـ PDF" من خيارات الطابعة' : 'Choose "Save as PDF" from printer options' });
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div className="space-y-6" ref={printRef}>
      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 me-1.5" />
          {isRTL ? 'طباعة' : 'Print'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 me-1.5" />
          {isRTL ? 'تحميل PDF' : 'PDF'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => window.open(`tel:${order.customer_phone}`, '_blank')}
        >
          <Phone className="w-4 h-4 me-1.5" />
          {isRTL ? 'اتصال' : 'Call'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => {
            const phone = order.customer_phone.replace(/[\s-]/g, '').replace(/^0/, '');
            const formattedPhone = phone.startsWith('+') ? phone.slice(1) : (phone.startsWith('971') ? phone : `971${phone}`);
            const msg = isRTL
              ? `مرحباً ${order.customer_name}، بخصوص طلبكم رقم #${order.iiko_order_number || order.order_number} من ملحمة السرايا.`
              : `Hello ${order.customer_name}, regarding your order #${order.iiko_order_number || order.order_number} from Al Saraya Butchery.`;
            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
          }}
        >
          <MessageCircle className="w-4 h-4 me-1.5" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.open(`sms:${order.customer_phone}`, '_blank');
          }}
        >
          <MessageSquare className="w-4 h-4 me-1.5" />
          SMS
        </Button>
      </div>

      {/* Message Templates */}
      <div className="space-y-2 print:hidden">
        <p className="text-xs font-semibold text-muted-foreground">
          {isRTL ? 'قوالب الرسائل الجاهزة' : 'Message Templates'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-3 justify-start text-left"
            onClick={() => {
              const message = generateOrderConfirmationTemplate({
                customerName: order.customer_name,
                orderNumber: order.iiko_order_number || order.order_number,
                isRTL,
              });
              sendTemplateMessage(order.customer_phone, message);
            }}
          >
            <Send className="w-4 h-4 me-2 flex-shrink-0" />
            <span className="text-xs">{isRTL ? '✅ تأكيد الطلب' : '✅ Order Confirmed'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-3 justify-start text-left"
            onClick={() => {
              const message = generatePreparingTemplate({
                customerName: order.customer_name,
                orderNumber: order.iiko_order_number || order.order_number,
                isRTL,
              });
              sendTemplateMessage(order.customer_phone, message);
            }}
          >
            <Send className="w-4 h-4 me-2 flex-shrink-0" />
            <span className="text-xs">{isRTL ? '👨‍🍳 جاري التحضير' : '👨‍🍳 Preparing'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-3 justify-start text-left"
            onClick={() => {
              const message = generateOrderReadyTemplate({
                customerName: order.customer_name,
                orderNumber: order.iiko_order_number || order.order_number,
                isRTL,
              });
              sendTemplateMessage(order.customer_phone, message);
            }}
          >
            <Send className="w-4 h-4 me-2 flex-shrink-0" />
            <span className="text-xs">{isRTL ? '📦 الطلب جاهز' : '📦 Order Ready'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-3 justify-start text-left"
            onClick={() => {
              const message = generateDeliveryTemplate({
                customerName: order.customer_name,
                orderNumber: order.iiko_order_number || order.order_number,
                deliveryAddress: order.delivery_address,
                isRTL,
              });
              sendTemplateMessage(order.customer_phone, message);
            }}
          >
            <Send className="w-4 h-4 me-2 flex-shrink-0" />
            <span className="text-xs">{isRTL ? '🚚 في الطريق' : '🚚 On the Way'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto py-2 px-3 justify-start text-left"
            onClick={() => {
              const message = generateDeliveryConfirmationTemplate({
                customerName: order.customer_name,
                orderNumber: order.iiko_order_number || order.order_number,
                isRTL,
              });
              sendTemplateMessage(order.customer_phone, message);
            }}
          >
            <Send className="w-4 h-4 me-2 flex-shrink-0" />
            <span className="text-xs">{isRTL ? '✅ تم التوصيل' : '✅ Delivered'}</span>
          </Button>
        </div>
      </div>

      {/* Order Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">
              {isRTL ? 'رقم الطلب:' : 'Order #'} {order.iiko_order_number || order.order_number}
            </h2>
            {order.iiko_order_number && (
              <p className="text-xs text-muted-foreground font-mono mt-1">{order.order_number}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge className={config?.color || ''}>
              {isRTL ? config?.label : config?.labelEn}
            </Badge>
            {order.order_type === 'pickup' ? (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                <Store className="w-3 h-3 me-1" />
                {isRTL ? 'استلام' : 'Pickup'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                <Truck className="w-3 h-3 me-1" />
                {isRTL ? 'توصيل' : 'Delivery'}
              </Badge>
            )}
          </div>
        </div>

        {/* Date and Scheduled Info */}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            📅 {formatDate(order.created_at)}
          </div>
          {order.scheduled_date && (
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg text-primary">
              <Calendar className="w-4 h-4" />
              {isRTL ? 'موعد محجوز:' : 'Scheduled:'} {order.scheduled_date}
              {order.scheduled_time_slot && ` • ${order.scheduled_time_slot}`}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Customer Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base">
          {isRTL ? 'معلومات العميل' : 'Customer Information'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {isRTL ? 'الاسم' : 'Name'}
            </p>
            <p className="font-medium">{order.customer_name}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {isRTL ? 'الهاتف' : 'Phone'}
            </p>
            <div className="flex items-center gap-2">
              <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">
                {order.customer_phone}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(order.customer_phone, 'phone')}
              >
                {copiedField === 'phone' ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          {order.customer_email && (
            <div className="sm:col-span-2 space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </p>
              <div className="flex items-center gap-2">
                <a href={`mailto:${order.customer_email}`} className="font-medium text-primary hover:underline break-all">
                  {order.customer_email}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(order.customer_email || '', 'email')}
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Delivery/Pickup Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base">
          {order.order_type === 'pickup'
            ? (isRTL ? 'معلومات الاستلام' : 'Pickup Information')
            : (isRTL ? 'معلومات التوصيل' : 'Delivery Information')
          }
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
                {order.order_type === 'pickup' ? (isRTL ? 'الفرع' : 'Branch') : (isRTL ? 'العنوان' : 'Address')}
              </p>
              <p className="font-medium">
                {order.order_type === 'pickup'
                  ? (order.branch_name || (isRTL ? 'الفرع الرئيسي' : 'Main Branch'))
                  : order.delivery_address
                }
              </p>
              {order.delivery_city && order.order_type !== 'pickup' && (
                <p className="text-xs text-muted-foreground mt-1">{order.delivery_city}</p>
              )}
            </div>
          </div>
          {order.delivery_notes && (
            <div className="bg-muted p-3 rounded-lg border border-border">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
                📝 {isRTL ? 'ملاحظات التوصيل' : 'Delivery Notes'}
              </p>
              <p className="text-sm">{order.delivery_notes}</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Order Items */}
      <div className="space-y-3">
        <h3 className="font-semibold text-base">
          {isRTL ? 'المنتجات' : 'Items'} ({orderItems?.length || 0})
        </h3>
        {orderItems ? (
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.id} className="border border-border rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product_name}</p>
                    {item.product_name_en && item.product_name_en !== item.product_name && (
                      <p className="text-xs text-muted-foreground">{item.product_name_en}</p>
                    )}
                  </div>
                  <p className="font-bold shrink-0">{item.subtotal} {currency}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.quantity} {item.unit}</span>
                  <span>× {item.price_per_unit} {currency}</span>
                </div>
                {item.notes && (
                  <div className="bg-primary/10 p-2 rounded text-primary text-xs">
                    📝 {item.notes}
                  </div>
                )}
                {item.voice_note_path && (
                  <VoiceNotePlayer
                    storagePath={item.voice_note_path}
                    duration={item.voice_note_duration || 0}
                    size="sm"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Order Summary */}
      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold text-base">{isRTL ? 'الملخص' : 'Summary'}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span>{order.subtotal} {currency}</span>
          </div>
          {order.delivery_fee && order.delivery_fee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
              <span>{order.delivery_fee} {currency}</span>
            </div>
          )}
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{isRTL ? 'الخصم' : 'Discount'}</span>
              <span>-{order.discount} {currency}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-bold">
            <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
            <span className="text-primary">{order.total} {currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
