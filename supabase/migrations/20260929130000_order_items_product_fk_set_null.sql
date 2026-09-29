-- Allow products to be deleted even when they appear in order history.
-- order_items snapshots product_name and product_price at purchase time,
-- so the product row is not needed for order records or revenue analytics
-- (analytics v2 already LEFT JOINs products). The restrictive FK turned any
-- ordered product into an undeletable row (23503) with no benefit.
--
-- ON DELETE SET NULL keeps the link when the product exists and drops it
-- (keeping the snapshot) when the product is deleted. restore_stock_on_cancel
-- already tolerates a missing product (UPDATE ... WHERE id = NULL is a no-op).
alter table public.order_items
  alter column product_id drop not null;

alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products(id)
  on delete set null;