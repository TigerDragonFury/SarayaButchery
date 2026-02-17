// iiko POS Integration - Order Structure
// Status: IN PROGRESS - Structure ready, awaiting live integration

import { supabase } from '@/integrations/supabase/client';

export interface IikoOrderItem {
  productId: string;
  productName: string;
  productNameEn?: string;
  quantity: number;
  unit: 'kg' | 'piece' | 'box';
  pricePerUnit: number;
  totalPrice: number;
  customerNotes?: string;
  category?: string;
}

export interface IikoCustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  deliveryNotes?: string;
  // New fields for pickup/delivery scheduling
  orderType?: 'pickup' | 'delivery';
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  branchName?: string;
}

export interface IikoOrderPayment {
  method: 'online' | 'cod';
  status: 'pending' | 'paid' | 'failed';
  amount: number;
}

export interface IikoOrder {
  // Order metadata
  orderId: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  source: 'website' | 'whatsapp' | 'phone';
  
  // Order items
  items: IikoOrderItem[];
  
  // Totals
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  totalWeight: number;
  
  // Customer
  customer: IikoCustomerInfo;
  
  // Payment
  payment: IikoOrderPayment;
  
  // Integration flags
  iikoSynced: boolean;
  iikoOrderId?: string;
  syncedAt?: string;
}

// Convert cart items to iiko-ready structure
export const formatCartForIiko = (
  items: Array<{
    id: string;
    name: string;
    nameEn?: string;
    price: number;
    quantity: number;
    unit?: string;
    category?: string;
    notes?: string;
  }>,
  subtotal: number,
  deliveryFee: number,
  total: number,
  totalWeight: number,
  customerInfo: IikoCustomerInfo,
  paymentMethod: 'online' | 'cod'
): IikoOrder => {
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const orderItems: IikoOrderItem[] = items.map(item => ({
    productId: item.id,
    productName: item.name,
    productNameEn: item.nameEn,
    quantity: item.quantity,
    unit: determineUnit(item.unit, item.category),
    pricePerUnit: item.price,
    totalPrice: item.price * item.quantity,
    customerNotes: item.notes,
    category: item.category,
  }));
  
  return {
    orderId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    source: 'website',
    items: orderItems,
    subtotal,
    deliveryFee,
    discount: 0,
    total,
    totalWeight,
    customer: customerInfo,
    payment: {
      method: paymentMethod,
      status: 'pending',
      amount: total,
    },
    iikoSynced: false, // Will be set to true after successful iiko sync
  };
};

// Determine the correct unit type for iiko
const determineUnit = (unit?: string, category?: string): 'kg' | 'piece' | 'box' => {
  if (unit?.toLowerCase().includes('box') || unit?.includes('بوكس')) {
    return 'box';
  }
  if (category === 'boxes') {
    return 'box';
  }
  if (unit?.toLowerCase().includes('piece') || unit?.includes('قطعة')) {
    return 'piece';
  }
  return 'kg';
};

// Create order in Supabase database with normalized order_items
export const createOrderInDatabase = async (
  order: IikoOrder,
  iikoInfo?: {
    iikoOrderId?: string;
    iikoOrderNumber?: string;
    status?: IikoOrder['status'];
    iikoSynced?: boolean;
  }
): Promise<{ success: boolean; orderNumber?: string; orderId?: string; error?: string }> => {
  try {
    // Generate order number client-side since trigger-generated values can't be retrieved
    // without SELECT permission (which anonymous users don't have)
    const orderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const orderId = crypto.randomUUID();
    
    // 1. Create the order first
    const orderStatus = iikoInfo?.status || order.status;
    const iikoSynced = iikoInfo?.iikoSynced ?? order.iikoSynced;

    const { error: orderError } = await supabase
      .from('orders' as any)
      .insert({
        id: orderId,
        customer_name: order.customer.name,
        customer_phone: order.customer.phone,
        customer_email: order.customer.email || null,
        status: orderStatus,
        items: order.items as any, // Keep JSONB for backward compatibility
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        discount: order.discount,
        total: order.total,
        total_weight: order.totalWeight,
        delivery_address: order.customer.address,
        delivery_city: order.customer.city,
        delivery_notes: order.customer.deliveryNotes || null,
        source: order.source,
        iiko_synced: iikoSynced,
        iiko_order_id: iikoInfo?.iikoOrderId || null,
        iiko_order_number: iikoInfo?.iikoOrderNumber || null,
        order_number: orderNumber,
        // New pickup/delivery scheduling fields
        order_type: order.customer.orderType || 'delivery',
        scheduled_date: order.customer.scheduledDate || null,
        scheduled_time_slot: order.customer.scheduledTimeSlot || null,
        branch_name: order.customer.branchName || null,
      } as any);

    if (orderError) {
      console.error('[Database] Order creation error:', orderError);
      throw orderError;
    }

    console.log('[Database] Order created successfully:', orderNumber, 'ID:', orderId);

    // 2. Insert normalized order items into order_items table
    if (order.items.length > 0) {
      const orderItems = order.items.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        product_name_en: item.productNameEn || null,
        quantity: item.quantity,
        unit: item.unit,
        price_per_unit: item.pricePerUnit,
        subtotal: item.totalPrice,
        notes: item.customerNotes || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items' as any)
        .insert(orderItems as any);

      if (itemsError) {
        // Log but don't fail - order is already created
        console.warn('[Database] Order items insertion warning:', itemsError);
      } else {
        console.log('[Database] Order items inserted:', orderItems.length, 'items');
      }
    }

    return {
      success: true,
      orderNumber: orderNumber,
      orderId: orderId,
    };
  } catch (err) {
    console.error('[Database] Order creation failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create order',
    };
  }
};

