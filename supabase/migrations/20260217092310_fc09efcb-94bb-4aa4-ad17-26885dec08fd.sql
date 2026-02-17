-- Allow public read of design settings keys
DROP POLICY IF EXISTS "Store settings are publicly readable" ON public.store_settings;
CREATE POLICY "Store settings are publicly readable" 
ON public.store_settings 
FOR SELECT 
USING (
  key = ANY (ARRAY[
    'business_hours', 'delivery_zones', 'minimum_order', 'store_status', 
    'social_links', 'announcement', 'working_hours', 'best_sellers', 
    'our_products_categories', 'seasonal_events',
    'design_theme', 'design_sections', 'design_product_card', 
    'active_seasonal_theme', 'seasonal_mode_enabled'
  ])
  OR (auth.uid() IS NOT NULL)
);