
-- Create function to notify admins of new complaints
CREATE OR REPLACE FUNCTION public.notify_admin_new_complaint()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_admin_id uuid;
BEGIN
  IF NEW.feedback_type != 'complaint' THEN
    RETURN NEW;
  END IF;

  FOR v_admin_id IN
    SELECT user_id FROM user_roles WHERE role = 'admin'
  LOOP
    PERFORM net.http_post(
      url := 'https://mpqupbukacjemjhyhupw.supabase.co/functions/v1/push-notification',
      body := json_build_object(
        'userId', v_admin_id,
        'orderId', NEW.order_id,
        'orderNumber', NEW.order_number,
        'title', 'New Customer Complaint',
        'titleAr', 'شكوى عميل جديدة ⚠️',
        'body', 'Complaint received for order ' || COALESCE(NEW.order_number, 'Unknown') || ' from ' || COALESCE(NEW.customer_name, 'Customer'),
        'bodyAr', 'شكوى وردت للطلب ' || COALESCE(NEW.order_number, 'غير معروف') || ' من ' || COALESCE(NEW.customer_name, 'عميل'),
        'data', json_build_object('orderId', COALESCE(NEW.order_id::text, ''), 'orderNumber', COALESCE(NEW.order_number, ''), 'route', '/admin/feedback', 'feedbackId', NEW.id::text)
      )::jsonb,
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcXVwYnVrYWNqZW1qaHlodXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDAwNTMsImV4cCI6MjA4NTE3NjA1M30.h4WXs4if8r35RfF98Pk0LHdh-o1JbmNNTiVSziKrMy8'
      )::jsonb
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER notify_admin_new_complaint_trigger
AFTER INSERT ON public.customer_feedback
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_complaint();
