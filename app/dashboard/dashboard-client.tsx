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

function IconMic({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  );
}

function IconMonitor({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

function IconKey({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconCog({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.31.22.65.22 1v.09c0 .35-.08.69-.22 1" />
    </svg>
  );
}

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

              <section
                className="mt-10 rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-slate-950/80 to-indigo-950/40 p-6 shadow-[0_0_40px_-12px_rgba(34,211,238,0.15)]"
                aria-labelledby="jarvis-setup-guide-heading"
              >
                <h2
                  id="jarvis-setup-guide-heading"
                  className="text-lg font-semibold tracking-tight text-cyan-200 neon-text md:text-xl"
                >
                  J.A.R.V.I.S. 시작 가이드 (초기 설정)
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  설치 후 아래 순서대로 진행하면 바로 사용할 수 있어요.
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
                      <h3 className="font-semibold text-white">Step 1: 필수 권한 허용</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        앱 실행 후 마이크 권한과 화면 및 시스템 오디오 녹음 권한 요청 팝업이 뜨면 반드시{" "}
                        <strong className="text-cyan-200">&apos;허용&apos;</strong>을 눌러주세요.
                      </p>
                      <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
                        (팁: 권한을 켰는데도 작동하지 않는다면 앱을 완전히 종료{" "}
                        <kbd className="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.7rem] text-slate-200">
                          Cmd+Q
                        </kbd>
                        한 후 다시 실행해 보세요.)
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
                      <h3 className="font-semibold text-white">Step 2: AI 두뇌 활성화</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        자비스 메인 화면 오른쪽 상단의{" "}
                        <strong className="text-violet-200">톱니바퀴 아이콘(OpenAI 설정)</strong>을
                        클릭하세요.
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        본인의 OpenAI API Key를 입력하면 모든 AI 비서 기능이 활성화됩니다.
                      </p>
                    </div>
                  </li>
                </ol>
              </section>
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
