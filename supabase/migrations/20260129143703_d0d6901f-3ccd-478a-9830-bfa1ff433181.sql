-- Add iiko sync failure tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS iiko_sync_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS iiko_sync_error text,
ADD COLUMN IF NOT EXISTS iiko_sync_last_attempt timestamp with time zone;

-- Create index for finding orders pending iiko sync
CREATE INDEX IF NOT EXISTS idx_orders_iiko_pending_sync 
ON public.orders (iiko_synced, iiko_sync_attempts) 
WHERE iiko_synced = false AND iiko_order_id IS NULL;

-- Create admin notifications table for alerts
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  severity text NOT NULL DEFAULT 'warning',
  order_id uuid REFERENCES public.orders(id),
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamp with time zone,
  acknowledged_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_alerts
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage alerts
CREATE POLICY "Admins can manage all alerts" 
ON public.admin_alerts 
FOR ALL 
USING (is_admin());

-- Create policy for admins to view alerts
CREATE POLICY "Admins can view all alerts" 
ON public.admin_alerts 
FOR SELECT 
USING (is_admin());