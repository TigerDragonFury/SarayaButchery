import { CartItem } from "@/contexts/CartContext";

interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}

interface OrderDetails {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalWeight: number;
  customerInfo?: CustomerInfo;
  paymentMethod?: "online" | "cod";
}

const WHATSAPP_NUMBER = "971566808565";

/**
 * Generate a formatted WhatsApp order message in Arabic
 */
export function generateWhatsAppOrderMessage(
  order: OrderDetails,
  isRTL: boolean = true
): string {
  const { items, subtotal, deliveryFee, total, totalWeight, customerInfo, paymentMethod } = order;

  // Header
  const header = isRTL
    ? "🥩 *طلب جديد - ملحمة السرايا*"
    : "🥩 *New Order - Al Saraya Butchery*";

  const divider = "━━━━━━━━━━━━━━━━━━";

  // Order items with full details
  const itemsHeader = isRTL ? "📦 *تفاصيل الطلب:*" : "📦 *Order Details:*";
  
  const itemsList = items.map((item, index) => {
    const name = isRTL ? item.name : (item.nameEn || item.name);
    const isWeightBased = item.unit === "kg" || !item.unit;
    const quantityLabel = isWeightBased 
      ? (isRTL ? `${item.quantity} كجم` : `${item.quantity} KG`)
      : (isRTL ? `${item.quantity} قطعة` : `${item.quantity} pcs`);
    
    const pricePerUnit = isWeightBased
      ? (isRTL ? `${item.price} د.إ/كجم` : `${item.price} AED/KG`)
      : (isRTL ? `${item.price} د.إ` : `${item.price} AED`);
    
    const itemTotal = (item.price * item.quantity).toFixed(0);
    const totalLabel = isRTL ? `${itemTotal} د.إ` : `${itemTotal} AED`;

    let itemLine = `${index + 1}. *${name}*\n`;
    itemLine += isRTL
      ? `   📏 الكمية: ${quantityLabel}\n`
      : `   📏 Qty: ${quantityLabel}\n`;
    itemLine += isRTL
      ? `   💰 السعر: ${pricePerUnit}\n`
      : `   💰 Price: ${pricePerUnit}\n`;
    itemLine += isRTL
      ? `   🧾 المجموع: ${totalLabel}`
      : `   🧾 Total: ${totalLabel}`;

    // Add special instructions if present
    if (item.notes && item.notes.trim()) {
      itemLine += isRTL
        ? `\n   ✂️ ملاحظات: _${item.notes}_`
        : `\n   ✂️ Notes: _${item.notes}_`;
    }

    return itemLine;
  }).join("\n\n");

  // Totals section
  const totalsHeader = isRTL ? "💳 *ملخص الطلب:*" : "💳 *Order Summary:*";
  
  const weightLabel = isRTL 
    ? `⚖️ الوزن الإجمالي: ${totalWeight} كجم`
    : `⚖️ Total Weight: ${totalWeight} KG`;
  
  const subtotalLabel = isRTL
    ? `📊 المجموع الفرعي: ${subtotal.toFixed(0)} د.إ`
    : `📊 Subtotal: ${subtotal.toFixed(0)} AED`;
  
  const deliveryLabel = isRTL
    ? `🚚 التوصيل: ${deliveryFee === 0 ? "مجاني ✅" : `${deliveryFee} د.إ`}`
    : `🚚 Delivery: ${deliveryFee === 0 ? "Free ✅" : `${deliveryFee} AED`}`;
  
  const totalLabel = isRTL
    ? `💵 *الإجمالي: ${total.toFixed(0)} د.إ*`
    : `💵 *Total: ${total.toFixed(0)} AED*`;

  // Customer info section (if provided)
  let customerSection = "";
  if (customerInfo && (customerInfo.name || customerInfo.phone || customerInfo.address)) {
    const customerHeader = isRTL ? "👤 *معلومات العميل:*" : "👤 *Customer Info:*";
    const customerDetails = [];
    
    if (customerInfo.name) {
      customerDetails.push(isRTL ? `الاسم: ${customerInfo.name}` : `Name: ${customerInfo.name}`);
    }
    if (customerInfo.phone) {
      customerDetails.push(isRTL ? `الهاتف: ${customerInfo.phone}` : `Phone: ${customerInfo.phone}`);
    }
    if (customerInfo.email) {
      customerDetails.push(isRTL ? `البريد: ${customerInfo.email}` : `Email: ${customerInfo.email}`);
    }
    if (customerInfo.address) {
      customerDetails.push(isRTL ? `العنوان: ${customerInfo.address}` : `Address: ${customerInfo.address}`);
    }
    if (customerInfo.city) {
      customerDetails.push(isRTL ? `المدينة: ${customerInfo.city}` : `City: ${customerInfo.city}`);
    }
    if (customerInfo.notes) {
      customerDetails.push(isRTL ? `ملاحظات التوصيل: ${customerInfo.notes}` : `Delivery Notes: ${customerInfo.notes}`);
    }

    customerSection = `\n${divider}\n\n${customerHeader}\n${customerDetails.join("\n")}`;
  }

  // Payment method
  let paymentSection = "";
  if (paymentMethod) {
    const paymentLabel = isRTL
      ? `💳 طريقة الدفع: ${paymentMethod === "cod" ? "الدفع عند الاستلام" : "الدفع الإلكتروني"}`
      : `💳 Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}`;
    paymentSection = `\n${paymentLabel}`;
  }

  // Weight & Cleaning Policy
  const weightPolicy = isRTL
    ? "⚖️ *سياسة الوزن والتنظيف:*\nالوزن المعروض تقريبي قبل التنظيف وقد ينخفض بعد التجهيز بنسبة 5% إلى 20%. السعر يُحتسب على الوزن قبل التنظيف."
    : "⚖️ *Weight & Cleaning Policy:*\nDisplayed weight is approximate before cleaning and may decrease by 5%-20% after preparation. Price is based on weight before cleaning.";

  // Footer
  const footer = isRTL
    ? "🙏 شكراً لاختياركم ملحمة السرايا"
    : "🙏 Thank you for choosing Al Saraya Butchery";

  // Combine all sections
  const message = [
    header,
    divider,
    "",
    itemsHeader,
    itemsList,
    "",
    divider,
    "",
    totalsHeader,
    weightLabel,
    subtotalLabel,
    deliveryLabel,
    totalLabel,
    paymentSection,
    customerSection,
    "",
    divider,
    weightPolicy,
    "",
    divider,
    footer
  ].join("\n");

  return message;
}

