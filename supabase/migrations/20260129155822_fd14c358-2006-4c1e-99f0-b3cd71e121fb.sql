-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create policy explicitly for both anon and authenticated users
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