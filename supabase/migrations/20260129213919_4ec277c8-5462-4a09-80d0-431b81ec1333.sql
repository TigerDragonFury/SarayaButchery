-- Customer can manage items of their own orders
-- Note: Using customer_id instead of user_id (orders table schema)
CREATE POLICY "customer manage own order items"
ON public.order_items FOR ALL
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE customer_id = auth.uid()
  )
)
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders WHERE customer_id = auth.uid()
  )
);

-- Admin full access via get_user_role (alternative to existing is_admin policy)
CREATE POLICY "admin full access order items v2"
ON public.order_items FOR ALL
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- Driver can view order items via driver_orders junction
CREATE POLICY "driver view order items via assignment"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.driver_orders dord
    JOIN public.drivers drv ON drv.id = dord.driver_id
    JOIN public.orders ord ON ord.id = dord.order_id
    WHERE ord.id = order_items.order_id
    AND drv.user_id = auth.uid()
  )
);