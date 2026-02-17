// Order and Tracking Types for Live Order Tracking System

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type DriverAvailability = 'available' | 'on_delivery' | 'offline';

export interface OrderItem {
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

export interface Driver {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  availability: DriverAvailability;
  current_order_id: string | null;
  vehicle_type: string;
  vehicle_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  iiko_order_number?: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  driver_id: string | null;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  total_weight: number;
  delivery_address: string;
  delivery_city: string;
  delivery_notes: string | null;
  estimated_arrival: string | null;
  delivered_at: string | null;
  iiko_order_id: string | null;
  iiko_synced: boolean;
  source: string;
  created_at: string;
  updated_at: string;
  driver?: Driver;
}

export interface OrderUpdate {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes: string | null;
  updated_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  order_id: string | null;
  user_id: string | null;
  type: string;
  channel: string;
  content: string | null;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

// Status display configuration
export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  labelEn: string;
  icon: string;
  color: string;
  description: string;
  descriptionEn: string;
}> = {
  pending: {
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    icon: 'Clock',
    color: 'text-yellow-500',
    description: 'طلبك قيد المراجعة',
    descriptionEn: 'Your order is being reviewed',
  },
  confirmed: {
    label: 'تم التأكيد',
    labelEn: 'Confirmed',
    icon: 'CheckCircle',
    color: 'text-blue-500',
    description: 'تم تأكيد طلبك',
    descriptionEn: 'Your order has been confirmed',
  },
  preparing: {
    label: 'قيد التحضير',
    labelEn: 'Preparing',
    icon: 'ChefHat',
    color: 'text-orange-500',
    description: 'نحضر طلبك الآن',
    descriptionEn: 'We are preparing your order',
  },
  ready: {
    label: 'جاهز',
    labelEn: 'Ready',
    icon: 'Package',
    color: 'text-green-500',
    description: 'طلبك جاهز للتوصيل',
    descriptionEn: 'Your order is ready for delivery',
  },
  out_for_delivery: {
    label: 'في الطريق',
    labelEn: 'Out for Delivery',
    icon: 'Truck',
    color: 'text-primary',
    description: 'السائق في الطريق إليك',
    descriptionEn: 'Driver is on the way to you',
  },
  delivered: {
    label: 'تم التوصيل',
    labelEn: 'Delivered',
    icon: 'CheckCircle2',
    color: 'text-green-600',
    description: 'تم توصيل طلبك بنجاح',
    descriptionEn: 'Your order has been delivered',
  },
  cancelled: {
    label: 'ملغي',
    labelEn: 'Cancelled',
    icon: 'XCircle',
    color: 'text-destructive',
    description: 'تم إلغاء الطلب',
    descriptionEn: 'Order has been cancelled',
  },
};

// Order status flow for timeline
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

// iiko compatible status mapping
export const IIKO_STATUS_MAP: Record<OrderStatus, string> = {
  pending: 'New',
  confirmed: 'Confirmed',
  preparing: 'Cooking',
  ready: 'Ready',
  out_for_delivery: 'OnWay',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
