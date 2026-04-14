import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const hasPaymentEvent = (eventName: string) =>
  ["order_created", "order_refunded", "subscription_payment_success"].includes(eventName);

export async function POST(request: Request) {
  if (!env.lemonWebhookSecret) {
    return NextResponse.json(
      { error: "Missing LEMONSQUEEZY_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const incomingSignature = request.headers.get("x-signature");
  if (!incomingSignature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const digest = createHmac("sha256", env.lemonWebhookSecret).update(rawBody).digest("hex");
  const valid =
    digest.length === incomingSignature.length &&
    timingSafeEqual(Buffer.from(digest), Buffer.from(incomingSignature));

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    meta?: { event_name?: string; custom_data?: Record<string, unknown> };
    data?: { attributes?: { user_email?: string } };
  };

  const eventName = payload.meta?.event_name ?? "";
  if (!hasPaymentEvent(eventName)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (eventName === "order_refunded") {
    return NextResponse.json({ ok: true, skipped: "refund handler not enabled" });
  }

  const customData = payload.meta?.custom_data ?? {};
  const userId = (customData.user_id as string | undefined) ?? undefined;
  const email =
    (customData.email as string | undefined) ??
    payload.data?.attributes?.user_email ??
    undefined;

  if (!userId && !email) {
    return NextResponse.json(
      { error: "No user_id or email in webhook payload" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  if (userId) {
    const { error } = await admin.from("user_access").upsert(
      {
        user_id: userId,
        email: email ?? null,
        has_access: true,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (email) {
    const { error } = await admin.from("user_access").upsert(
      {
        email,
        has_access: true,
      },
      { onConflict: "email" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
