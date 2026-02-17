
-- Update the store_settings public read policy to include best_sellers key
DROP POLICY IF EXISTS "Public can read non-sensitive store settings" ON public.store_settings;
CREATE POLICY "Public can read non-sensitive store settings" 
ON public.store_settings 
FOR SELECT 
USING (key IN ('business_hours', 'delivery_zones', 'minimum_order', 'store_status', 'social_links', 'announcement', 'working_hours', 'best_sellers'));

-- Insert default best_sellers setting if not exists
INSERT INTO public.store_settings (key, value)
VALUES ('best_sellers', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
