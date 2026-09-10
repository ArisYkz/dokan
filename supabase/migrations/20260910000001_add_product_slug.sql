-- Add product slug column for storefront deep links (dokan.my/<store>/<product-slug>)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

-- Per-store unique slug (NULLs allowed for legacy/bulk rows until backfilled client-side)
CREATE UNIQUE INDEX IF NOT EXISTS products_store_slug_key ON public.products (store_id, slug) WHERE slug IS NOT NULL;
