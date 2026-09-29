-- Cancelled/dead orders should not pin products forever.
--
-- Decision history (2026-09-29): 20260929130000 made this FK ON DELETE SET NULL,
-- 20260929131000 reverted it to keep the "Cannot delete: product has existing
-- order records" guard. Final policy: the guard moves into the app
-- (productService blocks deletion while any LIVE order references the product),
-- while dead orders (cancelled, payment_rejected, returned, refunded, archived)
-- release the product. Their order_items rows survive with product_id set NULL —
-- product_name/product_price snapshots keep order history and revenue analytics
-- intact (analytics v2 LEFT JOINs products; restore_stock_on_cancel is a no-op
-- for a missing product).
alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  alter column product_id drop not null;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products(id)
  on delete set null;