
-- Fix the trigger function to use net.http_post with direct URL
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_title text;
  v_title_ar text;
  v_body text;
  v_body_ar text;
  v_order_number text;
  v_customer_id uuid;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  v_order_number := NEW.order_number;
  v_customer_id := NEW.customer_id;

  CASE NEW.status
    WHEN 'confirmed' THEN
      v_title := 'Order Confirmed';
      v_title_ar := 'تم تأكيد الطلب';
      v_body := 'Your order ' || v_order_number || ' has been confirmed';
      v_body_ar := 'تم تأكيد طلبك ' || v_order_number;
    WHEN 'preparing' THEN
      v_title := 'Order Being Prepared';
      v_title_ar := 'جاري تحضير الطلب';
      v_body := 'Your order ' || v_order_number || ' is being prepared';
      v_body_ar := 'جاري تحضير طلبك ' || v_order_number;
    WHEN 'ready' THEN
      v_title := 'Order Ready';
      v_title_ar := 'الطلب جاهز';
      v_body := 'Your order ' || v_order_number || ' is ready';
      v_body_ar := 'طلبك ' || v_order_number || ' جاهز';
    WHEN 'out_for_delivery' THEN
      v_title := 'Order On The Way';
      v_title_ar := 'الطلب في الطريق';
      v_body := 'Your order ' || v_order_number || ' is on the way';
      v_body_ar := 'طلبك ' || v_order_number || ' في الطريق إليك';
    WHEN 'delivered' THEN
      v_title := 'Order Delivered';
      v_title_ar := 'تم التوصيل';
      v_body := 'Your order ' || v_order_number || ' has been delivered';
      v_body_ar := 'تم توصيل طلبك ' || v_order_number;
    WHEN 'cancelled' THEN
      v_title := 'Order Cancelled';
      v_title_ar := 'تم إلغاء الطلب';
      v_body := 'Your order ' || v_order_number || ' has been cancelled';
      v_body_ar := 'تم إلغاء طلبك ' || v_order_number;
    ELSE
      RETURN NEW;
  END CASE;

  IF v_customer_id IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://mpqupbukacjemjhyhupw.supabase.co/functions/v1/push-notification',
      body := json_build_object(
        'userId', v_customer_id,
        'orderId', NEW.id,
        'orderNumber', v_order_number,
        'title', v_title,
        'titleAr', v_title_ar,
        'body', v_body,
        'bodyAr', v_body_ar,
        'data', json_build_object('orderId', NEW.id::text, 'orderNumber', v_order_number, 'route', '/track/' || v_order_number)
      )::jsonb,
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcXVwYnVrYWNqZW1qaHlodXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDAwNTMsImV4cCI6MjA4NTE3NjA1M30.h4WXs4if8r35RfF98Pk0LHdh-o1JbmNNTiVSziKrMy8'
      )::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$;
