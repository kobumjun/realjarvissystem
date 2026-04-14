import { redirect } from "next/navigation";
import DashboardClient from "@/app/dashboard/dashboard-client";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AccessRow = {
  has_access: boolean;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data } = await supabase
    .from("user_access")
    .select("has_access")
    .eq("user_id", user.id)
    .maybeSingle<AccessRow>();

  return (
    <DashboardClient
      email={user.email ?? "Unknown email"}
      hasAccess={Boolean(data?.has_access)}
      checkoutUrl={env.lemonCheckoutUrl}
    />
  );
}