/**
 * Open WhatsApp with the order message
 */
export function openWhatsAppOrder(
  order: OrderDetails,
  isRTL: boolean = true
): void {
  const message = generateWhatsAppOrderMessage(order, isRTL);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
}

/**
 * Generate a simple product inquiry message
 */
export function generateProductInquiry(
  productName: string,
  productNameEn: string | undefined,
  weight: number,
  price: number,
  notes: string | undefined,
  isRTL: boolean
): string {
  const name = isRTL ? productName : (productNameEn || productName);
  const weightLabel = isRTL ? `${weight} كجم` : `${weight} KG`;
  const totalPrice = (price * weight).toFixed(0);
  const priceLabel = isRTL ? `${totalPrice} د.إ` : `${totalPrice} AED`;

  let message = isRTL
    ? `مرحباً، أريد طلب:\n\n🥩 ${name}\n⚖️ الكمية: ${weightLabel}\n💰 السعر: ${priceLabel}`
    : `Hello, I want to order:\n\n🥩 ${name}\n⚖️ Quantity: ${weightLabel}\n💰 Price: ${priceLabel}`;

  if (notes && notes.trim()) {
    message += isRTL
      ? `\n✂️ ملاحظات: ${notes}`
      : `\n✂️ Notes: ${notes}`;
  }

  return message;
}

export function openProductWhatsApp(
  productName: string,
  productNameEn: string | undefined,
  weight: number,
  price: number,
  notes: string | undefined,
  isRTL: boolean
): void {
  const message = generateProductInquiry(productName, productNameEn, weight, price, notes, isRTL);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
}

// ============================================
// BUTCHER NOTIFICATIONS
// Status: Ready for Activation - Pending Integration
// ============================================

interface ButcherOrderItem {
  productName: string;
  productNameEn?: string;
  quantity: number;
  unit: "kg" | "piece" | "box";
  textNotes?: string;
  voiceNoteUrl?: string;
}

interface ButcherNotificationData {
  orderNumber: string;
  orderId: string;
  items: ButcherOrderItem[];
  customerName: string;
  createdAt: string;
}

