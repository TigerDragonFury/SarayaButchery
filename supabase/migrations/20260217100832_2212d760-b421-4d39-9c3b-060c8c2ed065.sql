
-- Create menus table
CREATE TABLE public.menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_on_mobile BOOLEAN NOT NULL DEFAULT true,
  show_on_desktop BOOLEAN NOT NULL DEFAULT true,
  auto_sync BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create menu_products junction table
CREATE TABLE public.menu_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(menu_id, product_id)
);

-- Create menu_categories junction table
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(menu_id, category_id)
);

-- Indexes
CREATE INDEX idx_menu_products_menu ON public.menu_products(menu_id);
CREATE INDEX idx_menu_products_product ON public.menu_products(product_id);
CREATE INDEX idx_menu_categories_menu ON public.menu_categories(menu_id);

-- Enable RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Public read for active menus
CREATE POLICY "Anyone can view active menus" ON public.menus FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage menus" ON public.menus FOR ALL USING (public.is_admin());

-- Public read for menu_products
CREATE POLICY "Anyone can view menu products" ON public.menu_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu products" ON public.menu_products FOR ALL USING (public.is_admin());

-- Public read for menu_categories
CREATE POLICY "Anyone can view menu categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu categories" ON public.menu_categories FOR ALL USING (public.is_admin());

-- Updated_at trigger for menus
CREATE TRIGGER update_menus_updated_at
BEFORE UPDATE ON public.menus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default "Website Menu"
INSERT INTO public.menus (name_ar, name_en, slug, is_active, sort_order)
VALUES ('قائمة الموقع', 'Website Menu', 'website-menu', true, 0);