// Generate order summary for logging/debugging
export const generateOrderSummary = (order: IikoOrder): string => {
  const lines = [
    `═══════════════════════════════════════`,
    `ORDER ID: ${order.orderId}`,
    `DATE: ${new Date(order.createdAt).toLocaleString('ar-AE')}`,
    `STATUS: ${order.status}`,
    `SOURCE: ${order.source}`,
    `═══════════════════════════════════════`,
    ``,
    `CUSTOMER:`,
    `  Name: ${order.customer.name}`,
    `  Phone: ${order.customer.phone}`,
    `  Address: ${order.customer.address}, ${order.customer.city}`,
    order.customer.deliveryNotes ? `  Notes: ${order.customer.deliveryNotes}` : '',
    ``,
    `ITEMS:`,
  ];
  
  order.items.forEach((item, index) => {
    lines.push(`  ${index + 1}. ${item.productName}`);
    if (item.productNameEn) {
      lines.push(`     (${item.productNameEn})`);
    }
    lines.push(`     Qty: ${item.quantity} ${item.unit} × ${item.pricePerUnit} AED = ${item.totalPrice} AED`);
    if (item.customerNotes) {
      lines.push(`     📝 ${item.customerNotes}`);
    }
  });
  
  lines.push(``);
  lines.push(`═══════════════════════════════════════`);
  lines.push(`TOTALS:`);
  lines.push(`  Subtotal: ${order.subtotal} AED`);
  lines.push(`  Delivery: ${order.deliveryFee === 0 ? 'FREE' : `${order.deliveryFee} AED`}`);
  if (order.discount > 0) {
    lines.push(`  Discount: -${order.discount} AED`);
  }
  lines.push(`  TOTAL: ${order.total} AED`);
  lines.push(`  Total Weight: ${order.totalWeight} KG`);
  lines.push(``);
  lines.push(`PAYMENT: ${order.payment.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`);
  lines.push(`═══════════════════════════════════════`);
  lines.push(`IIKO SYNC: ${order.iikoSynced ? '✓ Synced' : '⏳ Pending'}`);
  if (order.iikoOrderId) {
    lines.push(`IIKO ORDER ID: ${order.iikoOrderId}`);
  }
  
  return lines.filter(l => l !== '').join('\n');
};

// Placeholder for future iiko API integration
export const syncToIiko = async (order: IikoOrder): Promise<{ success: boolean; iikoOrderId?: string; error?: string }> => {
  // TODO: Implement actual iiko API integration
  // This will:
  // 1. Authenticate with iiko Cloud API
  // 2. Create order in iiko system
  // 3. Return iiko order ID for tracking
  
  console.log('[iiko] Order sync pending - Integration in progress');
  console.log('[iiko] Order structure:', generateOrderSummary(order));
  
  return {
    success: false,
    error: 'iiko integration not yet activated',
  };
};

// iiko status mapping
export const IIKO_STATUS_MAP: Record<string, string> = {
  pending: 'New',
  confirmed: 'Confirmed',
  preparing: 'Cooking',
  ready: 'Ready',
  out_for_delivery: 'OnWay',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Get iiko-compatible status
export const getIikoStatus = (status: string): string => {
  return IIKO_STATUS_MAP[status] || 'Unknown';
};
