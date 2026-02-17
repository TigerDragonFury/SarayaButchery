
-- Initialize store_settings with our_products subcategories
INSERT INTO public.store_settings (key, value)
VALUES ('our_products_categories', '[
  {"id": "spices", "name_ar": "البهارات", "name_en": "Spices", "href": "/shop/spices", "sort_order": 1, "is_active": true},
  {"id": "frozen", "name_ar": "المفرزنات", "name_en": "Frozen", "href": "/shop/frozen", "sort_order": 2, "is_active": true},
  {"id": "olive-oil", "name_ar": "زيت الزيتون", "name_en": "Olive Oil", "href": "/shop/olive-oil", "sort_order": 3, "is_active": true},
  {"id": "ghee", "name_ar": "السمنة البلدي", "name_en": "Ghee", "href": "/shop/ghee", "sort_order": 4, "is_active": true},
  {"id": "jameed", "name_ar": "الجميد", "name_en": "Jameed", "href": "/shop/jameed", "sort_order": 5, "is_active": true},
  {"id": "dates", "name_ar": "التمر", "name_en": "Dates", "href": "/shop/dates", "sort_order": 6, "is_active": true}
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Update the public read policy to include the new key
DROP POLICY IF EXISTS "Public can read non-sensitive store settings" ON public.store_settings;
CREATE POLICY "Public can read non-sensitive store settings"
ON public.store_settings
FOR SELECT
USING (key = ANY (ARRAY['business_hours', 'delivery_zones', 'minimum_order', 'store_status', 'social_links', 'announcement', 'working_hours', 'best_sellers', 'our_products_categories']));
