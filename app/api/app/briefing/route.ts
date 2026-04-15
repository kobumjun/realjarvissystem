import { NextResponse } from "next/server";
import { authenticateAppRequest } from "@/lib/auth/app-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adjustCredits } from "@/lib/credits/adjust";
import { getRequestCost } from "@/lib/credits/config";
import { logUsage } from "@/lib/credits/usage";
import { getOpenAIClient } from "@/lib/openai/client";

type BriefingBody = {
  topic?: string;
  context?: string;
  model?: string;
  max_tokens?: number;
};

const BRIEFING_SYSTEM_PROMPT = `You are J.A.R.V.I.S., an advanced AI briefing assistant. When given a topic and optional context, produce a concise, well-structured intelligence briefing. Include key facts, analysis, and actionable takeaways. Use markdown formatting.`;

/**
 * POST /api/app/briefing
 *
 * Generates an intelligence briefing via OpenAI.
 * Costs 3 credits (higher-value request).
 *
 * Body: { topic, context?, model?, max_tokens? }
 * Requires: Authorization: Bearer <access_token>
 */
export async function POST(request: Request) {
  const auth = await authenticateAppRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: BriefingBody;
  try {
    body = (await request.json()) as BriefingBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.topic?.trim()) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const cost = getRequestCost("briefing");
  const admin = createAdminClient();

  const deduct = await adjustCredits(admin, auth.user.id, -cost, "api:briefing");
  if (!deduct.ok) {
    return NextResponse.json(
      { error: deduct.message, code: deduct.error, credits_required: cost },
      { status: 402 },
    );
  }

  const model = body.model || "gpt-4o-mini";
  const userContent = body.context
    ? `Topic: ${body.topic}\n\nAdditional context:\n${body.context}`
    : `Topic: ${body.topic}`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: BRIEFING_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.5,
      max_tokens: body.max_tokens ?? 2048,
    });

    const usage = completion.usage;

    await logUsage(admin, {
      user_id: auth.user.id,
      request_type: "briefing",
      credits_used: cost,
      model,
      tokens_in: usage?.prompt_tokens,
      tokens_out: usage?.completion_tokens,
      metadata: { topic: body.topic },
    });

    const briefing = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({
      briefing,
      model: completion.model,
      usage: {
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        total_tokens: usage?.total_tokens,
      },
      credits_remaining: deduct.newBalance,
    });
  } catch (err) {
    await adjustCredits(admin, auth.user.id, cost, "refund:briefing_error");

    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
