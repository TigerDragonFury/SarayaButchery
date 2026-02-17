-- Remove the duplicate permissive policy that was left over
DROP POLICY IF EXISTS "View confirmations by order id" ON public.order_confirmations;

-- Create a proper secure policy that allows:
-- 1. Customers to view their own order confirmations
-- 2. Admins to view all
-- 3. Staff who created the confirmation to view it
CREATE POLICY "Secure view confirmations" 
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
  -- Staff can view confirmations they created
  (auth.uid() IS NOT NULL AND order_confirmations.created_by = auth.uid())
);