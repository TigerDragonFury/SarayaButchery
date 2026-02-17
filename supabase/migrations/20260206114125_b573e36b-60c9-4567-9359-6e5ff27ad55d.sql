-- Create store_settings table for centralized configuration
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read store settings
CREATE POLICY "Store settings are publicly readable"
ON public.store_settings
FOR SELECT
USING (true);

-- Only admins can manage store settings
CREATE POLICY "Admins can manage store settings"
ON public.store_settings
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default store location
INSERT INTO public.store_settings (key, value) VALUES (
  'location',
  '{
    "name_en": "Al Saraya Butchery - Al Bateen",
    "name_ar": "ملحمة السرايا - البطين",
    "street_en": "7 Ash Shoulah Street, Al Bateen W10",
    "street_ar": "شارع الشولة 7 - البطين W10",
    "building_en": "Al Hana Tower",
    "building_ar": "برج الهناء",
    "city_en": "Abu Dhabi",
    "city_ar": "أبوظبي",
    "country_en": "United Arab Emirates",
    "country_ar": "الإمارات العربية المتحدة",
    "plus_code": "F8CQ+CWH",
    "latitude": 24.4574,
    "longitude": 54.3364,
    "google_maps_url": "https://maps.app.goo.gl/9aWnaRme1t6AtXTp6",
    "google_maps_embed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.5!2d54.3344!3d24.4574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e41278a6c89d5%3A0x6c13e4a1acf8cd8!2sAl%20Saraya%20butcher%20-%20%D9%85%D9%84%D8%AD%D9%85%D8%A9%20%D8%A7%D9%84%D8%B3%D8%B1%D8%A7%D9%8A%D8%A7!5e0!3m2!1sen!2sae!4v1"
  }'::jsonb
);

-- Insert contact information
INSERT INTO public.store_settings (key, value) VALUES (
  'contact',
  '{
    "phone": "023339111",
    "phone_intl": "+971-2-333-9111",
    "whatsapp": "971566808565",
    "email": "info@alsarayabutcheryllc.com",
    "website": "https://alsarayabutcheryllc.com"
  }'::jsonb
);

-- Insert operating hours
INSERT INTO public.store_settings (key, value) VALUES (
  'hours',
  '{
    "opening": "08:00",
    "closing": "23:00",
    "display_en": "8 AM - 11 PM",
    "display_ar": "8 ص - 11 م",
    "friday_opening": "08:00",
    "friday_closing": "23:00"
  }'::jsonb
);

-- Insert social media links
INSERT INTO public.store_settings (key, value) VALUES (
  'social',
  '{
    "instagram": "https://www.instagram.com/alsarayabutchery",
    "facebook": "https://www.facebook.com/share/1FKCgTe4fD/",
    "tiktok": "https://www.tiktok.com/@alsarayabutchery"
  }'::jsonb
);