-- =============================================
-- FIX: Replace driver_live_tracking_view with a secure function
-- Views cannot have RLS, so we use a SECURITY DEFINER function
-- that enforces access control
-- =============================================

-- Create a secure function to get driver tracking data
CREATE OR REPLACE FUNCTION public.get_driver_live_tracking()
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid := auth.uid();
  user_is_admin boolean;
  user_driver_id uuid;
BEGIN
  -- Anonymous users get nothing
  IF user_id IS NULL THEN
    RETURN;
  END IF;

  -- Check if user is admin
  SELECT public.is_admin() INTO user_is_admin;
  
  -- Check if user is a driver
  SELECT id INTO user_driver_id FROM public.drivers WHERE drivers.user_id = user_id;

  -- Admins can see all active tracking data
  IF user_is_admin THEN
    RETURN QUERY
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
      AND (dl.id IS NULL OR dl.id = (
        SELECT id FROM public.driver_locations 
        WHERE driver_id = o.driver_id 
        ORDER BY created_at DESC 
        LIMIT 1
      ));
    RETURN;
  END IF;

  -- Drivers can only see their own assigned orders
  IF user_driver_id IS NOT NULL THEN
    RETURN QUERY
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
      AND o.driver_id = user_driver_id
      AND (dl.id IS NULL OR dl.id = (
        SELECT id FROM public.driver_locations 
        WHERE driver_id = o.driver_id 
        ORDER BY created_at DESC 
        LIMIT 1
      ));
    RETURN;
  END IF;

  -- Customers can only see their own orders' driver location
  RETURN QUERY
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
    AND o.customer_id = user_id
    AND (dl.id IS NULL OR dl.id = (
      SELECT id FROM public.driver_locations 
      WHERE driver_id = o.driver_id 
      ORDER BY created_at DESC 
      LIMIT 1
    ));
END;
$$;

-- Revoke from anon, grant only to authenticated
REVOKE ALL ON FUNCTION public.get_driver_live_tracking() FROM anon;
REVOKE ALL ON FUNCTION public.get_driver_live_tracking() FROM public;
GRANT EXECUTE ON FUNCTION public.get_driver_live_tracking() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_driver_live_tracking() TO service_role;

-- Add comment documenting security
COMMENT ON FUNCTION public.get_driver_live_tracking() IS 
'Secure function for driver live tracking. Access control: Admins see all, drivers see own orders, customers see own orders only. Anonymous access denied.';