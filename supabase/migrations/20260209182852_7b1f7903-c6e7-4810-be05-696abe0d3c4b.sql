
-- ============================================
-- FIX 1: Remove overly permissive order_confirmations policy
-- ============================================

-- Drop the "Secure view confirmations" policy that allows too broad access
DROP POLICY IF EXISTS "Secure view confirmations" ON public.order_confirmations;

-- ============================================
-- FIX 2: Make order-photos bucket private
-- ============================================

UPDATE storage.buckets 
SET public = false 
WHERE id = 'order-photos';

-- Drop the unrestricted public policy
DROP POLICY IF EXISTS "Anyone can view order photos" ON storage.objects;

-- Add restricted access: admins can read all
CREATE POLICY "Admins can read order photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-photos' 
  AND public.is_admin()
);

-- Customers can view photos for their own orders
CREATE POLICY "Customers read own order photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-photos'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.order_confirmations oc
    JOIN public.orders o ON o.id = oc.order_id
    WHERE oc.photo_path = storage.objects.name
    AND o.customer_id = auth.uid()
  )
);

-- ============================================
-- FIX 3: Tighten anonymous order creation policy with total cap
-- ============================================

DROP POLICY IF EXISTS "Allow order creation" ON public.orders;

CREATE POLICY "Allow order creation"
ON public.orders
FOR INSERT
WITH CHECK (
  customer_name IS NOT NULL
  AND customer_phone IS NOT NULL
  AND delivery_address IS NOT NULL
  AND items IS NOT NULL
  AND total >= 0
  AND total < 100000
  AND length(customer_name) <= 200
  AND length(customer_phone) <= 20
  AND length(delivery_address) <= 500
);

-- ============================================
-- FIX 4: Restrict store_settings to only expose non-sensitive keys
-- ============================================

DROP POLICY IF EXISTS "Store settings are publicly readable" ON public.store_settings;

CREATE POLICY "Store settings are publicly readable"
ON public.store_settings
FOR SELECT
USING (
  key IN ('business_hours', 'delivery_zones', 'minimum_order', 'store_status', 'social_links', 'announcement', 'working_hours')
  OR (auth.uid() IS NOT NULL)
);
