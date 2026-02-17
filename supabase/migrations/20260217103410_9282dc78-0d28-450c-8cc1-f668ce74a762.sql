-- Create secure RPC function for attaching products to menu
-- Uses SECURITY DEFINER to bypass RLS, with internal admin check
CREATE OR REPLACE FUNCTION public.attach_products_to_menu(
  p_menu_id uuid,
  p_product_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_sort integer;
  v_new_count integer := 0;
  v_product_id uuid;
BEGIN
  -- Enforce admin check
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied: admin role required', 'inserted', 0);
  END IF;

  -- Verify menu exists
  IF NOT EXISTS (SELECT 1 FROM menus WHERE id = p_menu_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Menu not found', 'inserted', 0);
  END IF;

  -- Get current max sort_order
  SELECT COALESCE(MAX(sort_order), 0) INTO v_max_sort
  FROM menu_products WHERE menu_id = p_menu_id;

  -- Insert only products not already linked
  FOREACH v_product_id IN ARRAY p_product_ids
  LOOP
    IF NOT EXISTS (SELECT 1 FROM menu_products WHERE menu_id = p_menu_id AND product_id = v_product_id) THEN
      v_max_sort := v_max_sort + 1;
      INSERT INTO menu_products (menu_id, product_id, sort_order)
      VALUES (p_menu_id, v_product_id, v_max_sort);
      v_new_count := v_new_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'inserted', v_new_count, 'total_requested', array_length(p_product_ids, 1));
END;
$$;

-- Create secure RPC for removing a product from menu
CREATE OR REPLACE FUNCTION public.remove_product_from_menu(
  p_menu_id uuid,
  p_product_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permission denied: admin role required');
  END IF;

  DELETE FROM menu_products WHERE menu_id = p_menu_id AND product_id = p_product_id;

  RETURN jsonb_build_object('success', true);
END;
$$;