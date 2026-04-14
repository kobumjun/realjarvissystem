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

      <main className="mx-auto mt-16 grid w-full max-w-6xl gap-10 md:grid-cols-2">
        <section className="space-y-6">
          <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs tracking-[0.2em] text-cyan-200">
            FOR GLOBAL BUILDERS
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Jarvis for Mac
            <span className="block text-cyan-300 neon-text">Your AI command bridge</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            Talk naturally with your desktop assistant, let it understand your screen
            in real time, and keep your model credentials in your control with BYOK.
          </p>
          <Link
            href="/auth"
            className="inline-flex rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Start with free account
          </Link>
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white">Core capabilities</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Real-time Voice", "Natural voice conversation with low-latency response loop."],
              ["Screen Perception", "Understand active windows and on-screen context while you build."],
              ["BYOK Security", "Bring your own key policy. Your model key stays under your control."],
            ].map(([title, desc]) => (
              <article
                key={title}
                className="rounded-xl border border-indigo-400/30 bg-indigo-900/20 p-4"
              >
                <h3 className="font-semibold text-cyan-200">{title}</h3>
                <p className="mt-1 text-sm text-slate-300">{desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
