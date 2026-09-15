-- YouTube channel handle for stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS youtube text;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS show_youtube boolean NOT NULL DEFAULT false;
