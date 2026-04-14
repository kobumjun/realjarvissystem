"use client";

import { useMemo } from "react";
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

export default function DashboardClient({
  email,
  userId,
  hasAccess,
  checkoutUrl,
  downloadUrl,
  downloadFileName,
}: Props) {
  const router = useRouter();

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Jarvis for Mac Access</h1>
            <p className="mt-2 text-slate-300">{email || "Unknown email"}</p>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:border-slate-400"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-indigo-400/30 bg-slate-950/40 p-5">
          {hasAccess ? (
            <>
              <p className="text-sm text-emerald-300">Payment confirmed. Download unlocked.</p>
              <a
                href={downloadUrl}
                download={downloadFileName}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Download .dmg for Mac
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-amber-200">
                Your account does not have paid access yet. Complete payment to unlock
                the installer.
              </p>
              {checkoutUrl ? (
                <a
                  href={checkoutHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-lg bg-violet-400 px-5 py-3 font-semibold text-slate-950 hover:bg-violet-300"
                >
                  Pay with LemonSqueezy
                </a>
              ) : (
                <p className="mt-3 text-sm text-rose-300">
                  Missing `NEXT_PUBLIC_LEMON_CHECKOUT_URL` environment variable.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
