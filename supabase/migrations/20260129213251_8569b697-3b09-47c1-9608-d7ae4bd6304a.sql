-- =====================================================
-- 1. PRODUCTS TABLE - For iiko/Syrve sync
-- =====================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iiko_id TEXT UNIQUE, -- iiko/Syrve product UUID for sync
  name_ar TEXT NOT NULL,
  name_en TEXT,
  category TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  price_per TEXT DEFAULT 'kg', -- kg, piece, box
  is_box BOOLEAN DEFAULT false,
  allow_add_to_cart BOOLEAN DEFAULT true,
  image_url TEXT,
  description_ar TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for products
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_iiko_id ON public.products(iiko_id);
CREATE INDEX idx_products_active ON public.products(is_active);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable (for shop display)
CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT
USING (is_active = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- 2. DRIVER_ORDERS TABLE - Junction for driver assignments
-- =====================================================
CREATE TABLE public.driver_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID, -- Admin who assigned
  status TEXT DEFAULT 'assigned', -- assigned, accepted, declined, completed
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(order_id, driver_id)
);

-- Indexes
CREATE INDEX idx_driver_orders_order ON public.driver_orders(order_id);
CREATE INDEX idx_driver_orders_driver ON public.driver_orders(driver_id);
CREATE INDEX idx_driver_orders_status ON public.driver_orders(status);

-- Enable RLS
ALTER TABLE public.driver_orders ENABLE ROW LEVEL SECURITY;

-- Admins can manage all driver orders
CREATE POLICY "Admins can manage driver orders"
ON public.driver_orders FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Drivers can view their own assignments
CREATE POLICY "Drivers can view own assignments"
ON public.driver_orders FOR SELECT
USING (driver_id = get_driver_id());

-- Drivers can update their own assignments (accept/decline)
CREATE POLICY "Drivers can update own assignments"
ON public.driver_orders FOR UPDATE
USING (driver_id = get_driver_id())
WITH CHECK (driver_id = get_driver_id());

-- =====================================================
-- 3. ADD ROLE COLUMN TO PROFILES (for display only)
-- Note: Actual authorization uses user_roles table
-- =====================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Add comment to clarify this is for display only
COMMENT ON COLUMN public.profiles.role IS 'Display role only - actual authorization uses user_roles table';

-- =====================================================
-- 4. UPDATE order_items to reference products table
-- =====================================================
-- Add foreign key to products (optional - product_id can be text for flexibility)
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_uuid UUID REFERENCES public.products(id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_order_items_product_uuid ON public.order_items(product_uuid);