import { NextResponse } from "next/server";
import { authenticateAppRequest } from "@/lib/auth/app-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adjustCredits } from "@/lib/credits/adjust";
import { getRequestCost } from "@/lib/credits/config";
import { logUsage } from "@/lib/credits/usage";
import { getOpenAIClient } from "@/lib/openai/client";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ChatBody = {
  messages?: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
};

/**
 * POST /api/app/chat
 *
 * Proxies a chat completion request to OpenAI.
 * Deducts 1 credit per request.
 *
 * Body: { messages, model?, temperature?, max_tokens? }
 * Requires: Authorization: Bearer <access_token>
 */
export async function POST(request: Request) {
  const auth = await authenticateAppRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.messages?.length) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const cost = getRequestCost("chat");
  const admin = createAdminClient();

  const deduct = await adjustCredits(admin, auth.user.id, -cost, "api:chat");
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
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens,
    });

    const usage = completion.usage;

    await logUsage(admin, {
      user_id: auth.user.id,
      request_type: "chat",
      credits_used: cost,
      model,
      tokens_in: usage?.prompt_tokens,
      tokens_out: usage?.completion_tokens,
    });

    return NextResponse.json({
      choices: completion.choices,
      model: completion.model,
      usage: {
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        total_tokens: usage?.total_tokens,
      },
      credits_remaining: deduct.newBalance,
    });
  } catch (err) {
    // Refund the credit on OpenAI failure
    await adjustCredits(admin, auth.user.id, cost, "refund:chat_error");

    const message = err instanceof Error ? err.message : "OpenAI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
