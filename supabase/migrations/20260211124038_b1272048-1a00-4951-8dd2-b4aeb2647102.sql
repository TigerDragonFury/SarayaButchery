-- Add compare_at_price column for discount calculation
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price numeric DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.products.compare_at_price IS 'Original price before discount. If set and higher than price, a discount badge is shown.';