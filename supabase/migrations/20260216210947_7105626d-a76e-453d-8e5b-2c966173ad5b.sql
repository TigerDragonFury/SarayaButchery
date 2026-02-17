
-- Add slug and is_deleted columns to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Create unique index on slug (only for non-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_unique ON public.categories (slug) WHERE is_deleted = false;

-- Create product_categories junction table for multi-category support
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Enable RLS on product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_categories
CREATE POLICY "Public can read product categories"
  ON public.product_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product categories"
  ON public.product_categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Generate slug from name_en for existing categories
UPDATE public.categories
SET slug = lower(regexp_replace(name_en, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;
