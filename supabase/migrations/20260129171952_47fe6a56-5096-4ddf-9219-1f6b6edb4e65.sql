-- Fix the overly permissive INSERT policy for voice notes
-- Drop the permissive policy
DROP POLICY IF EXISTS "Anyone can create voice notes" ON public.order_voice_notes;

-- Create a more restrictive policy that validates the order exists
CREATE POLICY "Insert voice notes for valid orders"
ON public.order_voice_notes FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Must reference a valid order
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_voice_notes.order_id
  )
);