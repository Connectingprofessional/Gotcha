import { useEffect, useState } from "react";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { App } from "@/components/App";
import { useGotcha } from "@/lib/store";
import { authClient } from "@/lib/auth/client";

export function ExperienceGate() {
  const sessionEmail = useGotcha((s) => s.sessionEmail);
  const hydrateFromAuth = useGotcha((s) => s.hydrateFromAuth);
  const { data: authSession } = authClient.useSession();
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authSession?.user?.email && !sessionEmail) {
      hydrateFromAuth(authSession.user.email, authSession.user.name ?? "");
    }
  }, [authSession, sessionEmail, hydrateFromAuth]);

  if (!entered) return <Landing onEnter={() => setEntered(true)} />;
  if (authSession?.user?.email) return <App />;

  async function google() {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/", errorCallbackURL: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="gotecha-grid min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1180px] items-center justify-center px-5 py-10">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-border bg-card/90 shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
          <section className="relative hidden min-h-[680px] overflow-hidden border-r border-border p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -left-24 top-12 size-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-primary-3">Experience Gotcha</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">before you get started</h2><p className="mt-3 max-w-md text-sm leading-6 text-muted">See how Gotcha turns your career goals into a focused, intelligent opportunity hunt.</p></div>
            <div className="relative rounded-2xl border border-primary/20 bg-primary/5 p-6"><div className="flex size-12 items-center justify-center rounded-xl bg-primary/15"><Play className="size-5 text-primary-3" fill="currentColor" /></div><p className="mt-5 text-lg font-semibold">RUN 90-SECOND DEMO</p><p className="mt-2 text-sm leading-6 text-muted">Discover AI job search, career intelligence, opportunity matching and application momentum.</p><button type="button" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold">Watch demo <ArrowRight className="size-3.5" /></button></div>
            <p className="relative text-xs text-subtle">Your career command center begins after sign in.</p>
          </section>
          <section className="flex min-h-[680px] flex-col justify-center p-7 sm:p-10">
            <div className="mx-auto w-full max-w-[390px]">
              <div className="mb-9 lg:hidden"><p className="text-[10px] font-bold uppercase tracking-[.28em] text-primary-3">Experience Gotcha</p><p className="mt-2 text-sm text-muted">before you get started</p></div>
              <div className="mb-8"><div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10"><Sparkles className="size-5 text-primary-3" /></div><h1 className="text-3xl font-semibold tracking-tight">Welcome Back!</h1><p className="mt-2 text-sm text-muted">Sign in to continue</p></div>
              <button type="button" disabled={busy} onClick={google} className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold hover:border-primary/50 disabled:opacity-50"><span className="grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-700">G</span>{busy ? "Connecting to Google…" : "Continue with Google"}</button>
              {error && <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300">{error}</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Landing({ onEnter }: { onEnter: () => void }) {
  return <main className="relative min-h-dvh overflow-hidden bg-[#050912] text-white"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(100,160,200,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,160,200,.08) 1px, transparent 1px)", backgroundSize: "46px 46px" }} /><div className="absolute left-1/2 top-1/2 size-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px]" /><div className="relative mx-auto flex min-h-dvh max-w-[1500px] flex-col items-center justify-center px-6 text-center"><div className="mb-10 text-[10px] font-semibold uppercase tracking-[.5em] text-cyan-300/80">THE HUNT ENDS HERE</div><div className="relative w-full overflow-hidden py-8"><div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10" /><h1 className="select-none text-[clamp(5rem,17vw,15rem)] font-black leading-[.78] tracking-[-.075em] text-white drop-shadow-[0_0_45px_rgba(34,211,238,.18)]">GOTCHA</h1><div className="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-3 text-xs uppercase tracking-[.3em] text-slate-400"><span className="h-px w-12 bg-slate-700" />AI CAREER INTELLIGENCE<span className="h-px w-12 bg-slate-700" /></div></div><button type="button" onClick={onEnter} className="group mt-12 inline-flex items-center gap-4 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-8 py-4 text-sm font-bold tracking-[.22em] text-white transition hover:scale-105 hover:bg-cyan-300/20">ENTER <ArrowRight className="size-4 transition group-hover:translate-x-1" /></button><p className="mt-5 text-xs text-slate-500">Your next opportunity starts here.</p></div></main>;
}
