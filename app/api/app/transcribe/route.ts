import { NextResponse } from "next/server";
import { authenticateAppRequest } from "@/lib/auth/app-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adjustCredits } from "@/lib/credits/adjust";
import { getRequestCost } from "@/lib/credits/config";
import { logUsage } from "@/lib/credits/usage";
import { getOpenAIClient } from "@/lib/openai/client";
import { toFile } from "openai";

const ALLOWED_MIME = new Set([
  "audio/flac",
  "audio/m4a",
  "audio/mp3",
  "audio/mp4",
  "audio/mpeg",
  "audio/mpga",
  "audio/oga",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (Whisper limit)

/**
 * POST /api/app/transcribe
 *
 * Accepts multipart/form-data with an audio file and returns
 * the transcribed text via OpenAI Whisper.
 *
 * Form fields:
 *   - file      (required) audio file
 *   - language  (optional) ISO-639-1 code, e.g. "en", "ko"
 *   - prompt    (optional) context hint for Whisper
 *   - model     (optional) defaults to "whisper-1"
 *
 * Costs 1 credit per transcription (configurable via CREDIT_COST_TRANSCRIBE).
 * Requires: Authorization: Bearer <access_token>
 */
export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────
  const auth = await authenticateAppRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  // ── Parse multipart form ──────────────────────────────
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data" },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file field is required" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "file is empty" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
      { status: 413 },
    );
  }

  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported audio format: ${file.type}` },
      { status: 415 },
    );
  }

  const language = (formData.get("language") as string | null)?.trim() || undefined;
  const prompt = (formData.get("prompt") as string | null)?.trim() || undefined;
  const model = (formData.get("model") as string | null)?.trim() || "whisper-1";

  // ── Credit check + pre-deduct ─────────────────────────
  const cost = getRequestCost("transcribe");
  const admin = createAdminClient();

  const deduct = await adjustCredits(admin, auth.user.id, -cost, "api:transcribe");
  if (!deduct.ok) {
    return NextResponse.json(
      { error: deduct.message, code: deduct.error, credits_required: cost },
      { status: 402 },
    );
  }

  // ── Whisper call ──────────────────────────────────────
  try {
    const openai = getOpenAIClient();

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadFile = await toFile(buffer, file.name || "audio.webm", {
      type: file.type || "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      file: uploadFile,
      model,
      language,
      prompt,
      response_format: "json",
    });

    await logUsage(admin, {
      user_id: auth.user.id,
      request_type: "transcribe",
      credits_used: cost,
      model,
      metadata: {
        language: language ?? null,
        has_prompt: Boolean(prompt),
        file_size: file.size,
        file_type: file.type || null,
      },
    });

    return NextResponse.json({
      text: transcription.text,
      credits_remaining: deduct.newBalance,
    });
  } catch (err) {
    await adjustCredits(admin, auth.user.id, cost, "refund:transcribe_error");

    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
