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

type Meta = {
  event_name?: string;
  custom_data?: Record<string, unknown>;
  passthrough?: unknown;
};

type Payload = {
  meta?: Meta;
  data?: { attributes?: Record<string, unknown> };
};

function stringifyId(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(Math.trunc(value));
  return undefined;
}

function readUserIdFromRecord(record: Record<string, unknown> | undefined): string | undefined {
  if (!record) return undefined;
  const keys = ["user_id", "supabase_user_id", "supabaseUserId", "userId", "uid"];
  for (const key of keys) {
    const id = stringifyId(record[key]);
    if (id) return id;
  }
  return undefined;
}

/**
 * Resolves internal user id from Lemon `meta.custom_data`, optional nested `custom`,
 * and `meta.passthrough` (string JSON or object).
 */
function extractPassthroughUserId(meta: Meta | undefined): string | undefined {
  if (!meta) return undefined;

  const custom = meta.custom_data;
  if (custom && typeof custom === "object") {
    const direct = readUserIdFromRecord(custom as Record<string, unknown>);
    if (direct) return direct;

    const nested = (custom as Record<string, unknown>).custom;
    if (nested && typeof nested === "object") {
      const nestedId = readUserIdFromRecord(nested as Record<string, unknown>);
      if (nestedId) return nestedId;
    }
  }

  const raw = meta.passthrough;
  if (raw == null) return undefined;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const fromJson = readUserIdFromRecord(parsed as Record<string, unknown>);
        if (fromJson) return fromJson;
      }
    } catch {
      // plain string id
    }
    return stringifyId(trimmed);
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return readUserIdFromRecord(raw as Record<string, unknown>);
  }

  return undefined;
}

function readCheckoutEmail(payload: Payload) {
  const custom = payload.meta?.custom_data ?? {};
  const attrs = payload.data?.attributes ?? {};

  const fromCustom =
    (typeof custom.email === "string" && custom.email) ||
    (typeof custom.user_email === "string" && custom.user_email);
  const fromOrder =
    typeof attrs.user_email === "string"
      ? attrs.user_email
      : typeof attrs.email === "string"
        ? attrs.email
        : undefined;

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

  const checkoutEmail = readCheckoutEmail(payload);
  const candidateUserId = extractPassthroughUserId(payload.meta);

  if (!candidateUserId && !checkoutEmail) {
    return NextResponse.json(
      { error: "No user_id (custom_data/passthrough) or checkout email in webhook payload" },
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

  let resolvedUserId: string | null = null;
  let resolvedAuthEmail: string | null = null;

  if (candidateUserId) {
    const { data, error } = await admin.auth.admin.getUserById(candidateUserId);
    if (!error && data?.user?.id) {
      resolvedUserId = data.user.id;
      resolvedAuthEmail = data.user.email ?? null;
    }
  }

  if (!resolvedUserId && checkoutEmail) {
    resolvedUserId = await findAuthUserIdByEmail(admin, checkoutEmail);
    if (!resolvedUserId) {
      return NextResponse.json(
        {
          ok: true,
          skipped: true,
          reason: "no_registered_user_for_checkout_email",
          detail:
            "No matching auth.users row for checkout email, and custom_data/passthrough user_id was missing or invalid.",
          email: checkoutEmail,
          had_candidate_user_id: Boolean(candidateUserId),
        },
        { status: 200 },
      );
    }
  }

  if (!resolvedUserId) {
    return NextResponse.json(
      {
        error: "Could not resolve Supabase user id",
        had_candidate_user_id: Boolean(candidateUserId),
      },
      { status: 400 },
    );
  }

  const customData = payload.meta?.custom_data ?? {};
  const emailForRow =
    checkoutEmail?.trim() ??
    (typeof customData.email === "string" ? customData.email.trim() : null) ??
    resolvedAuthEmail;

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
    matched_by: candidateUserId && resolvedUserId === candidateUserId ? "custom_data_or_passthrough" : "email",
    event_name: eventName,
  });
}
