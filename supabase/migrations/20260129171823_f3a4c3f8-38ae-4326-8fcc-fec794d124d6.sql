-- Create voice-notes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-notes', 
  'voice-notes', 
  false,
  1048576, -- 1MB max file size
  ARRAY['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav']
);

-- RLS: Allow authenticated users to upload their own voice notes
CREATE POLICY "Users can upload voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-notes');

-- RLS: Allow users to read voice notes (via signed URL only, handled by backend)
CREATE POLICY "Admins can read all voice notes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-notes' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RLS: Allow service role to manage voice notes (for cleanup)
CREATE POLICY "Service role manages voice notes"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'voice-notes')
WITH CHECK (bucket_id = 'voice-notes');

-- Add voice_note_url column to store voice note references in order items
-- Since items is JSONB, we'll add a separate table for voice notes
CREATE TABLE public.order_voice_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT, -- Optional: specific product in the order
  storage_path TEXT NOT NULL, -- Path in storage bucket
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_voice_notes ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can insert (for checkout)
CREATE POLICY "Anyone can create voice notes"
ON public.order_voice_notes FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- RLS: Admins can read all voice notes
CREATE POLICY "Admins can read voice notes"
ON public.order_voice_notes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RLS: Customers can read their own order's voice notes
CREATE POLICY "Customers read own voice notes"
ON public.order_voice_notes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_voice_notes.order_id 
    AND customer_id = auth.uid()
  )
);

-- Add index for fast lookups
CREATE INDEX idx_order_voice_notes_order_id ON public.order_voice_notes(order_id);