-- SECURITY FIX: remove overly permissive policy
DROP POLICY IF EXISTS "Public order creation" ON public.orders;

-- Allow order creation for anon + authenticated with basic sanity checks
CREATE POLICY "Allow order creation" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  customer_name IS NOT NULL 
  AND customer_phone IS NOT NULL 
  AND delivery_address IS NOT NULL 
  AND items IS NOT NULL 
  AND total >= 0
);
