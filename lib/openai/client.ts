import OpenAI from "openai";
import { env } from "@/lib/env";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!env.openaiApiKey) {
    throw new Error("Missing OPENAI_API_KEY server environment variable");
  }
  if (!_client) {
    _client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return _client;
}
