-- =============================================
-- FIX: Profiles table - deny anonymous access
-- =============================================

-- Explicitly deny anonymous access to profiles
CREATE POLICY "Deny anonymous access to profiles"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (false);

-- =============================================
-- FIX: Admin alerts table - deny anonymous access  
-- =============================================

-- Explicitly deny anonymous access to admin_alerts
CREATE POLICY "Deny anonymous access to admin_alerts"
  ON public.admin_alerts
  FOR SELECT
  TO anon
  USING (false);

-- =============================================
-- FIX: Notifications - deny anonymous access
-- =============================================

CREATE POLICY "Deny anonymous access to notifications"
  ON public.notifications
  FOR SELECT
  TO anon
  USING (false);