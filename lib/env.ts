/** Google Drive direct download (uc?export=download); override via env if needed. */
const DEFAULT_JARVIS_DOWNLOAD_URL =
  "https://drive.google.com/uc?export=download&id=1UYvUsHCegm60wJfrfhVA91Caxq6YM8j7";

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  lemonCheckoutUrl: process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "",
  lemonWebhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
  jarvisDownloadUrl:
    process.env.NEXT_PUBLIC_JARVIS_DOWNLOAD_URL?.trim() || DEFAULT_JARVIS_DOWNLOAD_URL,
  jarvisDownloadFileName:
    process.env.NEXT_PUBLIC_JARVIS_DOWNLOAD_FILENAME?.trim() || "Jarvis-for-Mac.dmg",
};
