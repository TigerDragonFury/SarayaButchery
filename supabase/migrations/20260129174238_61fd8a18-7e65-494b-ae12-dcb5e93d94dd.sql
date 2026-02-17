-- Create order messages table for two-way communication
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('butcher', 'customer')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice')),
  content TEXT,
  storage_path TEXT,
  duration_seconds INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Customers can view messages for their orders
CREATE POLICY "Customers can view their order messages"
ON public.order_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_messages.order_id 
    AND orders.customer_id = auth.uid()
  )
);

-- Customers can insert their own messages
CREATE POLICY "Customers can send messages"
ON public.order_messages
FOR INSERT
WITH CHECK (
  sender_type = 'customer' AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_messages.order_id 
    AND orders.customer_id = auth.uid()
  )
);

-- Admins/butchers can view all messages
CREATE POLICY "Admins can view all messages"
ON public.order_messages
FOR SELECT
USING (public.is_admin());

-- Admins/butchers can insert messages
CREATE POLICY "Admins can send messages"
ON public.order_messages
FOR INSERT
WITH CHECK (public.is_admin() AND sender_type = 'butcher');

-- Admins can update messages (mark as read)
CREATE POLICY "Admins can update messages"
ON public.order_messages
FOR UPDATE
USING (public.is_admin());

-- Customers can update their messages (mark as read)
CREATE POLICY "Customers can update message read status"
ON public.order_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_messages.order_id 
    AND orders.customer_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX idx_order_messages_product_id ON public.order_messages(order_id, product_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;