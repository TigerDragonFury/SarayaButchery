-- Create storage bucket for order notes audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-notes', 'order-notes', false)
ON CONFLICT (id) DO NOTHING;

-- Add audio URL column to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS notes_audio_url TEXT;

-- RLS Policies for order-notes bucket

-- Customer can upload their own audio files (path format: {user_id}/{order_id}/{filename})
CREATE POLICY "Customers can upload own order notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'order-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Customer can read their own audio files
CREATE POLICY "Customers can read own order notes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Customer can delete their own audio files
CREATE POLICY "Customers can delete own order notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'order-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin can read all order notes
CREATE POLICY "Admins can read all order notes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'order-notes' 
  AND is_admin()
);