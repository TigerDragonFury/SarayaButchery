
-- Create trigger function to notify admins on new order
CREATE OR REPLACE FUNCTION public.notify_admin_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Send to all admin users via their push tokens
  FOR v_admin_id IN
    SELECT user_id FROM user_roles WHERE role = 'admin'
  LOOP
    PERFORM net.http_post(
      url := 'https://mpqupbukacjemjhyhupw.supabase.co/functions/v1/push-notification',
      body := json_build_object(
        'userId', v_admin_id,
        'orderId', NEW.id,
        'orderNumber', NEW.order_number,
        'title', 'New Order',
        'titleAr', 'طلب جديد 🔔',
        'body', 'New order ' || NEW.order_number || ' from ' || NEW.customer_name,
        'bodyAr', 'طلب جديد ' || NEW.order_number || ' من ' || NEW.customer_name,
        'topic', 'admin_orders',
        'data', json_build_object('orderId', NEW.id::text, 'orderNumber', NEW.order_number, 'route', '/admin/orders')
      )::jsonb,
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcXVwYnVrYWNqZW1qaHlodXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDAwNTMsImV4cCI6MjA4NTE3NjA1M30.h4WXs4if8r35RfF98Pk0LHdh-o1JbmNNTiVSziKrMy8'
      )::jsonb
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on new order insert
DROP TRIGGER IF EXISTS trigger_notify_admin_new_order ON public.orders;
CREATE TRIGGER trigger_notify_admin_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_order();
