-- Create order_items table for normalized order data
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_name_en TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'kg',
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  voice_note_path TEXT,
  voice_note_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster order lookups
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items
-- Customers can view their own order items
CREATE POLICY "Customers can view own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Drivers can view assigned order items (but no prices - handled in app layer)
CREATE POLICY "Drivers can view assigned order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.driver_id = get_driver_id()
  )
);

-- Admins can manage all order items
CREATE POLICY "Admins can manage all order items"
ON public.order_items
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Allow inserting order items when creating orders
CREATE POLICY "Allow order items insertion"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
  )
);

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to order_items"
ON public.order_items
FOR SELECT
USING (false);

-- Add comments for documentation
COMMENT ON TABLE public.order_items IS 'Normalized order items extracted from orders.items JSONB';
COMMENT ON COLUMN public.order_items.product_id IS 'Product ID (matches iiko/Syrve product UUID when synced)';
COMMENT ON COLUMN public.order_items.voice_note_path IS 'Storage path for voice note instructions';