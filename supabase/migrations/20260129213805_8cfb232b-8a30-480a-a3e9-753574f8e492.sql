-- Driver select via driver_orders junction table
-- Note: Using "dord" alias instead of "do" (reserved keyword)
CREATE POLICY "driver select via driver_orders"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.driver_orders dord
    JOIN public.drivers drv ON drv.id = dord.driver_id
    WHERE dord.order_id = orders.id
    AND drv.user_id = auth.uid()
  )
);

-- Driver can update orders assigned via driver_orders
CREATE POLICY "driver update via driver_orders"
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.driver_orders dord
    JOIN public.drivers drv ON drv.id = dord.driver_id
    WHERE dord.order_id = orders.id
    AND drv.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.driver_orders dord
    JOIN public.drivers drv ON drv.id = dord.driver_id
    WHERE dord.order_id = orders.id
    AND drv.user_id = auth.uid()
  )
);