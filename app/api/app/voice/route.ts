import { NextResponse } from "next/server";
import { authenticateAppRequest } from "@/lib/auth/app-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adjustCredits } from "@/lib/credits/adjust";
import { getRequestCost } from "@/lib/credits/config";
import { logUsage } from "@/lib/credits/usage";
import { getOpenAIClient } from "@/lib/openai/client";

type VoiceBody = {
  text?: string;
  messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
};

/**
 * POST /api/app/voice
 *
 * Voice interaction endpoint — the macOS app sends the transcribed
 * user speech (or a messages array) and receives an AI response.
 *
 * Costs 2 credits per response (configurable via CREDIT_COST_VOICE env).
 *
 * Body: { text?, messages?, model?, temperature?, max_tokens? }
 * Requires: Authorization: Bearer <access_token>
 */
export async function POST(request: Request) {
  const auth = await authenticateAppRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: VoiceBody;
  try {
    body = (await request.json()) as VoiceBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages ?? (body.text
    ? [
        { role: "system" as const, content: "You are J.A.R.V.I.S., a concise and helpful AI voice assistant. Keep responses short and conversational since they will be spoken aloud." },
        { role: "user" as const, content: body.text },
      ]
    : null);

  if (!messages?.length) {
    return NextResponse.json({ error: "text or messages is required" }, { status: 400 });
  }

  const cost = getRequestCost("voice");
  const admin = createAdminClient();

  const deduct = await adjustCredits(admin, auth.user.id, -cost, "api:voice");
  if (!deduct.ok) {
    return NextResponse.json(
      { error: deduct.message, code: deduct.error, credits_required: cost },
      { status: 402 },
    );
  }

  const model = body.model || "gpt-4o-mini";

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 512,
    });

    const usage = completion.usage;
    const reply = completion.choices[0]?.message?.content ?? "";

    await logUsage(admin, {
      user_id: auth.user.id,
      request_type: "voice",
      credits_used: cost,
      model,
      tokens_in: usage?.prompt_tokens,
      tokens_out: usage?.completion_tokens,
    });

    return NextResponse.json({
      reply,
      model: completion.model,
      usage: {
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        total_tokens: usage?.total_tokens,
      },
      credits_remaining: deduct.newBalance,
    });
  } catch (err) {
    await adjustCredits(admin, auth.user.id, cost, "refund:voice_error");

    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
