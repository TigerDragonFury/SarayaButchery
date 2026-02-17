-- Create delivery zones table for managing delivery areas, fees, and ETAs
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  delivery_fee NUMERIC NOT NULL DEFAULT 15,
  free_delivery_threshold NUMERIC NOT NULL DEFAULT 250,
  estimated_minutes_min INTEGER NOT NULL DEFAULT 30,
  estimated_minutes_max INTEGER NOT NULL DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Only admins can manage delivery zones
CREATE POLICY "Admins can manage delivery zones"
ON public.delivery_zones
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Public can read active zones (for checkout)
CREATE POLICY "Public can read active delivery zones"
ON public.delivery_zones
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_zones_updated_at
BEFORE UPDATE ON public.delivery_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default UAE delivery zones
INSERT INTO public.delivery_zones (name, name_ar, delivery_fee, free_delivery_threshold, estimated_minutes_min, estimated_minutes_max, is_active) VALUES
('Dubai', 'دبي', 15, 250, 30, 60, true),
('Sharjah', 'الشارقة', 20, 300, 45, 90, true),
('Ajman', 'عجمان', 25, 350, 60, 120, true),
('Abu Dhabi', 'أبوظبي', 35, 400, 90, 150, false),
('Ras Al Khaimah', 'رأس الخيمة', 40, 450, 120, 180, false);