-- Create table for order preparation photos and customer confirmations
CREATE TABLE public.order_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL,
  photo_note TEXT,
  confirmation_status TEXT NOT NULL DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'approved', 'change_requested')),
  customer_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.order_confirmations ENABLE ROW LEVEL SECURITY;

-- Admins/butchers can manage all confirmations
CREATE POLICY "Admins can manage all confirmations"
ON public.order_confirmations
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Customers can view confirmations for their orders
CREATE POLICY "Customers can view their order confirmations"
ON public.order_confirmations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_confirmations.order_id
    AND o.customer_id = auth.uid()
  )
);

-- Customers can update (approve/request change) their order confirmations
CREATE POLICY "Customers can respond to their order confirmations"
ON public.order_confirmations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_confirmations.order_id
    AND o.customer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_confirmations.order_id
    AND o.customer_id = auth.uid()
  )
);

-- Allow anonymous/public read for order confirmation by order number (for tracking page)
CREATE POLICY "Public can view confirmations by order lookup"
ON public.order_confirmations
FOR SELECT
USING (true);

-- Create storage bucket for order photos
INSERT INTO storage.buckets (id, name, public) VALUES ('order-photos', 'order-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for order photos
CREATE POLICY "Admins can upload order photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'order-photos' AND public.is_admin());

CREATE POLICY "Anyone can view order photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'order-photos');

CREATE POLICY "Admins can delete order photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'order-photos' AND public.is_admin());

-- Enable realtime for confirmations
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_confirmations;