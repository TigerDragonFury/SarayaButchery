-- Fix security issue: Order confirmations should not be publicly viewable without authentication
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view confirmations by order lookup" ON public.order_confirmations;

-- Create a more secure policy that only allows viewing by order number lookup
-- This requires the user to know the specific order_id
CREATE POLICY "View confirmations by order id" 
ON public.order_confirmations 
FOR SELECT 
USING (
  -- Authenticated users can view their own orders' confirmations
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_confirmations.order_id 
    AND orders.customer_id = auth.uid()
  ))
  OR
  -- Admins can view all confirmations
  public.is_admin()
  OR
  -- Butchers/staff can view confirmations they created
  (auth.uid() IS NOT NULL AND order_confirmations.created_by = auth.uid())
);

-- Also secure driver_live_tracking_view by adding RLS to underlying tables if not already
-- This view inherits from orders and driver_locations which are already secured