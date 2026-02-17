-- Create customer_feedback table
CREATE TABLE public.customer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  order_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('rating', 'suggestion', 'complaint')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all feedback" ON public.customer_feedback FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Allow feedback insertion" ON public.customer_feedback FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_customer_feedback_updated_at
  BEFORE UPDATE ON public.customer_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_feedback;