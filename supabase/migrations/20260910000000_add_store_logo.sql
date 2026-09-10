-- Add store logo_url column for the client logo (rendered under hero title/subtitle)
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS logo_url text;
