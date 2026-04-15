import { NextResponse } from "next/server";
import { authenticateAppRequest } from "@/lib/auth/app-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type UsageRow = {
  id: number;
  request_type: string;
  credits_used: number;
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
};

/**
 * GET /api/app/usage?limit=20&offset=0
 *
 * Returns recent usage logs for the authenticated user.
 * Requires: Authorization: Bearer <access_token>
 */
export async function GET(request: Request) {
  const auth = await authenticateAppRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("usage_logs")
    .select("id, request_type, credits_used, model, tokens_in, tokens_out, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)
    .returns<UsageRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    usage: data ?? [],
    limit,
    offset,
  });
}
