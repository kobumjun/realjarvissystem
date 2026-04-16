import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";

const FEATURES = [
  {
    heading: "R.A.G.E Monitors Markets 24/7",
    description:
      "Real-time anomaly detection helps you catch unusual market moves as they happen.",
    image: "/images/feature-voice.png",
    alt: "R.A.G.E realtime market monitoring dashboard",
  },
  {
    heading: "Voice-Controlled Trading Interface",
    description:
      "Use natural voice commands to inspect symbols, surface risk, and move faster during live sessions.",
    image: "/images/feature-news.png",
    alt: "R.A.G.E voice command trading view",
  },
  {
    heading: "Realtime Analytical Grid Engine",
    description:
      "R.A.G.E fuses market streams into a single analytical grid so you can react with confidence.",
    image: "/images/feature-research.png",
    alt: "R.A.G.E analytical signal grid",
  },
  {
    heading: "Your Trading Edge",
    description:
      "Transform scattered market data into clear structures and actionable AI-assisted briefings.",
    image: "/images/feature-mapping.png",
    alt: "R.A.G.E visual signal mapping",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-8 md:px-14">
      {/* Nav */}
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <p className="text-lg font-semibold tracking-[0.25em] text-cyan-300 neon-text">
          R.A.G.E
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="hidden items-center gap-1.5 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Sign in to download
          </Link>
          <Link
            href="/auth"
            className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm text-cyan-100 hover:border-cyan-300"
          >
            Login / Sign Up
          </Link>
        </div>
      </nav>

      <main className="mx-auto mt-10 w-full max-w-6xl md:mt-14">
        {/* ───────────────────── Hero ───────────────────── */}
        <section className="text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            R.A.G.E
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-pretty text-xl font-semibold text-cyan-200 md:text-2xl">
            Realtime Analytical Grid Engine
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg lg:text-xl">
            AI-Powered Trading Co-Pilot
          </p>

          {/* Dual CTA */}
          <div className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-[0_0_32px_-8px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300 sm:w-auto md:text-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Sign in to download
            </Link>
            <Link
              href="/auth"
              className="inline-flex w-full items-center justify-center rounded-lg border border-violet-500/60 px-7 py-3.5 text-base font-semibold text-violet-200 transition hover:border-violet-400 hover:text-white sm:w-auto md:text-lg"
            >
              Sign In &amp; Get Credits
            </Link>
          </div>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500 md:text-sm">
            Create a free account to download the app and access your secure dashboard.
          </p>

          {/* MacBook frame */}
          <div className="relative mx-auto mt-12 max-w-5xl">
            <div
              className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-b from-cyan-500/25 via-indigo-500/15 to-violet-600/20 opacity-90 blur-2xl"
              aria-hidden
            />
            <div className="relative mx-auto rounded-[1.35rem] border border-slate-600/60 bg-gradient-to-b from-slate-700/90 via-slate-900 to-slate-950 p-3 shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_25px_80px_-20px_rgba(0,0,0,0.75),0_0_60px_-15px_rgba(34,211,238,0.2)] md:p-4 md:pb-5">
              <div className="mb-2 flex justify-center md:mb-3">
                <div className="h-2 w-16 rounded-full bg-slate-950/80 ring-1 ring-slate-600/40 md:h-2.5 md:w-20" />
              </div>
              <div className="overflow-hidden rounded-lg border border-cyan-500/20 bg-slate-950 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/landing-main.png"
                  alt="J.A.R.V.I.S. for macOS — main product preview"
                  width={1280}
                  height={720}
                  className="h-auto w-full object-cover object-top"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-slate-800/90 md:mt-4 md:w-32" aria-hidden />
            </div>
          </div>
        </section>

        {/* ──────────── How it works (3-step) ──────────── */}
        <ScrollReveal>
          <section className="glass-panel mx-auto mt-20 rounded-2xl p-6 md:mt-28 md:p-8">
            <h2 className="text-center text-xl font-semibold text-white md:text-2xl">
              How It Works
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
              {[
                ["1. Download R.A.G.E", "Install the desktop app and connect your account in minutes."],
                ["2. Add Symbols", "Build your watchlist and tune what R.A.G.E monitors for you."],
                ["3. Enable Monitoring", "Let R.A.G.E watch market signals and alert you in real time."],
                ["4. Voice Commands", "Try: \"Rage, analyze NVDA\" for fast, spoken market analysis."],
              ].map(([title, desc]) => (
                <article
                  key={title}
                  className="rounded-xl border border-indigo-400/30 bg-indigo-900/20 p-4 md:p-5"
                >
                  <h3 className="font-semibold text-cyan-200">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{desc}</p>
                </article>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ───────────────── Feature sections ────────────── */}
        <div className="mt-20 space-y-28 md:mt-28 md:space-y-36">
          {FEATURES.map((f, i) => {
            const reversed = i % 2 === 1;
            return (
              <ScrollReveal key={f.heading}>
                <section
                  className={`flex flex-col items-center gap-8 md:gap-12 ${
                    reversed ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <h2 className="text-balance text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                      {f.heading}
                    </h2>
                    <p className="max-w-lg text-pretty text-sm leading-relaxed text-slate-300 md:text-base">
                      {f.description}
                    </p>
                  </div>
                  <div className="w-full flex-1">
                    <div className="feature-img-glow overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.image}
                        alt={f.alt}
                        width={800}
                        height={500}
                        className="h-auto w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </section>
              </ScrollReveal>
            );
          })}
        </div>

        {/* ───────── Core capabilities ──────── */}
        <ScrollReveal>
          <section className="glass-panel mx-auto mt-20 rounded-2xl p-6 md:mt-28 md:p-8">
            <h2 className="text-center text-xl font-semibold text-white md:text-2xl">
              R.A.G.E Core Capabilities
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
              {[
                ["24/7 Market Watch", "R.A.G.E monitors symbols continuously and flags abnormal conditions."],
                ["Signal Detection", "Catch momentum shifts and volatility spikes before they spread."],
                ["Voice Trading Control", "Use spoken commands to inspect symbols and run quick analysis."],
              ].map(([title, desc]) => (
                <article
                  key={title}
                  className="rounded-xl border border-indigo-400/30 bg-indigo-900/20 p-4 md:p-5"
                >
                  <h3 className="font-semibold text-cyan-200">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{desc}</p>
                </article>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ─────────────── Final CTA ────────────────────── */}
        <ScrollReveal>
          <section className="mx-auto mt-20 max-w-3xl pb-16 text-center md:mt-28">
            <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">
              Start Monitoring Markets with R.A.G.E
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
              Download R.A.G.E, sign in, and activate AI-powered monitoring with credits.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth"
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-cyan-400 px-8 py-3.5 text-base font-semibold text-slate-950 shadow-[0_0_32px_-8px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300 sm:w-auto md:text-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Sign in to download
              </Link>
              <Link
                href="/auth"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-lg border border-violet-500/60 px-8 py-3.5 text-base font-semibold text-violet-200 transition hover:border-violet-400 hover:text-white sm:w-auto md:text-lg"
              >
                Start Monitoring Markets
              </Link>
            </div>
            <p className="mt-3 max-w-md mx-auto text-xs leading-relaxed text-slate-500 md:text-sm">
              Download is available right after free sign-up. Credits start at just a few dollars.
            </p>
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
