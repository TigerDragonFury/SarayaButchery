-- 1. Remove the insecure public access policy
DROP POLICY IF EXISTS "Public can view available drivers" ON public.drivers;

-- 2. Create a secure view for live tracking (no personal data exposed)
CREATE OR REPLACE VIEW public.driver_live_tracking_view
WITH (security_invoker = on) AS
SELECT 
  o.id AS order_id,
  o.order_number,
  o.status,
  dl.latitude AS driver_lat,
  dl.longitude AS driver_lng,
  dl.heading,
  dl.speed,
  dl.created_at AS location_updated_at
FROM public.orders o
LEFT JOIN public.driver_locations dl ON o.driver_id = dl.driver_id
WHERE o.status = 'out_for_delivery'::order_status
  AND dl.id = (
    SELECT id FROM public.driver_locations 
    WHERE driver_id = o.driver_id 
    ORDER BY created_at DESC 
    LIMIT 1
  );

-- 3. Add policy for customers to access their own order tracking via the orders table
-- (The view inherits RLS from underlying tables due to security_invoker)

-- 4. Add a function for public order tracking by order number (no auth required)
CREATE OR REPLACE FUNCTION public.get_order_tracking(p_order_number text)
RETURNS TABLE (
  order_id uuid,
  order_number text,
  status order_status,
  driver_lat numeric,
  driver_lng numeric,
  heading numeric,
  speed numeric,
  location_updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id AS order_id,
    o.order_number,
    o.status,
    dl.latitude AS driver_lat,
    dl.longitude AS driver_lng,
    dl.heading,
    dl.speed,
    dl.created_at AS location_updated_at
  FROM orders o
  LEFT JOIN driver_locations dl ON o.driver_id = dl.driver_id
  WHERE o.order_number = p_order_number
    AND o.status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered')
    AND (dl.id IS NULL OR dl.id = (
      SELECT id FROM driver_locations 
      WHERE driver_id = o.driver_id 
      ORDER BY created_at DESC 
      LIMIT 1
    ))
  LIMIT 1;
$$;

-- 5. Grant execute permission on the tracking function to anonymous users
GRANT EXECUTE ON FUNCTION public.get_order_tracking(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(text) TO authenticated;

-- 6. Add comment for documentation
COMMENT ON FUNCTION public.get_order_tracking IS 'Secure function for public order tracking - returns only order status and driver location, no personal data';
COMMENT ON VIEW public.driver_live_tracking_view IS 'Secure view for authenticated order tracking - no driver personal data exposed';