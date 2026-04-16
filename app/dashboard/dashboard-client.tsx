"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buildLemonCheckoutUrl } from "@/lib/lemon/build-checkout-url";

type UsageRow = {
  id: number;
  request_type: string;
  credits_used: number;
  model: string | null;
  created_at: string;
};

type Props = {
  email: string;
  userId: string;
  credits: number;
  recentUsage: UsageRow[];
  plans: {
    tier: "Lite" | "Standard" | "Pro";
    credits: number;
    price: string;
  }[];
  checkoutUrl: string;
  downloadUrl: string;
};

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function IconMic({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  );
}

function IconMonitor({ className }: { className?: string }) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconCog({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.31.22.65.22 1v.09c0 .35-.08.69-.22 1" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  chat:       { bg: "bg-cyan-500/15 border-cyan-500/30",      text: "text-cyan-300",    label: "Chat" },
  transcribe: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300", label: "Transcribe" },
  voice:      { bg: "bg-violet-500/15 border-violet-500/30",   text: "text-violet-300",  label: "Voice" },
  briefing:   { bg: "bg-amber-500/15 border-amber-500/30",     text: "text-amber-300",   label: "Briefing" },
};

function typeBadge(type: string) {
  const s = TYPE_STYLE[type] ?? { bg: "bg-slate-500/15 border-slate-500/30", text: "text-slate-300", label: type };
  return s;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardClient({
  email,
  userId,
  credits: initialCredits,
  recentUsage: initialUsage,
  plans,
  checkoutUrl,
  downloadUrl,
}: Props) {
  const router = useRouter();
  const [credits, setCredits] = useState(initialCredits);
  const [usage, setUsage] = useState<UsageRow[]>(initialUsage);

  const pollCredits = useCallback(async () => {
    try {
      const supabase = createClient();
      const [cRes, uRes] = await Promise.all([
        supabase
          .from("user_credits")
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle<{ balance: number }>(),
        supabase
          .from("usage_logs")
          .select("id, request_type, credits_used, model, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)
          .returns<UsageRow[]>(),
      ]);
      if (cRes.data) setCredits(cRes.data.balance);
      if (uRes.data) setUsage(uRes.data);
    } catch {
      // skip
    }
  }, [userId]);

  useEffect(() => {
    const id = setInterval(pollCredits, 8_000);
    return () => clearInterval(id);
  }, [pollCredits]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("user_credits_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { balance?: number };
          if (typeof row.balance === "number") setCredits(row.balance);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const checkoutHref = useMemo(() => {
    if (!checkoutUrl) return checkoutUrl;
    return buildLemonCheckoutUrl(checkoutUrl, { email, userId });
  }, [checkoutUrl, email, userId]);

  const hasCredits = credits > 0;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* ── Header ─────────────────────────────────────── */}
        <section className="glass-panel rounded-2xl p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-white">R.A.G.E for Mac</h1>
              <p className="mt-2 text-slate-300">{email || "Unknown email"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                hasCredits
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              }`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasCredits ? "text-emerald-400" : "text-amber-400"} aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
                <span className={`text-sm font-semibold tabular-nums ${hasCredits ? "text-emerald-200" : "text-amber-200"}`}>
                  {credits.toLocaleString()} credits
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-400"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* ── AI Status banner ───────────────────────────── */}
        {hasCredits ? (
          <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-slate-950/60 p-5 text-center shadow-[0_0_48px_-12px_rgba(16,185,129,0.18)]">
            <p className="text-sm font-medium tracking-wide text-emerald-300">AI ACCESS READY</p>
            <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
              Your R.A.G.E dashboard is fully operational.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
              You have <strong className="text-emerald-200">{credits.toLocaleString()}</strong> credits available.
              Open the app and sign in with this account to use all AI features.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-slate-950/60 p-5 text-center shadow-[0_0_48px_-12px_rgba(245,158,11,0.15)]">
            <p className="text-sm font-medium tracking-wide text-amber-300">NO CREDITS</p>
            <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
              Add credits to activate AI features.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-300">
              The app is installed and ready — purchase credits below to power voice,
              briefings, research, and visual mapping.
            </p>
          </section>
        )}

        {/* ── Recent usage history ───────────────────────── */}
        <UsageHistory usage={usage} />

        {/* ── Download section (always visible) ──────────── */}
        <section className="glass-panel rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Download R.A.G.E</h2>
              <p className="mt-1 text-sm text-slate-400">
                Download is unlocked for your signed-in account.
              </p>
            </div>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_-6px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300 md:text-base"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download R.A.G.E for macOS
            </a>
          </div>
        </section>

        {/* ── Credit purchase section ────────────────────── */}
        <CreditPurchaseSection
          checkoutHref={checkoutHref}
          checkoutUrl={checkoutUrl}
          hasCredits={hasCredits}
          plans={plans}
          userId={userId}
        />

        {/* ── Setup guide ────────────────────────────────── */}
        <SetupGuide />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Usage history                                                      */
/* ------------------------------------------------------------------ */

function UsageHistory({ usage }: { usage: UsageRow[] }) {
  if (usage.length === 0) {
    return (
      <section className="glass-panel rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
          Recent Activity
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          No usage yet. AI requests from the app will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">
        Recent Activity
      </h2>
      <ul className="mt-3 divide-y divide-slate-700/50">
        {usage.map((row) => {
          const badge = typeBadge(row.request_type);
          return (
            <li key={row.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                &minus;{row.credits_used} cr
              </span>
              {row.model && (
                <span className="hidden text-xs text-slate-600 sm:inline">{row.model}</span>
              )}
              <span className="ml-auto text-xs text-slate-500">
                {relativeTime(row.created_at)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Credit purchase — with pricing tiers                               */
/* ------------------------------------------------------------------ */

function CreditPurchaseSection({
  checkoutHref,
  checkoutUrl,
  hasCredits,
  plans,
}: {
  checkoutHref: string;
  checkoutUrl: string;
  hasCredits: boolean;
  plans: {
    tier: "Lite" | "Standard" | "Pro";
    credits: number;
    price: string;
  }[];
  userId: string;
}) {
  const [selected, setSelected] = useState(0);
  const plan = plans[selected] ?? plans[0];

  const selectedCheckoutHref = useMemo(() => {
    if (!checkoutHref) return checkoutHref;
    try {
      const url = new URL(checkoutHref);
      url.searchParams.set("checkout[custom][selected_plan]", plan.tier.toLowerCase());
      url.searchParams.set("checkout[custom][selected_credits]", String(plan.credits));
      return url.toString();
    } catch {
      return checkoutHref;
    }
  }, [checkoutHref, plan]);

  return (
    <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-slate-950/70 to-indigo-950/40 p-6 shadow-[0_0_48px_-12px_rgba(139,92,246,0.2)] md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/90">
        Credits
      </p>
      <h2 className="mt-3 text-balance text-2xl font-bold leading-tight text-white md:text-3xl">
        {hasCredits ? "Need More Credits?" : "Power Up Your AI Features"}
      </h2>
      <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-slate-300 md:text-base">
        Credits fuel every AI interaction — voice conversations, news briefings,
        autonomous research, and visual mapping.
      </p>

      {/* Selectable pricing cards */}
      <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
        {plans.map((p, i) => {
          const isSelected = i === selected;
          return (
            <button
              key={p.tier}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-violet-400 bg-violet-900/40 shadow-[0_0_32px_-6px_rgba(139,92,246,0.45)] ring-1 ring-violet-400/30"
                  : "border-slate-700/50 bg-slate-900/40 hover:border-slate-600/70"
              }`}
            >
              {p.tier === "Standard" && (
                <span className="absolute -top-2.5 left-3 rounded-full bg-violet-500 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                  Best value
                </span>
              )}
              {isSelected && (
                <span className="absolute -top-2 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
                </span>
              )}
              <p className={`text-sm font-semibold ${isSelected ? "text-violet-200" : "text-slate-300"}`}>{p.tier}</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">
                {p.credits.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-slate-400">credits</span>
              </p>
              <p className={`mt-1 text-lg font-semibold tabular-nums ${isSelected ? "text-violet-300" : "text-slate-400"}`}>{p.price}</p>
              <p className="mt-auto pt-2 text-xs text-slate-500">
                ${(Number(p.price.replace("$", "")) / p.credits).toFixed(3)} / credit
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
        <p className="text-xs text-violet-200/90">
          Selected plan: <span className="font-semibold">{plan.tier}</span> ({plan.credits.toLocaleString()} credits)
        </p>
        {checkoutUrl ? (
          <a
            href={selectedCheckoutHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-violet-500 px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_32px_-8px_rgba(139,92,246,0.5)] transition hover:bg-violet-400 md:w-auto md:text-lg"
          >
            {hasCredits ? "Buy More Credits" : "Get Credits"} — {plan.tier} ({plan.price})
          </a>
        ) : (
          <p className="text-sm text-rose-300">
            Missing `NEXT_PUBLIC_LEMON_CHECKOUT_URL` environment variable.
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-400 md:text-sm">
          <IconShield className="h-4 w-4 shrink-0 text-emerald-400/80" />
          <span>Credits are added to your account instantly after payment.</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500 md:text-left md:text-sm">
        Secure checkout via LemonSqueezy. No subscriptions — buy credits when you need them.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Setup guide                                                        */
/* ------------------------------------------------------------------ */

function SetupGuide() {
  return (
    <section
      className="rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-slate-950/80 to-indigo-950/40 p-6 shadow-[0_0_40px_-12px_rgba(34,211,238,0.15)]"
      aria-labelledby="rage-setup-guide-heading"
    >
      <h2
        id="rage-setup-guide-heading"
        className="text-lg font-semibold tracking-tight text-cyan-200 neon-text md:text-xl"
      >
        R.A.G.E Setup Guide
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        After downloading, follow these steps to get started.
      </p>

      <ol className="mt-6 space-y-4">
        <li className="relative flex gap-4 rounded-xl border border-indigo-500/30 bg-slate-900/50 p-4 md:gap-5 md:p-5">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/10 text-xs font-bold text-cyan-300">
              1
            </span>
            <div className="flex flex-col items-center gap-1 text-cyan-400/90">
              <IconMic className="h-7 w-7 md:h-8 md:w-8" />
              <IconMonitor className="h-6 w-6 opacity-90" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white">Step 1: System Permissions &amp; Security</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              If you see a security warning on the first launch, go to{" "}
              <strong className="text-slate-100">System Settings</strong> &gt;{" "}
              <strong className="text-slate-100">Privacy &amp; Security</strong> and
              click <strong className="text-cyan-200">&apos;Open Anyway&apos;</strong>{" "}
              for R.A.G.E to allow access.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              When prompted, please grant permissions for both the{" "}
              <strong className="text-cyan-200">&apos;Microphone&apos;</strong> and{" "}
              <strong className="text-cyan-200">&apos;Screen &amp; System Audio Recording&apos;</strong>.
            </p>
            <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
              <span className="font-medium text-amber-200/95">Tip:</span> If features are
              not responding after granting permissions, fully quit the app (
              <kbd className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.7rem] text-slate-200">Cmd+Q</kbd>
              ) and restart it.
            </p>
          </div>
        </li>

        <li className="relative flex gap-4 rounded-xl border border-indigo-500/30 bg-slate-900/50 p-4 md:gap-5 md:p-5">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/50 bg-violet-500/10 text-xs font-bold text-violet-200">
              2
            </span>
            <div className="flex flex-col items-center gap-1 text-violet-300/90">
              <IconCog className="h-6 w-6 opacity-90" />
              <IconKey className="h-7 w-7 md:h-8 md:w-8" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white">Step 2: Sign In to Your Account</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Open the app and sign in with the same account you created on this website.
              This connects the app to your credit balance and AI backend.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              No credits yet? Purchase them above — they&apos;ll be ready instantly
              in the app after you sign in.
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
}
