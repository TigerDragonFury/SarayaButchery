-- Add pickup/delivery and scheduling fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'delivery' CHECK (order_type IN ('pickup', 'delivery')),
ADD COLUMN IF NOT EXISTS scheduled_date date,
ADD COLUMN IF NOT EXISTS scheduled_time_slot text,
ADD COLUMN IF NOT EXISTS branch_name text DEFAULT 'Abu Dhabi Main Branch';

-- Add comment for documentation
COMMENT ON COLUMN public.orders.order_type IS 'pickup = customer picks up from store, delivery = deliver to customer address';
COMMENT ON COLUMN public.orders.scheduled_date IS 'Date for pickup or delivery';
COMMENT ON COLUMN public.orders.scheduled_time_slot IS 'Time slot like "10:00 - 12:00"';
COMMENT ON COLUMN public.orders.branch_name IS 'Branch name for pickup orders';