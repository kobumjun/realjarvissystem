import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-8 md:px-14">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <p className="text-lg font-semibold tracking-[0.25em] text-cyan-300 neon-text">
          JARVIS
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm text-cyan-100 hover:border-cyan-300"
          >
            Login / Sign Up
          </Link>
        </div>
      </nav>

      <main className="mx-auto mt-10 w-full max-w-6xl md:mt-14">
        {/* Hero marketing */}
        <section className="text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Your Personal J.A.R.V.I.S. for macOS
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg lg:text-xl">
            Real-time voice, Smart Search, and Visual Knowledge Mapping. Experience the
            next level of AI assistance.
          </p>

          <div className="relative mx-auto mt-12 max-w-5xl">
            <div
              className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-b from-cyan-500/25 via-indigo-500/15 to-violet-600/20 opacity-90 blur-2xl"
              aria-hidden
            />
            {/* MacBook-style frame */}
            <div className="relative mx-auto rounded-[1.35rem] border border-slate-600/60 bg-gradient-to-b from-slate-700/90 via-slate-900 to-slate-950 p-3 shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_25px_80px_-20px_rgba(0,0,0,0.75),0_0_60px_-15px_rgba(34,211,238,0.2)] md:p-4 md:pb-5">
              <div className="mb-2 flex justify-center md:mb-3">
                <div className="h-2 w-16 rounded-full bg-slate-950/80 ring-1 ring-slate-600/40 md:h-2.5 md:w-20" />
              </div>
              <div className="overflow-hidden rounded-lg border border-cyan-500/20 bg-slate-950 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- marketing asset; swap PNG in /public/images */}
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

        {/* CTA + trust — flows directly after hero */}
        <section className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-3 md:mt-14">
          <Link
            href="/auth"
            className="inline-flex w-full max-w-md items-center justify-center rounded-lg bg-cyan-400 px-8 py-3.5 text-base font-semibold text-slate-950 shadow-[0_0_32px_-8px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300 md:text-lg"
          >
            Login / Sign Up
          </Link>
          <Link
            href="/auth"
            className="text-sm font-medium text-cyan-200/90 underline-offset-4 hover:text-cyan-100 hover:underline"
          >
            Start with free account
          </Link>
          <p className="max-w-md text-center text-xs leading-relaxed text-slate-500 md:text-sm">
            No Credit Card Required. Free to use with your own OpenAI Key.
          </p>
        </section>

        {/* Supporting capabilities */}
        <section className="glass-panel mx-auto mt-16 rounded-2xl p-6 md:mt-20 md:p-8">
          <h2 className="text-center text-xl font-semibold text-white md:text-2xl">
            Core capabilities
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
            {[
              ["Real-time Voice", "Natural voice conversation with low-latency response loop."],
              ["Screen Perception", "Understand active windows and on-screen context while you build."],
              ["BYOK Security", "Bring your own key policy. Your model key stays under your control."],
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
      </main>
    </div>
  );
}
