// Shared order print utility – optimised for 80mm thermal receipt printers

interface OrderPrintData {
  order_number: string;
  iiko_order_number?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_address: string;
  delivery_city?: string | null;
  delivery_notes?: string | null;
  status: string;
  subtotal: number;
  delivery_fee?: number | null;
  discount?: number | null;
  total: number;
  created_at: string;
  order_type?: string | null;
  scheduled_date?: string | null;
  scheduled_time_slot?: string | null;
  branch_name?: string | null;
}

interface OrderPrintItem {
  product_name: string;
  product_name_en?: string | null;
  quantity: number;
  unit: string;
  price_per_unit: number;
  subtotal: number;
  notes?: string | null;
}

interface PrintOptions {
  isRTL: boolean;
  currency: string;
  statusLabel: string;
  formatDate: (date: string) => string;
}

export const generateOrderPrintHTML = (
  order: OrderPrintData,
  items: OrderPrintItem[],
  options: PrintOptions
): string => {
  const { isRTL, currency, statusLabel, formatDate } = options;
  const dir = isRTL ? 'rtl' : 'ltr';
  const alignEnd = isRTL ? 'left' : 'right';
  const orderNum = order.iiko_order_number || order.order_number;

  const orderTypeLabel = order.order_type === 'pickup'
    ? (isRTL ? 'استلام' : 'Pickup')
    : (isRTL ? 'توصيل' : 'Delivery');

  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding:3px 0;font-size:12px;border-bottom:1px dashed #ccc;">${item.product_name}${item.notes ? `<br><span style="font-size:10px;color:#555;">📝 ${item.notes}</span>` : ''}</td>
      <td style="padding:3px 4px;font-size:12px;text-align:center;border-bottom:1px dashed #ccc;direction:ltr;white-space:nowrap;">${item.quantity} ${item.unit}</td>
      <td style="padding:3px 0;font-size:12px;text-align:${alignEnd};border-bottom:1px dashed #ccc;font-weight:700;white-space:nowrap;">${item.subtotal} ${currency}</td>
    </tr>
  `).join('');

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

  <!-- Header -->
  <div class="center" style="padding-bottom:6px;">
    <div style="font-size:16px;font-weight:800;">${isRTL ? 'ملحمة السرايا' : 'Al Saraya Butchery'}</div>
    <div style="font-size:10px;color:#555;">📞 +971 56 680 8565</div>
  </div>
  <div class="sep-double"></div>

  <!-- Order Info -->
  <div style="padding:4px 0;">
    <div class="row"><span class="bold">${isRTL ? 'فاتورة رقم' : 'Invoice #'}</span><span class="bold">${orderNum}</span></div>
    <div class="row"><span>${isRTL ? 'التاريخ' : 'Date'}</span><span>${formatDate(order.created_at)}</span></div>
    <div class="row"><span>${isRTL ? 'الحالة' : 'Status'}</span><span>${statusLabel}</span></div>
    <div class="row"><span>${isRTL ? 'النوع' : 'Type'}</span><span>${orderTypeLabel}</span></div>
    ${order.scheduled_date ? `<div class="row"><span>${isRTL ? 'موعد' : 'Scheduled'}</span><span>${order.scheduled_date}${order.scheduled_time_slot ? ` ${order.scheduled_time_slot}` : ''}</span></div>` : ''}
  </div>
  <div class="sep"></div>

  <!-- Customer -->
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

  <!-- Items -->
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

  <!-- Totals -->
  <div>
    <div class="row"><span>${isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span><span>${order.subtotal} ${currency}</span></div>
    ${order.delivery_fee && order.delivery_fee > 0 ? `<div class="row"><span>${isRTL ? 'التوصيل' : 'Delivery'}</span><span>${order.delivery_fee} ${currency}</span></div>` : ''}
    ${order.discount && order.discount > 0 ? `<div class="row"><span>${isRTL ? 'خصم' : 'Discount'}</span><span>-${order.discount} ${currency}</span></div>` : ''}
    <div class="sep"></div>
    <div class="row total-row"><span>${isRTL ? 'الإجمالي' : 'TOTAL'}</span><span>${order.total} ${currency}</span></div>
  </div>
  <div class="sep-double"></div>

  <!-- QR Code -->
  <div class="center" style="padding:6px 0;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : 'https://alsarayabutcheryllc.com'}/track?order=${orderNum}`)}&color=000000" style="width:80px;height:80px;" />
    <div style="font-size:9px;color:#555;margin-top:3px;">${isRTL ? 'امسح لتتبع الطلب' : 'Scan to track order'}</div>
  </div>
  <div class="sep"></div>

  <!-- Weight Policy -->
  <div style="padding:4px 0;font-size:9px;color:#333;text-align:center;border:1px dashed #999;border-radius:4px;margin-bottom:6px;">
    ${isRTL 
      ? '⚖️ ملاحظة: الوزن قبل التنظيف وقد ينخفض بعد التجهيز بنسبة طبيعية من 5% إلى 20%.'
      : '⚖️ Note: Weight is before cleaning and may decrease after preparation by 5% to 20%.'}
  </div>

  <!-- Footer -->
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

export const printOrder = (
  order: OrderPrintData,
  items: OrderPrintItem[],
  options: PrintOptions
): boolean => {
  const html = generateOrderPrintHTML(order, items, options);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 400);
  return true;
};
