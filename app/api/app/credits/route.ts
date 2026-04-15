import { NextResponse } from "next/server";
import { authenticateAppRequest } from "@/lib/auth/app-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBalance } from "@/lib/credits/adjust";

/**
 * GET /api/app/credits
 *
 * Returns the authenticated user's current credit balance.
 * Requires: Authorization: Bearer <access_token>
 */
export async function GET(request: Request) {
  const auth = await authenticateAppRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const admin = createAdminClient();
  const balance = await getBalance(admin, auth.user.id);

  return NextResponse.json({
    user_id: auth.user.id,
    credits: balance,
  });
}
