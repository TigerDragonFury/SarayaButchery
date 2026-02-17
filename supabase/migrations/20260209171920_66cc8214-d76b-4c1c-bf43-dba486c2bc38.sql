
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to send FCM notification on order status change
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
  -- Only fire when status actually changes
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  v_order_number := NEW.order_number;
  v_customer_id := NEW.customer_id;

  -- Set notification content based on new status
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

  -- Send notification via edge function (non-blocking)
  IF v_customer_id IS NOT NULL THEN
    PERFORM extensions.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/push-notification',
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
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
      )::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON public.orders;
CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();
