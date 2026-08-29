import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Play, Sparkles } from "lucide-react";
import { App } from "@/components/App";
import { useGotcha } from "@/lib/store";
import { authClient, signIn } from "@/lib/auth/client";
import { GROK_PROVIDERS } from "@/lib/auth/providers";

export function ExperienceGate() {
  const sessionEmail = useGotcha((s) => s.sessionEmail);
  const hydrateFromAuth = useGotcha((s) => s.hydrateFromAuth);
  const { data: authSession, isPending: authPending } = authClient.useSession();
  const [entered, setEntered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authSession?.user?.email && !sessionEmail) {
      hydrateFromAuth(authSession.user.email, authSession.user.name ?? "");
    }
  }, [authSession, sessionEmail, hydrateFromAuth]);

  if (authSession?.user?.email) return <App />;
  if (!entered) return <Landing onEnter={() => setEntered(true)} />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (registering) {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: normalizedEmail,
          password,
          callbackURL: "/",
        });
        if (result.error) throw new Error(result.error.message ?? "Unable to create account");
        const user = result.data?.user;
        if (!user?.email) throw new Error("Account was not created. Please try again.");
        hydrateFromAuth(user.email, user.name ?? name.trim());
        await authClient.getSession();
      } else {
        const result = await authClient.signIn.email({
          email: normalizedEmail,
          password,
        });
        if (result.error) throw new Error(result.error.message ?? "Unable to sign in");
        const user = result.data?.user;
        if (user?.email) {
          hydrateFromAuth(user.email, user.name ?? "");
        } else {
          const refreshed = await authClient.getSession();
          if (!refreshed.data?.user?.email) {
            throw new Error("Sign-in succeeded but the session could not be established. Please try again.");
          }
          hydrateFromAuth(refreshed.data.user.email, refreshed.data.user.name ?? "");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const provider = GROK_PROVIDERS.find((p) => p.idp === "google");
      if (!provider) throw new Error("Google sign-in is not configured");
      await signIn(provider.providerId, { callbackURL: "/" });
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
              <div className="mb-8"><div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10"><Sparkles className="size-5 text-primary-3" /></div><h1 className="text-3xl font-semibold tracking-tight">{registering ? "Create your account" : "Welcome Back!"}</h1><p className="mt-2 text-sm text-muted">{registering ? "Start your intelligent career hunt" : "Sign in to continue"}</p></div>
              <button type="button" disabled={busy || authPending} onClick={google} className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold hover:border-primary/50 disabled:opacity-50"><span className="grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-700">G</span>Continue with Google</button>
              <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-border" /><span className="text-[10px] uppercase tracking-[.18em] text-subtle">or</span><span className="h-px flex-1 bg-border" /></div>
              <form onSubmit={submit} className="space-y-4">
                {registering && <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted">Full name</span><input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Your name" /></label>}
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none focus:border-primary" placeholder="you@example.com" /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-medium text-muted">Password</span><span className="relative block"><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-11 text-sm outline-none focus:border-primary" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><span className="sr-only">Toggle password visibility</span>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-5" />}</button></span></label>
                {!registering && <div className="flex justify-end"><button type="button" className="text-xs font-medium text-primary-3 hover:text-fg">Forgot Password?</button></div>}
                {error && <p className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300">{error}</p>}
                <button type="submit" disabled={busy || authPending} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold tracking-wide disabled:opacity-50">{busy ? "PLEASE WAIT..." : registering ? "CREATE ACCOUNT" : "SIGN IN"}</button>
              </form>
              <div className="mt-7 text-center text-xs text-muted">{registering ? "Already have an account?" : "New to Gotcha?"} <button type="button" onClick={() => { setRegistering((v) => !v); setError(""); }} className="font-semibold text-primary-3">{registering ? "Sign in" : "Create account"}</button></div>
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
