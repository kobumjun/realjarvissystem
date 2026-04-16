import { redirect } from "next/navigation";
import AuthForm from "@/app/auth/auth-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center lg:gap-12">
        <section className="flex flex-col justify-center space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-400/90">
            R.A.G.E for Mac
          </p>
          <h2 className="text-balance text-3xl font-bold leading-tight text-white md:text-4xl">
            Sign in to power up your R.A.G.E dashboard.
          </h2>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg">
            The app is free to download. Create an account to connect your AI features,
            track your credit balance, and unlock voice, briefings, and research.
          </p>
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div
              className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500/35 via-indigo-500/20 to-violet-600/25 opacity-90 blur-md"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/60 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_48px_-8px_rgba(34,211,238,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- explicit <img> for easy screenshot swap in /public */}
              <img
                src="/images/jarvis-preview.png"
                alt="R.A.G.E for macOS dashboard preview"
                width={960}
                height={540}
                className="h-auto w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <div className="flex w-full flex-col items-center lg:items-stretch">
          <h1 className="mb-3 text-center text-3xl font-bold text-cyan-300 neon-text lg:text-left">
            Your R.A.G.E Account
          </h1>
          <p className="mb-8 text-center text-slate-300 lg:text-left">
            Sign in or create a free account. Manage your credits and AI usage
            from your dashboard.
          </p>
          <div className="flex w-full flex-col items-center gap-3 lg:items-start">
            <AuthForm />
            <p className="max-w-md text-center text-xs leading-relaxed text-slate-500 lg:text-left">
              Free to sign up. No credit card required to create your account.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
