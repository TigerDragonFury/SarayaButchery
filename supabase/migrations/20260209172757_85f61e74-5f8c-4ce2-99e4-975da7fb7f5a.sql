
-- Create trigger function to notify driver when assigned to an order
CREATE OR REPLACE FUNCTION public.notify_driver_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_driver_user_id uuid;
  v_order_number text;
BEGIN
  -- Get driver's user_id
  SELECT user_id INTO v_driver_user_id FROM drivers WHERE id = NEW.driver_id;
  
  IF v_driver_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get order number
  SELECT order_number INTO v_order_number FROM orders WHERE id = NEW.order_id;

  PERFORM net.http_post(
    url := 'https://mpqupbukacjemjhyhupw.supabase.co/functions/v1/push-notification',
    body := json_build_object(
      'userId', v_driver_user_id,
      'orderId', NEW.order_id,
      'orderNumber', v_order_number,
      'title', 'New Delivery Assigned',
      'titleAr', 'طلب توصيل جديد 🚗',
      'body', 'You have been assigned order ' || v_order_number,
      'bodyAr', 'تم تعيينك على الطلب ' || v_order_number,
      'data', json_build_object('orderId', NEW.order_id::text, 'orderNumber', v_order_number, 'route', '/driver')
    )::jsonb,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcXVwYnVrYWNqZW1qaHlodXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDAwNTMsImV4cCI6MjA4NTE3NjA1M30.h4WXs4if8r35RfF98Pk0LHdh-o1JbmNNTiVSziKrMy8'
    )::jsonb
  );

  RETURN NEW;
END;
$$;

-- Trigger on driver_orders insert
DROP TRIGGER IF EXISTS trigger_notify_driver_assigned ON public.driver_orders;
CREATE TRIGGER trigger_notify_driver_assigned
  AFTER INSERT ON public.driver_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_driver_assigned();
