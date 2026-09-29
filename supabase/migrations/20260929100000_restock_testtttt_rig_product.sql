-- Restock the testtttt rig's only product so storefront test orders can be
-- placed against it (it was sold out, blocking end-to-end Telegram tests).
update public.products
set stock = 5
where id = '760c7c5f-284f-47fe-99c5-b06c9e2bfaeb'
  and store_id = 'a1a8bca8-3b6d-4b3e-a068-e7b1ddcb0727';
