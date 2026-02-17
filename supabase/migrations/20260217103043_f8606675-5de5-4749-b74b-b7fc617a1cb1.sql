-- Fix menu_products: all policies are RESTRICTIVE which means NO access at all
-- Drop restrictive policies and recreate as PERMISSIVE

DROP POLICY IF EXISTS "Admins can manage menu products" ON public.menu_products;
DROP POLICY IF EXISTS "Anyone can view menu products" ON public.menu_products;

CREATE POLICY "Admins can manage menu products"
ON public.menu_products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Anyone can view menu products"
ON public.menu_products
FOR SELECT
TO anon, authenticated
USING (true);

-- Fix menus table too (same issue)
DROP POLICY IF EXISTS "Admins can manage menus" ON public.menus;
DROP POLICY IF EXISTS "Anyone can view active menus" ON public.menus;

CREATE POLICY "Admins can manage menus"
ON public.menus
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Anyone can view active menus"
ON public.menus
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Fix menu_categories too
DROP POLICY IF EXISTS "Admins can manage menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Anyone can view menu categories" ON public.menu_categories;

CREATE POLICY "Admins can manage menu categories"
ON public.menu_categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Anyone can view menu categories"
ON public.menu_categories
FOR SELECT
TO anon, authenticated
USING (true);