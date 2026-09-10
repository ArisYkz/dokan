# Telegram Bot Activation Checklist

The bot is the **merchant notification channel** for Dokan. It does two jobs:

1. **New-order alerts** — `notify-order` messages the store owner when an order is placed (Pro stores only).
2. **Payment confirm/reject** — when a customer taps "I've paid", `claim-payment` sends the owner
   ✅ / ❌ buttons; tapping one flips the order to `paid_confirmed` / `payment_rejected`.

Without a bot, orders are still recorded and manageable from the dashboard — you just lose instant
phone alerts and one-tap payment confirmation.

> **Live project ref:** `jdcsyjukrxtgzduzhngh`
> **Bot username (hardcoded in UI help text):** `@dokan_bot`

---

## Activation steps

1. **Create the bot** in Telegram via **@BotFather** → `/newbot`.
   Give it the username `@dokan_bot`. If you use a different username, update `TELEGRAM_HELP` in
   `src/constants/translations.ts` to match.

2. **Set the secrets** (token from BotFather + your own numeric chat ID):
   ```bash
   supabase secrets set TELEGRAM_API_KEY=123456:ABC-DEF... ADMIN_CHAT_ID=123456789 \
     --project-ref jdcsyjukrxtgzduzhngh
   ```

3. **Point the webhook** at the order-alert handler:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://jdcsyjukrxtgzduzhngh.supabase.co/functions/v1/notify-order"
   ```

4. **Merchant self-service:** the store owner messages `@dokan_bot`, gets their numeric chat ID back,
   and pastes it into **Dashboard → Branding → Telegram ID**.
   You (the admin) get *your* ID the same way — that's the `ADMIN_CHAT_ID` from step 2.

---

## Things to watch

- **`ADMIN_CHAT_ID` is required for Pro subscription approvals.** `notify-admin` needs **both**
  `TELEGRAM_API_KEY` **and** `ADMIN_CHAT_ID`. If either is missing it returns
  `{ success: true, "Keys missing, skipped" }` — so a merchant who submits a Pro request (and pays)
  is **silently dropped** and no admin is notified. Make sure step 2 sets both.

---

## Verification commands

```bash
# Confirm the webhook is registered
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Confirm secrets are set
supabase secrets list --project-ref jdcsyjukrxtgzduzhngh

# Confirm all functions are deployed
supabase functions list --project-ref jdcsyjukrxtgzduzhngh
```

---

## Already done (no action needed)

- All 7 previously-missing edge functions are deployed: `claim-payment`, `submit-review`,
  `notify-admin`, `analytics-aggregation`, `expire-stale-orders`, `process-email-queue`,
  `downgrade-expired`.
- `claim-payment` no longer hard-fails without `TELEGRAM_API_KEY` — "I've paid" works with or without
  the bot; the Telegram notification is just skipped when no key/chat-id is set.

## Not deployed (unused / redundant)

`handle-callback`, `telegram-poll`, `check-low-stock`, `admin-verify`, `auth-email-hook`,
`delete-product-image` — `notify-order` already handles callbacks inline, and the rest aren't wired up.
