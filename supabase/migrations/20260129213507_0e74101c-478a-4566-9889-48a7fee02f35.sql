-- Function to get user role from profiles (for display purposes)
-- Note: For authorization, use has_role() which checks user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Also create a convenience function to get role from user_roles (authoritative)
CREATE OR REPLACE FUNCTION public.get_user_auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_role() IS 'Gets display role from profiles - use get_user_auth_role() or has_role() for authorization';
COMMENT ON FUNCTION public.get_user_auth_role() IS 'Gets authoritative role from user_roles table';