/**
 * Generate WhatsApp-ready message for butcher notification
 * Ready for Activation - Pending Integration with WhatsApp Business API
 * 
 * This message is generated when an order is confirmed and includes:
 * - Product name (Arabic)
 * - Quantity/weight
 * - Text notes from customer
 * - Voice note signed URL (if available)
 */
export function generateButcherNotification(
  data: ButcherNotificationData
): string {
  const { orderNumber, items, customerName, createdAt } = data;
  
  const header = `🔪 *طلب جديد للتحضير*\n━━━━━━━━━━━━━━━━━━`;
  
  const orderInfo = [
    `📋 رقم الطلب: *${orderNumber}*`,
    `👤 العميل: ${customerName}`,
    `🕐 الوقت: ${new Date(createdAt).toLocaleString('ar-AE', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })}`,
  ].join('\n');

  const itemsHeader = `\n━━━━━━━━━━━━━━━━━━\n📦 *المنتجات المطلوبة:*\n`;
  
  const itemsList = items.map((item, index) => {
    const quantityLabel = item.unit === "kg" 
      ? `${item.quantity} كجم`
      : item.unit === "piece"
        ? `${item.quantity} قطعة`
        : `${item.quantity} صندوق`;
    
    let itemText = `\n${index + 1}. *${item.productName}*`;
    itemText += `\n   ⚖️ الكمية: ${quantityLabel}`;
    
    if (item.textNotes && item.textNotes.trim()) {
      itemText += `\n   ✂️ ملاحظات: _${item.textNotes}_`;
    }
    
    if (item.voiceNoteUrl) {
      itemText += `\n   🎙️ ملاحظة صوتية: ${item.voiceNoteUrl}`;
    }
    
    return itemText;
  }).join('\n');

  const footer = `\n━━━━━━━━━━━━━━━━━━\n✅ يرجى تأكيد البدء في التحضير`;

  return [header, orderInfo, itemsHeader, itemsList, footer].join('\n');
}

/**
 * Prepare butcher notification data from order
 * Fetches voice note signed URLs for each item
 * 
 * @returns Object with message and metadata, ready for activation
 */
export async function prepareButcherNotification(
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    created_at: string;
    items: Array<{
      productName: string;
      productNameEn?: string;
      quantity: number;
      unit: "kg" | "piece" | "box";
      customerNotes?: string;
      productId?: string;
    }>;
  },
  voiceNotes: Array<{
    product_id: string | null;
    signedUrl: string;
  }>
): Promise<{
  message: string;
  status: "ready_for_activation";
  channel: "whatsapp";
  recipientType: "butcher";
  metadata: {
    orderNumber: string;
    orderId: string;
    itemCount: number;
    hasVoiceNotes: boolean;
  };
}> {
  // Map voice notes to items
  const itemsWithVoiceNotes: ButcherOrderItem[] = order.items.map(item => {
    const voiceNote = voiceNotes.find(vn => vn.product_id === item.productId);
    return {
      productName: item.productName,
      productNameEn: item.productNameEn,
      quantity: item.quantity,
      unit: item.unit,
      textNotes: item.customerNotes,
      voiceNoteUrl: voiceNote?.signedUrl,
    };
  });

  const notificationData: ButcherNotificationData = {
    orderNumber: order.order_number,
    orderId: order.id,
    items: itemsWithVoiceNotes,
    customerName: order.customer_name,
    createdAt: order.created_at,
  };

  const message = generateButcherNotification(notificationData);

  return {
    message,
    status: "ready_for_activation",
    channel: "whatsapp",
    recipientType: "butcher",
    metadata: {
      orderNumber: order.order_number,
      orderId: order.id,
      itemCount: order.items.length,
      hasVoiceNotes: voiceNotes.length > 0,
    },
  };
}

/**
 * Get WhatsApp deep link for butcher notification
 * Ready for manual sending by admin
 */
