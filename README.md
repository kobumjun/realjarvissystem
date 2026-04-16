# R.A.G.E Landing Page

Marketing site for R.A.G.E (Realtime Analytical Grid Engine) trader dashboard.

## Tech Stack

- Next.js + Tailwind CSS (dark cyberpunk UI)
- Supabase Auth (email/password)
- Supabase DB (`user_access.has_access`)
- LemonSqueezy checkout + webhook

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and set values:

```bash
cp .env.example .env.local
```

3. Apply SQL in Supabase SQL editor:

- Run `supabase/schema.sql`

4. The Mac installer link defaults to **Google Drive** (`lib/env.ts`). To use another URL, set `NEXT_PUBLIC_RAGE_DOWNLOAD_URL`. Optional: `NEXT_PUBLIC_RAGE_DOWNLOAD_FILENAME` for the `<a download>` attribute.

5. Run dev server:

```bash
npm run dev
```

## LemonSqueezy Webhook

- Endpoint: `/api/lemon/webhook`
- Header signature is verified with `LEMONSQUEEZY_WEBHOOK_SECRET`
- On successful payment event, it sets `user_access.has_access = true`
- Matching order: validate `meta.custom_data` / nested `custom` / `meta.passthrough` as `user_id` against **Auth Admin `getUserById`**, then fall back to checkout email → `auth.users` via paginated `listUsers`

## LemonSqueezy checkout (from Dashboard)

- The pay link appends `checkout[email]` and `checkout[custom][user_id]` to `NEXT_PUBLIC_LEMON_CHECKOUT_URL` so checkout is pre-filled and webhooks receive `meta.custom_data.user_id` (see [prefilled fields](https://docs.lemonsqueezy.com/help/checkout/prefilled-checkout-fields) and [custom data](https://docs.lemonsqueezy.com/help/checkout/passing-custom-data))

## User Flow

1. `/` Landing page with Login / Sign Up CTA
2. `/auth` Email/password auth
3. `/dashboard`
   - `has_access = false`: show LemonSqueezy checkout button
   - `has_access = true`: show download link (Google Drive by default; `target="_blank"` `rel="noopener noreferrer"` `download`)
4. Only **paid** users see the download link; the file is hosted outside this app (e.g. Google Drive)
