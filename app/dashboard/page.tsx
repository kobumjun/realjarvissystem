import { redirect } from "next/navigation";
import DashboardClient from "@/app/dashboard/dashboard-client";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CreditsRow = { balance: number };
type UsageRow = {
  id: number;
  request_type: string;
  credits_used: number;
  model: string | null;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [creditsRes, usageRes] = await Promise.all([
    supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle<CreditsRow>(),
    supabase
      .from("usage_logs")
      .select("id, request_type, credits_used, model, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<UsageRow[]>(),
  ]);

  return (
    <DashboardClient
      email={user.email ?? ""}
      userId={user.id}
      credits={creditsRes.data?.balance ?? 0}
      recentUsage={usageRes.data ?? []}
      checkoutUrl={env.lemonCheckoutUrl}
      downloadUrl={env.jarvisDownloadUrl}
      downloadFileName={env.jarvisDownloadFileName}
    />
  );
}
