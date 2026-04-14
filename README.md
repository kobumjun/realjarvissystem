# Jarvis for Mac - Landing / Auth / Payment / Download

Next.js (App Router) project for selling and delivering `Jarvis for Mac`.

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

4. Put your installer file:

- Place `.dmg` file under `public/downloads/`
- Match file name with `JARVIS_DMG_FILENAME`

5. Run dev server:

```bash
npm run dev
```

## LemonSqueezy Webhook

- Endpoint: `/api/lemon/webhook`
- Header signature is verified with `LEMONSQUEEZY_WEBHOOK_SECRET`
- On successful payment event, it sets `user_access.has_access = true`

## User Flow

1. `/` Landing page with Login / Sign Up CTA
2. `/auth` Email/password auth
3. `/dashboard`
   - `has_access = false`: show LemonSqueezy checkout button
   - `has_access = true`: show `Download .dmg for Mac` button
4. Download is gated through `/api/download` (auth + paid check)
