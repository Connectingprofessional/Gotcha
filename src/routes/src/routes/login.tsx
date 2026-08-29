// src/routes/login.tsx
import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient, authEnabled, GROK_PROVIDERS, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

type Mode = "signin" | "signup";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { error } =
        mode === "signup"
          ? await authClient.signUp.email({ email, password, name })
          : await authClient.signIn.email({ email, password });
      if (error) {
        setErr(error.message ?? "Something went wrong.");
        return;
      }
      navigate({ to: "/" });
    } catch {
      setErr("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-fg">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-border bg-surface p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary-3">Gotcha</p>
          <h1 className="mt-1 text-xl font-semibold">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h1>
        </div>
        {!authEnabled ? (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        ) : (
          <>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  authClient.signIn.social({ provider: "google", callbackURL: "/" })
                }
                className="w-full cursor-pointer rounded-md border border-border bg-input py-2.5 text-sm font-medium hover:bg-card"
              >
                Continue with Google
              </button>
              {GROK_PROVIDERS.filter((p) => p.idp !== "google").map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                  className="w-full cursor-pointer rounded-md border border-border bg-input py-2.5 text-sm font-medium hover:bg-card"
                >
                  Continue with {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>
            <form className="space-y-2" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <input type="text" required placeholder="Name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-border-strong" />
              )}
              <input type="email" required placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-border-strong" />
              <input type="password" required minLength={8} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-border-strong" />
              {err && <p className="text-[11px] text-danger">{err}</p>}
              <button type="submit" disabled={busy}
                className="w-full cursor-pointer rounded-md bg-primary py-2.5 text-sm font-medium disabled:cursor-wait disabled:opacity-50">
                {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>
            <button type="button" onClick={() => { setErr(""); setMode(mode === "signup" ? "signin" : "signup"); }}
              className="w-full cursor-pointer text-center text-xs text-muted underline-offset-4 hover:underline">
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
