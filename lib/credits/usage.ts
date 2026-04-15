import type { SupabaseClient } from "@supabase/supabase-js";

export type UsageEntry = {
  user_id: string;
  request_type: string;
  credits_used: number;
  model?: string;
  tokens_in?: number;
  tokens_out?: number;
  metadata?: Record<string, unknown>;
};

/**
 * Insert a usage log row. Best-effort — does not throw on failure.
 */
export async function logUsage(admin: SupabaseClient, entry: UsageEntry): Promise<void> {
  await admin.from("usage_logs").insert({
    user_id: entry.user_id,
    request_type: entry.request_type,
    credits_used: entry.credits_used,
    model: entry.model ?? null,
    tokens_in: entry.tokens_in ?? null,
    tokens_out: entry.tokens_out ?? null,
    metadata: entry.metadata ?? null,
  });
}
