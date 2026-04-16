/* ================================================================== *
 *  Credit configuration — single source of truth                      *
 *  Edit REQUEST_TYPES to add/change/remove request types.             *
 *  Edit TIERS to adjust pricing plans.                                *
 * ================================================================== */

// ── Request type definitions ─────────────────────────────────────────

export type RequestTypeConfig = {
  cost: number;
  label: string;
  description: string;
};

/**
 * Central registry of every billable request type.
 *
 * To add a new type: add a key here, then create or update the
 * corresponding API route to call `getRequestCost(key)`.
 *
 * Costs can be overridden at runtime via env: `CREDIT_COST_<KEY>=n`
 * e.g. CREDIT_COST_BRIEFING=5 overrides briefing to 5 credits.
 */
const _requestTypes = {
  chat: {
    cost: 1,
    label: "Chat",
    description: "Standard AI conversation (1 turn)",
  },
  transcribe: {
    cost: 1,
    label: "Transcribe",
    description: "Whisper speech-to-text (1 audio clip)",
  },
  voice: {
    cost: 2,
    label: "Voice",
    description: "Live voice interaction (1 response)",
  },
  briefing: {
    cost: 3,
    label: "Briefing",
    description: "Deep analysis & structured briefing",
  },
} as const satisfies Record<string, RequestTypeConfig>;

export type RequestType = keyof typeof _requestTypes;

function applyEnvOverrides(): Record<string, RequestTypeConfig> {
  const result: Record<string, RequestTypeConfig> = {};
  for (const [key, config] of Object.entries(_requestTypes)) {
    const envKey = `CREDIT_COST_${key.toUpperCase()}`;
    const envVal = Number(process.env[envKey]);
    result[key] = {
      ...config,
      cost: envVal > 0 ? envVal : config.cost,
    };
  }
  return result;
}

export const REQUEST_TYPES: Record<string, RequestTypeConfig> = applyEnvOverrides();

export function getRequestCost(requestType: string): number {
  return REQUEST_TYPES[requestType]?.cost ?? 1;
}

export function getRequestLabel(requestType: string): string {
  return REQUEST_TYPES[requestType]?.label ?? requestType;
}

export function getAllRequestTypes(): Array<{ key: string } & RequestTypeConfig> {
  return Object.entries(REQUEST_TYPES).map(([key, config]) => ({ key, ...config }));
}

// ── Credit tiers (pricing plans) ─────────────────────────────────────

export type CreditTier = "lite" | "standard" | "pro";

export type TierConfig = {
  credits: number;
  price: string;
  label: string;
};

export const TIERS: Record<CreditTier, TierConfig> = {
  lite: {
    credits: Number(process.env.CREDIT_PLAN_LITE) || 180,
    price: "$9.99",
    label: "Lite",
  },
  standard: {
    credits: Number(process.env.CREDIT_PLAN_STANDARD) || 650,
    price: "$24.99",
    label: "Standard",
  },
  pro: {
    credits: Number(process.env.CREDIT_PLAN_PRO) || 2400,
    price: "$59.99",
    label: "Pro",
  },
};

// ── Variant → tier mapping ───────────────────────────────────────────

export const VARIANT_TIER_MAP: Record<string, CreditTier> = {};

function loadVariants() {
  const mapping: [string, CreditTier][] = [
    [process.env.LEMON_VARIANT_LITE ?? "", "lite"],
    [process.env.LEMON_VARIANT_STANDARD ?? "", "standard"],
    [process.env.LEMON_VARIANT_PRO ?? "", "pro"],
  ];
  for (const [ids, tier] of mapping) {
    for (const id of ids.split(",").map((s) => s.trim()).filter(Boolean)) {
      VARIANT_TIER_MAP[id] = tier;
    }
  }
}
loadVariants();

export function resolveCredits(
  variantId?: string,
  productName?: string,
): { tier: CreditTier; credits: number } {
  if (variantId && VARIANT_TIER_MAP[variantId]) {
    const tier = VARIANT_TIER_MAP[variantId];
    return { tier, credits: TIERS[tier].credits };
  }

  if (productName) {
    const lower = productName.toLowerCase();
    if (lower.includes("pro")) return { tier: "pro", credits: TIERS.pro.credits };
    if (lower.includes("standard")) return { tier: "standard", credits: TIERS.standard.credits };
    if (lower.includes("lite")) return { tier: "lite", credits: TIERS.lite.credits };
  }

  return { tier: "lite", credits: TIERS.lite.credits };
}
