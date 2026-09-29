-- Public Telegram username (@handle) used for social contact links.
-- Kept separate from telegram_chat_id, which is the private notification
-- target and must not be exposed in t.me/ links.
alter table public.stores
  add column if not exists telegram_username text;