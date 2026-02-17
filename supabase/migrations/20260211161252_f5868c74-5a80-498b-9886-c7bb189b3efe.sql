-- Fix overly permissive INSERT policy - restrict to authenticated users
DROP POLICY "Allow feedback insertion" ON public.customer_feedback;

CREATE POLICY "Authenticated users can insert feedback" ON public.customer_feedback 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);