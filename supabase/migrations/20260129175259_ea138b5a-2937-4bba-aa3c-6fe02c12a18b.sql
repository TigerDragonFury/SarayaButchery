-- Create table for customer order preferences (favorite cuts with their preferences)
CREATE TABLE public.customer_order_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_name_en TEXT,
  preferred_quantity NUMERIC NOT NULL DEFAULT 1,
  preferred_unit TEXT NOT NULL DEFAULT 'kg' CHECK (preferred_unit IN ('kg', 'piece', 'box')),
  preferred_notes TEXT,
  last_voice_note_path TEXT,
  last_voice_note_duration INTEGER,
  order_count INTEGER NOT NULL DEFAULT 1,
  last_ordered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- Enable RLS
ALTER TABLE public.customer_order_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can view own preferences"
ON public.customer_order_preferences
FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
ON public.customer_order_preferences
FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own preferences"
ON public.customer_order_preferences
FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own preferences"
ON public.customer_order_preferences
FOR DELETE
USING (customer_id = auth.uid());

-- Admins can view all preferences (for analytics)
CREATE POLICY "Admins can view all preferences"
ON public.customer_order_preferences
FOR SELECT
USING (public.is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_customer_order_preferences_updated_at
BEFORE UPDATE ON public.customer_order_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for preferences
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_order_preferences;