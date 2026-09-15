-- Wire the "testtttt" store as a Pro store for Telegram notification testing.
-- Alerts for it will be delivered to the platform admin's own chat (ADMIN_CHAT_ID).
update public.stores
set plan_type = 'pro',
    telegram_chat_id = '698477265'
where id = 'a1a8bca8-3b6d-4b3e-a068-e7b1ddcb0727';
