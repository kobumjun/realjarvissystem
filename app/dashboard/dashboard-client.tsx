"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buildLemonCheckoutUrl } from "@/lib/lemon/build-checkout-url";

type Props = {
  email: string;
  userId: string;
  hasAccess: boolean;
  checkoutUrl: string;
  downloadUrl: string;
  downloadFileName: string;
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

function IconVoice({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" /><path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
    </svg>
  );
}

function IconZap({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardClient({
  email,
  userId,
  hasAccess: initialHasAccess,
  checkoutUrl,
  downloadUrl,
  downloadFileName,
}: Props) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(initialHasAccess);

  const pollAccess = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_access")
        .select("has_access")
        .eq("user_id", userId)
        .maybeSingle<{ has_access: boolean }>();
      if (data?.has_access && !hasAccess) {
        setHasAccess(true);
      }
    } catch {
      // network hiccup — skip this tick
    }
  }, [userId, hasAccess]);

  useEffect(() => {
    if (hasAccess) return;
    const id = setInterval(pollAccess, 5_000);
    return () => clearInterval(id);
  }, [hasAccess, pollAccess]);

  useEffect(() => {
    if (hasAccess) return;
    const supabase = createClient();
    const channel = supabase
      .channel("user_access_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_access",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { has_access?: boolean };
          if (row.has_access) setHasAccess(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, hasAccess]);

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const checkoutHref = useMemo(() => {
    if (!checkoutUrl || hasAccess) return checkoutUrl;
    return buildLemonCheckoutUrl(checkoutUrl, { email, userId });
  }, [checkoutUrl, email, userId, hasAccess]);

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="glass-panel mx-auto w-full max-w-3xl rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Jarvis for Mac</h1>
            <p className="mt-2 text-slate-300">{email || "Unknown email"}</p>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-400"
          >
            Logout
          </button>
        </div>

        {/* Main content — conditional on payment status */}
        <div className="mt-8">
          {hasAccess ? (
            <PaidSection
              downloadUrl={downloadUrl}
              downloadFileName={downloadFileName}
            />
          ) : (
            <UnpaidSection checkoutHref={checkoutHref} checkoutUrl={checkoutUrl} />
          )}
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Paid: welcome + download + setup guide                             */
/* ------------------------------------------------------------------ */

function PaidSection({
  downloadUrl,
  downloadFileName,
}: {
  downloadUrl: string;
  downloadFileName: string;
}) {
  return (
    <>
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-slate-950/60 p-6 text-center shadow-[0_0_48px_-12px_rgba(16,185,129,0.18)]">
        <p className="text-sm font-medium tracking-wide text-emerald-300">PREMIUM ACTIVE</p>
        <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
          Welcome, Agent. Your J.A.R.V.I.S. is ready.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
          Your premium access is confirmed. Download the installer below and follow the
          setup guide to get started.
        </p>

        <a
          href={downloadUrl}
          download={downloadFileName}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-[0_0_28px_-6px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300 md:text-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download J.A.R.V.I.S. for macOS
        </a>
      </div>

      {/* Setup guide */}
      <section
        className="mt-10 rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-slate-950/80 to-indigo-950/40 p-6 shadow-[0_0_40px_-12px_rgba(34,211,238,0.15)]"
        aria-labelledby="jarvis-setup-guide-heading"
      >
        <h2
          id="jarvis-setup-guide-heading"
          className="text-lg font-semibold tracking-tight text-cyan-200 neon-text md:text-xl"
        >
          J.A.R.V.I.S. Setup Guide
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          After installation, complete these steps in order for a smooth first run.
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
                for JARVIS to allow access.
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
              <h3 className="font-semibold text-white">Step 2: Activate AI Brain</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Click the <strong className="text-violet-200">Gear Icon (OpenAI Settings)</strong>{" "}
                located in the top-right corner of the dashboard.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Enter your personal OpenAI API Key to fully activate all AI assistant
                functionalities.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Unpaid: Premium upsell                                             */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  {
    icon: IconVoice,
    title: "Unlimited Live Voice Mode",
    desc: "Speak naturally with J.A.R.V.I.S. — no session caps, no interruptions.",
  },
  {
    icon: IconGlobe,
    title: "Real-time News & Web Analysis",
    desc: "Instant insights from the web, summarized and delivered on demand.",
  },
  {
    icon: IconZap,
    title: "Full Workflow Automation",
    desc: "Automate every repetitive task. Let J.A.R.V.I.S. handle the heavy lifting.",
  },
] as const;

function UnpaidSection({
  checkoutHref,
  checkoutUrl,
}: {
  checkoutHref: string;
  checkoutUrl: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-slate-950/70 to-indigo-950/40 p-6 shadow-[0_0_48px_-12px_rgba(139,92,246,0.2)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/90">
          Premium
        </p>
        <h2 className="mt-3 text-balance text-2xl font-bold leading-tight text-white md:text-3xl">
          Upgrade to J.A.R.V.I.S. Premium
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-slate-300 md:text-base">
          Unlock your personal command center. Get full access to every feature
          J.A.R.V.I.S. has to offer — built for builders who move fast.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-3 rounded-xl border border-indigo-500/25 bg-slate-900/50 p-4"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-300">
                <Icon />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 md:items-start">
          {checkoutUrl ? (
            <a
              href={checkoutHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-violet-500 px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_32px_-8px_rgba(139,92,246,0.5)] transition hover:bg-violet-400 md:w-auto md:text-lg"
            >
              Upgrade Now
            </a>
          ) : (
            <p className="text-sm text-rose-300">
              Missing `NEXT_PUBLIC_LEMON_CHECKOUT_URL` environment variable.
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 md:text-sm">
            <IconShield className="h-4 w-4 shrink-0 text-emerald-400/80" />
            <span>
              Download link will be unlocked immediately after payment.
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 md:text-sm">
        Secure checkout via LemonSqueezy. One-time payment, lifetime access.
      </p>
    </div>
  );
}
