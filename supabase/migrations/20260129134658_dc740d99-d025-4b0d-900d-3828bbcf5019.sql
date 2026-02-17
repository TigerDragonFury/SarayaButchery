-- Fix the overly permissive INSERT policy on orders
-- Replace with a more secure policy that validates required fields

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Allow creating orders but require proper customer info
CREATE POLICY "Anyone can create orders with valid info" ON public.orders
  FOR INSERT WITH CHECK (
    customer_name IS NOT NULL 
    AND customer_phone IS NOT NULL 
    AND delivery_address IS NOT NULL
    AND items IS NOT NULL
    AND total >= 0
  );