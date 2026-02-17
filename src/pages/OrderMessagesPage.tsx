import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ArrowLeft, 
  Package, 
  Loader2,
  ChefHat,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderMessageThread from '@/components/shared/OrderMessageThread';
import { useOrderMessages } from '@/hooks/useOrderMessages';

interface OrderItem {
  productId: string;
  productName: string;
  productNameEn?: string;
  quantity: number;
  unit: string;
}

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_id: string | null;
  status: string;
  items: OrderItem[];
}

const OrderMessagesPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get unread count for overall order
  const { messages: allMessages } = useOrderMessages(order?.id, undefined, true);
  
  // Count unread messages from butcher
  const unreadFromButcher = allMessages.filter(
    (m) => m.sender_type === 'butcher' && !m.is_read
  ).length;

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkAuth();
  }, []);

  // Fetch order
  const fetchOrder = useCallback(async () => {
    if (!orderNumber) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_id, status, items')
        .eq('order_number', orderNumber)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError(isRTL ? 'لم يتم العثور على الطلب' : 'Order not found');
        } else {
          throw fetchError;
        }
        return;
      }

      // Check if user owns this order
      if (data.customer_id && data.customer_id !== userId) {
        setError(isRTL ? 'غير مصرح بالوصول لهذا الطلب' : 'Not authorized to view this order');
        return;
      }

      setOrder({
        ...data,
        items: data.items as unknown as OrderItem[],
      });
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [orderNumber, userId, isRTL]);

  useEffect(() => {
    if (userId !== null) {
      fetchOrder();
    }
  }, [userId, fetchOrder]);

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <PageLayout>
        <div className="container max-w-lg mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-xl font-bold mb-2">{error || (isRTL ? 'خطأ' : 'Error')}</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 me-2" />
            {isRTL ? 'رجوع' : 'Go Back'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              {isRTL ? 'رسائل الطلب' : 'Order Messages'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {order.order_number} • {order.customer_name}
            </p>
          </div>
          {unreadFromButcher > 0 && (
            <Badge variant="destructive">{unreadFromButcher} {isRTL ? 'جديد' : 'new'}</Badge>
          )}
        </div>

        {/* Info card */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ChefHat className="w-5 h-5 text-primary" />
              <p>
                {isRTL
                  ? 'يمكنك التواصل مع الجزار مباشرة بخصوص طلبك. سيتم إشعارك بالرسائل الجديدة.'
                  : 'You can communicate directly with the butcher about your order. You\'ll be notified of new messages.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product list / conversation selector */}
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-3 text-muted-foreground">
            {isRTL ? 'اختر المنتج للمحادثة:' : 'Select product to chat about:'}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedProductId === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProductId(null)}
            >
              <Package className="w-4 h-4 me-1" />
              {isRTL ? 'الطلب كامل' : 'Entire Order'}
            </Button>
            {order.items.map((item) => (
              <Button
                key={item.productId}
                variant={selectedProductId === item.productId ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedProductId(item.productId)}
              >
                {item.productName}
                <Badge variant="secondary" className="ms-2 text-xs">
                  {item.quantity} {item.unit === 'kg' ? (isRTL ? 'كجم' : 'kg') : isRTL ? 'قطعة' : 'pcs'}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Message thread */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedProductId
                ? order.items.find((i) => i.productId === selectedProductId)?.productName
                : isRTL ? 'محادثة الطلب' : 'Order Conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <OrderMessageThread
              orderId={order.id}
              productId={selectedProductId || undefined}
              senderType="customer"
              className="border-t"
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default OrderMessagesPage;
