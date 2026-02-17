-- Allow public reading of seasonal_events from store_settings
DROP POLICY IF EXISTS "Public can read non-sensitive store settings" ON public.store_settings;

CREATE POLICY "Public can read non-sensitive store settings"
ON public.store_settings
FOR SELECT
USING (key = ANY (ARRAY['business_hours'::text, 'delivery_zones'::text, 'minimum_order'::text, 'store_status'::text, 'social_links'::text, 'announcement'::text, 'working_hours'::text, 'best_sellers'::text, 'our_products_categories'::text, 'seasonal_events'::text]));