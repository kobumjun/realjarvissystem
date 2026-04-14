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
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-3xl">
        <h1 className="mb-3 text-center text-3xl font-bold text-cyan-300 neon-text">
          Access Jarvis for Mac
        </h1>
        <p className="mb-8 text-center text-slate-300">
          Log in or create your account. You will be redirected to your payment and
          download dashboard after authentication.
        </p>
        <div className="flex justify-center">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
