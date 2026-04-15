import type { SupabaseClient } from "@supabase/supabase-js";

export type AdjustResult =
  | { ok: true; newBalance: number }
  | { ok: false; error: "insufficient_credits" | "db_error"; message: string };

/**
 * Atomically adjust a user's credit balance via the `adjust_credits` RPC.
 * Positive amount = charge, negative = deduction.
 */
export async function adjustCredits(
  admin: SupabaseClient,
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string,
): Promise<AdjustResult> {
  const { data, error } = await admin.rpc("adjust_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_reference_id: referenceId ?? null,
  });

  if (error) {
    if (error.message?.includes("insufficient_credits")) {
      return { ok: false, error: "insufficient_credits", message: "Not enough credits" };
    }
    return { ok: false, error: "db_error", message: error.message };
  }

  return { ok: true, newBalance: data as number };
}

/** Quick read of current balance. Returns 0 if row doesn't exist yet. */
export async function getBalance(admin: SupabaseClient, userId: string): Promise<number> {
  const { data } = await admin
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle<{ balance: number }>();
  return data?.balance ?? 0;
}
