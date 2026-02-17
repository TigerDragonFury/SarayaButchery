import html2canvas from 'html2canvas';

// ── Types ──────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  subtotal: number;
}

export interface InvoiceOrder {
  order_number: string;
  iiko_order_number?: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_notes?: string | null;
  total: number;
  subtotal: number;
  delivery_fee?: number | null;
  discount?: number | null;
  created_at: string;
  order_type?: string | null;
  status?: string | null;
  payment_status?: 'paid' | 'cod' | string | null;
  vat_number?: string | null;
  license_number?: string | null;
  adcci_number?: string | null;
  company_name_en?: string | null;
  company_name_ar?: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toFixed(2);
}

function statusBadge(status: string | null | undefined, isRTL: boolean): { label: string; bg: string; border: string; color: string } {
  const map: Record<string, { ar: string; en: string; bg: string; border: string; color: string }> = {
    pending:          { ar: 'قيد الانتظار',  en: 'Pending',          bg: '#FEF3C7', border: '#F59E0B', color: '#92400E' },
    confirmed:        { ar: 'مؤكد',          en: 'Confirmed',        bg: '#DBEAFE', border: '#3B82F6', color: '#1E40AF' },
    preparing:        { ar: 'قيد التحضير',   en: 'Preparing',        bg: '#FEF9C3', border: '#EAB308', color: '#854D0E' },
    ready:            { ar: 'جاهز',          en: 'Ready',            bg: '#D1FAE5', border: '#10B981', color: '#065F46' },
    out_for_delivery: { ar: 'جاري التوصيل',  en: 'Out for Delivery', bg: '#EDE9FE', border: '#8B5CF6', color: '#5B21B6' },
    delivered:        { ar: 'تم التوصيل',    en: 'Delivered',        bg: '#D1FAE5', border: '#10B981', color: '#065F46' },
    cancelled:        { ar: 'ملغي',          en: 'Cancelled',        bg: '#FEE2E2', border: '#EF4444', color: '#991B1B' },
  };
  const s = map[status || 'pending'] || map.pending;
  return { label: isRTL ? s.ar : s.en, bg: s.bg, border: s.border, color: s.color };
}

function pill(label: string, bg: string, border: string, color: string): string {
  return `<span style="display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:600;background:${bg};color:${color};border:1px solid ${border};white-space:nowrap;">${label}</span>`;
}

// ── Build HTML ─────────────────────────────────────────────────────────────

