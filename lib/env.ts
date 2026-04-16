/** Google Drive file link; override via env if needed. */
const DEFAULT_RAGE_DOWNLOAD_URL =
  "https://drive.google.com/uc?export=download&id=1BRY64Lc2ezHQvoI3Mw4kZ8f0Yx9ckl0z";

export const env = {
  // ── Public (browser-safe) ──────────────────────────────
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  lemonCheckoutUrl: process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "",
  rageDownloadUrl:
    process.env.NEXT_PUBLIC_RAGE_DOWNLOAD_URL?.trim() ||
    process.env.NEXT_PUBLIC_JARVIS_DOWNLOAD_URL?.trim() ||
    DEFAULT_RAGE_DOWNLOAD_URL,
  rageDownloadFileName:
    process.env.NEXT_PUBLIC_RAGE_DOWNLOAD_FILENAME?.trim() ||
    process.env.NEXT_PUBLIC_JARVIS_DOWNLOAD_FILENAME?.trim() ||
    "RAGE-for-Mac.dmg",

  // ── Server-only (never exposed to client) ──────────────
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  lemonWebhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
};
