-- Drop the existing insert policy
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;

-- Create a simpler policy that allows anyone to insert orders
-- Using TRUE for with_check since validation will be done at application level
CREATE POLICY "Public order creation" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);