export function getButcherWhatsAppLink(
  message: string,
  butcherPhone: string = WHATSAPP_NUMBER
): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${butcherPhone}?text=${encodedMessage}`;
}

// ============================================
// ORDER MESSAGE TEMPLATES
// ============================================

interface OrderTemplateData {
  customerName: string;
  orderNumber: string;
  orderDate?: string;
  estimatedTime?: string;
  deliveryAddress?: string;
  isRTL?: boolean;
}

/**
 * Generate order confirmation message template
 */
export function generateOrderConfirmationTemplate(
  data: OrderTemplateData
): string {
  const { customerName, orderNumber, isRTL = true } = data;
  
  return isRTL
    ? `✅ *تم تأكيد طلبك بنجاح*\n\nمرحباً ${customerName}،\n\nتم استقبال طلبك رقم *#${orderNumber}* وتأكيده.\nسيتم بدء التحضير في الحال.\n\n🙏 شكراً لاختيارك ملحمة السرايا`
    : `✅ *Your Order Confirmed*\n\nHello ${customerName},\n\nYour order *#${orderNumber}* has been confirmed.\nWe will start preparing it right away.\n\n🙏 Thank you for choosing Al Saraya Butchery`;
}

/**
 * Generate order preparing message template
 */
export function generatePreparingTemplate(
  data: OrderTemplateData
): string {
  const { customerName, orderNumber, estimatedTime, isRTL = true } = data;
  
  const timeText = estimatedTime
    ? (isRTL ? `⏱️ الوقت المتوقع: ${estimatedTime}` : `⏱️ Estimated Time: ${estimatedTime}`)
    : '';
  
  return isRTL
    ? `👨‍🍳 *جاري تحضير طلبك*\n\nمرحباً ${customerName}،\n\nطلبك رقم *#${orderNumber}* قيد التحضير حالياً.\n${timeText}\n\n✨ سيكون جاهزاً قريباً!`
    : `👨‍🍳 *Your Order is Being Prepared*\n\nHello ${customerName},\n\nYour order *#${orderNumber}* is being prepared now.\n${timeText}\n\n✨ It will be ready soon!`;
}

/**
 * Generate order ready message template
 */
export function generateOrderReadyTemplate(
  data: OrderTemplateData
): string {
  const { customerName, orderNumber, isRTL = true } = data;
  
  return isRTL
    ? `📦 *طلبك جاهز*\n\nمرحباً ${customerName}،\n\nطلبك رقم *#${orderNumber}* جاهز للاستلام أو التوصيل 🎉\n\nشكراً لصبرك! 💚`
    : `📦 *Your Order is Ready*\n\nHello ${customerName},\n\nYour order *#${orderNumber}* is ready for pickup or delivery 🎉\n\nThank you for your patience! 💚`;
}

/**
 * Generate delivery message template
 */
export function generateDeliveryTemplate(
  data: OrderTemplateData
): string {
  const { customerName, orderNumber, deliveryAddress, isRTL = true } = data;
  
  const addressText = deliveryAddress
    ? (isRTL ? `📍 العنوان: ${deliveryAddress}` : `📍 Address: ${deliveryAddress}`)
    : '';
  
  return isRTL
    ? `🚚 *طلبك في الطريق*\n\nمرحباً ${customerName}،\n\nطلبك رقم *#${orderNumber}* في الطريق إليك الآن!\n${addressText}\n\n⏱️ سيصل قريباً جداً 🎯`
    : `🚚 *Your Order is On the Way*\n\nHello ${customerName},\n\nYour order *#${orderNumber}* is on its way to you now!\n${addressText}\n\n⏱️ It will arrive very soon 🎯`;
}

/**
 * Generate delivery confirmation message template
 */
export function generateDeliveryConfirmationTemplate(
  data: OrderTemplateData
): string {
  const { customerName, orderNumber, isRTL = true } = data;
  
  return isRTL
    ? `✅ *تم توصيل طلبك بنجاح*\n\nمرحباً ${customerName}،\n\nشكراً! تم توصيل طلبك رقم *#${orderNumber}* بنجاح ✨\n\n🙏 نتمنى أن تستمتع بجودة منتجاتنا\n📞 للتواصل والشكاوى: واتساب أو اتصال مباشر`
    : `✅ *Your Order Delivered Successfully*\n\nHello ${customerName},\n\nThank you! Your order *#${orderNumber}* has been delivered successfully ✨\n\n🙏 We hope you enjoy our premium quality products\n📞 For feedback or concerns: WhatsApp or call us`;
}

/**
 * Send template message via WhatsApp
 */
export function sendTemplateMessage(
  phone: string,
  message: string
): void {
  const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^0/, '');
  const formattedPhone = cleanPhone.startsWith('+') 
    ? cleanPhone.slice(1) 
    : (cleanPhone.startsWith('971') ? cleanPhone : `971${cleanPhone}`);
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
}