function buildInvoiceHTML(
  order: InvoiceOrder,
  items: InvoiceItem[],
  opts: { isRTL: boolean; currency: string; logoDataUrl?: string }
): string {
  const { isRTL, currency, logoDataUrl } = opts;
  const dir = isRTL ? 'rtl' : 'ltr';
  const align = isRTL ? 'right' : 'left';
  const alignEnd = isRTL ? 'left' : 'right';
  const orderNum = order.iiko_order_number || order.order_number;

  const dateStr = new Intl.DateTimeFormat(isRTL ? 'ar-AE' : 'en-AE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(order.created_at));

  const cur = (v: number) => isRTL ? `${fmt(v)} ${currency}` : `${currency} ${fmt(v)}`;

  const sInfo = statusBadge(order.status, isRTL);
  const orderTypeLbl = order.order_type === 'pickup'
    ? (isRTL ? 'استلام من المحل' : 'Pickup')
    : (isRTL ? 'توصيل' : 'Delivery');
  const orderTypeBadge = pill(orderTypeLbl, '#8B1A1A', '#8B1A1A', '#fff');

  const payLabel = order.payment_status === 'paid'
    ? (isRTL ? '💳 مدفوع' : '💳 Paid')
    : (isRTL ? '💰 الدفع عند الاستلام' : '💰 Cash on Delivery');
  const payBg = order.payment_status === 'paid' ? '#D1FAE5' : '#FEF3C7';
  const payBorder = order.payment_status === 'paid' ? '#10B981' : '#F59E0B';
  const payColor = order.payment_status === 'paid' ? '#065F46' : '#92400E';

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" style="width:50px;height:50px;object-fit:contain;border-radius:10px;" />`
    : '';

  const trackingUrl = `${window.location.origin}/track?order=${orderNum}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(trackingUrl)}&color=8B1A1A`;

  // ── Item rows
  const itemRows = items.map((item, i) => {
    const bg = i % 2 === 0 ? '#FFFFFF' : '#FAFAF8';
    const qtyStr = `${item.quantity} ${item.unit}`;
    return `
      <tr style="background:${bg};">
        <td style="padding:14px 16px;font-size:14px;font-weight:500;text-align:${align};border-bottom:1px solid #F0EDE8;">${item.product_name}</td>
        <td style="padding:14px 16px;font-size:14px;text-align:center;border-bottom:1px solid #F0EDE8;color:#555;direction:ltr;unicode-bidi:plaintext;">${qtyStr}</td>
        <td style="padding:14px 16px;font-size:14px;text-align:center;border-bottom:1px solid #F0EDE8;color:#555;">${fmt(item.price_per_unit)}</td>
        <td style="padding:14px 16px;font-size:14px;text-align:${alignEnd};border-bottom:1px solid #F0EDE8;font-weight:700;color:#1a1a1a;">${cur(item.subtotal)}</td>
      </tr>`;
  }).join('');

  // ── Summary rows
  const summaryLine = (label: string, value: string, extra = '') =>
    `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#555;${extra}">
       <span>${label}</span><span style="font-weight:500;">${value}</span>
     </div>`;

  const totalLine = `
    <div style="display:flex;justify-content:space-between;padding:14px 0 4px;margin-top:8px;border-top:2px solid #8B1A1A;">
      <span style="font-size:20px;font-weight:800;color:#8B1A1A;">${isRTL ? 'الإجمالي النهائي' : 'Grand Total'}</span>
      <span style="font-size:20px;font-weight:800;color:#8B1A1A;">${cur(order.total)}</span>
    </div>`;

  return `
  <div id="invoice-render" style="
    width:520px;
    background:#FFFFFF;
    color:#1a1a1a;
    font-family:'Segoe UI','Helvetica Neue',Tahoma,Arial,sans-serif;
    padding:36px;
    direction:${dir};
    line-height:1.65;
    box-sizing:border-box;
  ">
    <!-- ═══ HEADER ═══ -->
    <div style="display:flex;align-items:center;gap:14px;padding-bottom:18px;">
      ${isRTL ? `
        <div style="flex:1;text-align:right;">
          <h1 style="margin:0;font-size:22px;color:#8B1A1A;font-weight:800;letter-spacing:-0.3px;">ملحمة السرايا</h1>
          <p style="margin:3px 0 0;font-size:12px;color:#999;font-weight:400;">لحوم طازجة &bull; جودة عالية</p>
        </div>
        ${logoHtml}
      ` : `
        ${logoHtml}
        <div style="flex:1;">
          <h1 style="margin:0;font-size:22px;color:#8B1A1A;font-weight:800;letter-spacing:-0.3px;">Al Saraya Butchery</h1>
          <p style="margin:3px 0 0;font-size:12px;color:#999;font-weight:400;">Fresh Meat &bull; Premium Quality</p>
        </div>
      `}
    </div>
    <div style="height:3px;background:linear-gradient(90deg,#8B1A1A 0%,#C0392B 50%,#E6D5B8 100%);border-radius:2px;"></div>

    <!-- ═══ INVOICE INFO + BADGES ═══ -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:22px;margin-bottom:18px;">
      <div>
        <h2 style="margin:0;font-size:15px;color:#444;font-weight:600;">
          ${isRTL ? 'فاتورة رقم' : 'Invoice'} <span style="color:#8B1A1A;font-weight:800;font-size:20px;">#${orderNum}</span>
        </h2>
        <p style="margin:5px 0 0;font-size:12px;color:#aaa;">${dateStr}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:${alignEnd};">
        ${orderTypeBadge}
        ${pill(sInfo.label, sInfo.bg, sInfo.border, sInfo.color)}
        ${pill(payLabel, payBg, payBorder, payColor)}
      </div>
    </div>

    <!-- ═══ CUSTOMER CARD ═══ -->
    <div style="background:#F9F8F6;border-radius:12px;padding:18px 20px;margin-bottom:22px;border:1px solid #EEECE7;">
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:13px;color:#333;">
        <span>👤</span><div><strong style="color:#666;">${isRTL ? 'العميل' : 'Customer'}:</strong> ${order.customer_name}</div>
        <span>📞</span><div><strong style="color:#666;">${isRTL ? 'الهاتف' : 'Phone'}:</strong> <span style="direction:ltr;unicode-bidi:embed;">${order.customer_phone}</span></div>
        <span>📍</span><div><strong style="color:#666;">${isRTL ? 'العنوان' : 'Address'}:</strong> ${order.delivery_address}</div>
        ${order.delivery_notes ? `<span>📝</span><div><strong style="color:#666;">${isRTL ? 'ملاحظات' : 'Notes'}:</strong> ${order.delivery_notes}</div>` : ''}
      </div>
    </div>

    <!-- ═══ PRODUCTS TABLE ═══ -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#8B1A1A;">
          <th style="padding:12px 16px;font-size:12px;text-align:${align};font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">${isRTL ? 'المنتج' : 'Product'}</th>
          <th style="padding:12px 16px;font-size:12px;text-align:center;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">${isRTL ? 'الكمية' : 'Qty'}</th>
          <th style="padding:12px 16px;font-size:12px;text-align:center;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">${isRTL ? 'سعر الوحدة' : 'Unit Price'}</th>
          <th style="padding:12px 16px;font-size:12px;text-align:${alignEnd};font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;">${isRTL ? 'الإجمالي' : 'Total'}</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- ═══ FINANCIAL SUMMARY ═══ -->
    <div style="padding:4px 0 0;">
      ${summaryLine(isRTL ? 'المجموع الفرعي' : 'Subtotal', cur(order.subtotal))}
      ${order.delivery_fee ? summaryLine(isRTL ? '🚚 رسوم التوصيل' : '🚚 Delivery Fee', cur(order.delivery_fee)) : ''}
      ${order.discount ? summaryLine(isRTL ? '🏷️ خصم' : '🏷️ Discount', `- ${cur(order.discount)}`, 'color:#16A34A;') : ''}
      ${totalLine}
    </div>

    <!-- ═══ QR CODE ═══ -->
    <div style="text-align:center;margin-top:28px;padding-top:20px;border-top:1px dashed #DDD;">
      <div style="display:inline-block;background:#F9F8F6;border-radius:14px;padding:16px 24px;border:1px solid #EEECE7;">
        <img src="${qrUrl}" style="width:110px;height:110px;border-radius:6px;" />
        <p style="margin:8px 0 0;font-size:11px;color:#999;font-weight:500;">
          ${isRTL ? '📱 امسح الكود لتتبع طلبك' : '📱 Scan to track your order'}
        </p>
      </div>
    </div>

    <!-- ═══ WEIGHT POLICY ═══ -->
    <div style="margin-top:18px;padding:12px 16px;background:#FFFBEB;border:1px dashed #D97706;border-radius:10px;text-align:center;font-size:11px;color:#92400E;line-height:1.6;">
      ⚖️ ${isRTL
        ? 'ملاحظة: الوزن المعروض تقريبي قبل التنظيف وقد ينخفض بعد التجهيز بنسبة طبيعية من 5% إلى 20%. السعر يُحتسب على الوزن قبل التنظيف.'
        : 'Note: Displayed weight is approximate before cleaning and may decrease by 5%-20% after preparation. Price is based on weight before cleaning.'}
    </div>

    <!-- ═══ THANK YOU ═══ -->
    <div style="text-align:center;margin-top:22px;">
      <p style="margin:0;font-size:14px;color:#555;font-weight:600;">
        ${isRTL ? 'شكراً لتسوقكم من ملحمة السرايا 🙏' : 'Thank you for shopping at Al Saraya Butchery 🙏'}
      </p>
    </div>

    <!-- ═══ BUSINESS FOOTER ═══ -->
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #EEECE7;text-align:center;font-size:10px;color:#BBB;line-height:2;">
      <div style="font-weight:600;color:#999;">${isRTL ? (order.company_name_ar || 'ملحمة السرايا الجديدة للحوم ذ.م.م') : (order.company_name_en || 'New Al Saraya Butchery L.L.C.')}</div>
      ${(order.license_number || order.adcci_number) ? `<div>${order.license_number ? `${isRTL ? 'رقم الرخصة' : 'License No'}: ${order.license_number}` : ''}${order.license_number && order.adcci_number ? ' &bull; ' : ''}${order.adcci_number ? `${isRTL ? 'عضوية الغرفة' : 'ADCCI No'}: ${order.adcci_number}` : ''}</div>` : ''}
      ${order.vat_number ? `<div>${isRTL ? 'الرقم الضريبي' : 'TRN'}: ${order.vat_number}</div>` : ''}
      <div>📞 +971 56 680 8565 &bull; 🌐 alsarayabutcheryllc.com</div>
      <div>${isRTL ? 'أبوظبي، الإمارات العربية المتحدة' : 'Abu Dhabi, United Arab Emirates'}</div>
    </div>
  </div>`;
}

// ── Logo loader ────────────────────────────────────────────────────────────

async function loadLogoAsDataUrl(): Promise<string | undefined> {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    return await new Promise<string | undefined>((resolve) => {
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0); resolve(c.toDataURL('image/png')); }
        else resolve(undefined);
      };
      img.onerror = () => resolve(undefined);
      img.src = '/app-icon.png';
    });
  } catch { return undefined; }
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function generateInvoiceImage(
  order: InvoiceOrder,
  items: InvoiceItem[],
  options: { isRTL: boolean; currency: string }
): Promise<Blob | null> {
  const logoDataUrl = await loadLogoAsDataUrl();
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  document.body.appendChild(container);
  container.innerHTML = buildInvoiceHTML(order, items, { ...options, logoDataUrl });

  try {
    const el = document.getElementById('invoice-render');
    if (!el) return null;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    document.body.removeChild(container);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 1.0));
  } catch (err) {
    console.error('Invoice generation error:', err);
    document.body.removeChild(container);
    return null;
  }
}

export async function shareInvoiceImage(
  order: InvoiceOrder,
  items: InvoiceItem[],
  options: { isRTL: boolean; currency: string }
): Promise<boolean> {
  const blob = await generateInvoiceImage(order, items, options);
  if (!blob) return false;

  const orderNum = order.iiko_order_number || order.order_number;
  const fileName = `invoice-${orderNum}.png`;

  if (navigator.share && navigator.canShare) {
    const file = new File([blob], fileName, { type: 'image/png' });
    const shareData = { files: [file], title: `Invoice #${orderNum}` };
    if (navigator.canShare(shareData)) {
      try { await navigator.share(shareData); return true; }
      catch (err) { if ((err as Error).name === 'AbortError') return false; }
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName; a.click();
  URL.revokeObjectURL(url);
  return true;
}
