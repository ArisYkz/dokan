-- Revert 20260929130000: keep the restrictive FK on order_items.product_id.
-- Decision (2026-09-29): products referenced by order history should NOT be
-- deletable; the "Cannot delete: product has existing order records" guard is
-- intentional. Products that must disappear from the storefront are
-- deactivated/hidden instead of deleted.
alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  alter column product_id set not null;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products(id);