"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Authentication failed";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-md rounded-2xl p-6">
      <div className="mb-6 flex gap-2 rounded-xl border border-cyan-900/70 p-1">
        {(["login", "signup"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`w-1/2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === option
                ? "bg-cyan-400 text-slate-950"
                : "text-slate-300 hover:bg-cyan-950/40"
            }`}
          >
            {option === "login" ? "Login" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-indigo-700/70 bg-slate-950/60 px-3 py-2 outline-none focus:border-cyan-400"
        />
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="password"
          className="w-full rounded-lg border border-indigo-700/70 bg-slate-950/60 px-3 py-2 outline-none focus:border-cyan-400"
        />
        <button
          disabled={loading}
          className="w-full rounded-lg bg-cyan-400 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-cyan-700"
        >
          {loading ? "Working..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-rose-300">{message}</p> : null}
    </div>
  );
}
