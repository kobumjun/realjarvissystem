import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export type AppUser = {
  id: string;
  email: string;
};

export type AuthResult =
  | { ok: true; user: AppUser }
  | { ok: false; status: number; message: string };

/**
 * Validate an `Authorization: Bearer <access_token>` header from the macOS app.
 *
 * Creates a per-request Supabase client scoped to the user's token so RLS
 * applies naturally. Returns the authenticated user or an error payload.
 */
export async function authenticateAppRequest(request: Request): Promise<AuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return { ok: false, status: 401, message: "Missing or invalid Authorization header" };
  }

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return { ok: false, status: 500, message: "Supabase not configured" };
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { ok: false, status: 401, message: "Invalid or expired token" };
  }

  return {
    ok: true,
    user: { id: data.user.id, email: data.user.email ?? "" },
  };
}
