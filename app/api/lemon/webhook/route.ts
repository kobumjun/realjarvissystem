import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { findAuthUserIdByEmail } from "@/lib/auth/find-auth-user-id-by-email";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const PAID_EVENTS = new Set([
  "order_created",
  "subscription_created",
  "subscription_payment_success",
  "subscription_payment_recovered",
]);

/** Lemon Squeezy: UTF-8 buffers of the hex digest (see Signing Requests docs). */
function verifyLemonSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader || rawBody.length === 0) return false;
  const digest = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");
  if (digest.length !== signature.length) return false;
  return timingSafeEqual(digest, signature);
}

type Payload = {
  meta?: { event_name?: string; custom_data?: Record<string, unknown> };
  data?: { attributes?: Record<string, unknown> };
};

function readCheckoutEmail(payload: Payload) {
  const custom = payload.meta?.custom_data ?? {};
  const attrs = payload.data?.attributes ?? {};

  const fromCustom =
    (typeof custom.email === "string" && custom.email) ||
    (typeof custom.user_email === "string" && custom.user_email);
  const fromOrder =
    typeof attrs.user_email === "string" ? attrs.user_email : undefined;

  const raw = fromCustom || fromOrder;
  return raw?.trim() || undefined;
}

export async function POST(request: Request) {
  if (!env.lemonWebhookSecret) {
    return NextResponse.json(
      { error: "Missing LEMONSQUEEZY_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-signature") ?? request.headers.get("X-Signature");

  if (!verifyLemonSignature(rawBody, signature, env.lemonWebhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Payload;
  try {
    payload = JSON.parse(rawBody) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName =
    payload.meta?.event_name ??
    request.headers.get("x-event-name") ??
    request.headers.get("X-Event-Name") ??
    "";

  if (!eventName) {
    return NextResponse.json({ error: "Missing event name" }, { status: 400 });
  }

  if (eventName === "order_refunded") {
    return NextResponse.json({ ok: true, skipped: true, reason: "refund_handler_not_enabled" });
  }

  if (!PAID_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: true, skipped: true, event_name: eventName });
  }

  const customData = payload.meta?.custom_data ?? {};
  const userIdFromCheckout =
    (typeof customData.user_id === "string" && customData.user_id) ||
    (typeof customData.supabase_user_id === "string" && customData.supabase_user_id) ||
    undefined;

  const checkoutEmail = readCheckoutEmail(payload);

  if (!userIdFromCheckout && !checkoutEmail) {
    return NextResponse.json(
      { error: "No user_id or checkout email in webhook payload" },
      { status: 400 },
    );
  }

  const attrs = payload.data?.attributes ?? {};
  const orderStatus = typeof attrs.status === "string" ? attrs.status.toLowerCase() : undefined;
  if (eventName === "order_created" && orderStatus && orderStatus !== "paid") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "order_not_paid",
      status: orderStatus,
    });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Admin client error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const now = new Date().toISOString();

  let resolvedUserId: string | null = userIdFromCheckout ?? null;

  if (!resolvedUserId && checkoutEmail) {
    resolvedUserId = await findAuthUserIdByEmail(admin, checkoutEmail);
    if (!resolvedUserId) {
      return NextResponse.json(
        {
          ok: true,
          skipped: true,
          reason: "no_registered_user_for_checkout_email",
          detail:
            "No matching row in auth.users for this checkout email. The user must sign up in your app before the purchase can unlock downloads.",
          email: checkoutEmail,
        },
        { status: 200 },
      );
    }
  }

  if (!resolvedUserId) {
    return NextResponse.json(
      { error: "Could not resolve Supabase user id" },
      { status: 400 },
    );
  }

  const emailForRow = checkoutEmail ?? (typeof customData.email === "string" ? customData.email : null);

  const { error } = await admin.from("user_access").upsert(
    {
      user_id: resolvedUserId,
      email: emailForRow?.trim() ?? null,
      has_access: true,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    user_id: resolvedUserId,
    event_name: eventName,
  });
}
