-- Allow store owners to permanently delete their orders (needed for "Clear archive")
-- order_items rows are removed automatically via ON DELETE CASCADE.
CREATE POLICY "Store owners can delete orders"
  ON public.orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = orders.store_id AND stores.user_id = auth.uid()
    )
  );