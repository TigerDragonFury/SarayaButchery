
-- Remove duplicate/overlapping policies on order_items

-- 1. Drop duplicate admin policy (keep "Admins can manage all order items" which uses is_admin())
DROP POLICY IF EXISTS "admin full access order items v2" ON public.order_items;

-- 2. Drop duplicate customer policy (keep "Customers can view own order items" for SELECT, and "Allow order items insertion" for INSERT)
DROP POLICY IF EXISTS "customer manage own order items" ON public.order_items;

-- 3. Drop duplicate driver policy (keep "Drivers can view assigned order items" which is simpler)
DROP POLICY IF EXISTS "driver view order items via assignment" ON public.order_items;
