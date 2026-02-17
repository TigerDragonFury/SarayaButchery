-- Add iiko_order_number column to store the official POS order number
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS iiko_order_number TEXT;

-- Add idempotency_key column to prevent duplicate orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Create index for faster lookups by iiko_order_number
CREATE INDEX IF NOT EXISTS idx_orders_iiko_order_number ON public.orders(iiko_order_number);

-- Create index for idempotency key lookups
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key);

-- Comment on columns
COMMENT ON COLUMN public.orders.iiko_order_number IS 'Official order number from iiko POS system (cheque/ticket number)';
COMMENT ON COLUMN public.orders.idempotency_key IS 'Unique key to prevent duplicate order submissions';