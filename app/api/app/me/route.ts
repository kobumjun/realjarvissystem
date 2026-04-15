import { NextResponse } from "next/server";
import { authenticateAppRequest } from "@/lib/auth/app-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBalance } from "@/lib/credits/adjust";

/**
 * GET /api/app/me
 *
 * Returns the authenticated user's profile + credit balance + app state.
 *
 * `status` field tells the app exactly what to do:
 *   - "ready"       → credits > 0, AI features unlocked
 *   - "no_credits"  → logged in but 0 credits, prompt to purchase
 *
 * (If the token is missing/invalid, a 401 is returned before reaching
 *  this logic, which the app should interpret as "not_logged_in".)
 *
 * Requires: Authorization: Bearer <access_token>
 */
export async function GET(request: Request) {
  const auth = await authenticateAppRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, status: "not_logged_in" }, { status: auth.status });
  }

  const admin = createAdminClient();
  const balance = await getBalance(admin, auth.user.id);

  const status = balance > 0 ? "ready" : "no_credits";

  return NextResponse.json({
    user: {
      id: auth.user.id,
      email: auth.user.email,
    },
    credits: balance,
    status,
  });
}
