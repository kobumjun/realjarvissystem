/** Google Drive file link; override via env if needed. */
const DEFAULT_JARVIS_DOWNLOAD_URL =
  "https://drive.google.com/file/d/10eRau8S9RyQ6Ry_y8UOggmpEoFQw6ic4/view?usp=sharing";

export const env = {
  // ── Public (browser-safe) ──────────────────────────────
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  lemonCheckoutUrl: process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "",
  jarvisDownloadUrl:
    process.env.NEXT_PUBLIC_JARVIS_DOWNLOAD_URL?.trim() || DEFAULT_JARVIS_DOWNLOAD_URL,
  jarvisDownloadFileName:
    process.env.NEXT_PUBLIC_JARVIS_DOWNLOAD_FILENAME?.trim() || "Jarvis-for-Mac.dmg",

  // ── Server-only (never exposed to client) ──────────────
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  lemonWebhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
};
