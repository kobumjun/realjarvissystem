export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  lemonCheckoutUrl: process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ?? "",
  lemonWebhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
  downloadFileName: process.env.JARVIS_DMG_FILENAME ?? "jarvis-for-mac.dmg",
};
