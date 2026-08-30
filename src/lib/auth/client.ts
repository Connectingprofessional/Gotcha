import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for this React SPA (browser-side).
 *
 * Talks to this app's OWN Better Auth at same-origin `/api/auth/*`. This is a
 * standalone deploy (no Grok Build sandbox/broker), so sign-in is native
 * Better Auth: email/password and whichever social providers are configured
 * server-side (see `server.ts`), via `authClient.signIn.email` /
 * `authClient.signIn.social`.
 */
export const authClient = createAuthClient();

/**
 * True when sign-in UI should be shown — i.e. whenever `VITE_AUTH_ENABLED` is
 * not `"false"`.
 */
export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";

/**
 * Sign out of this app's session, then redirect.
 *
 * Bounded so a wedged request reports failure the visitor can retry instead
 * of spinning forever — the session rides an HttpOnly `__Host-` cookie only
 * the server can clear, so a timeout must fail loudly rather than pretend.
 */
const SIGN_OUT_TIMEOUT_MS = 10_000;

function settleWithin(start: () => unknown, timeoutMs: number): Promise<"ok" | "failed" | "timeout"> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve("timeout"), timeoutMs);
    const done = (outcome: "ok" | "failed") => {
      clearTimeout(timer);
      resolve(outcome);
    };
    try {
      Promise.resolve(start()).then(
        () => done("ok"),
        () => done("failed"),
      );
    } catch {
      done("failed");
    }
  });
}

export async function signOut(redirectTo = "/"): Promise<void> {
  const outcome = await settleWithin(async () => {
    // Better Auth resolves with `{ error }` instead of rejecting, so surface a
    // failed response as a rejection for settleWithin to act on.
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message ?? "Sign-out failed");
  }, SIGN_OUT_TIMEOUT_MS);

  if (outcome !== "ok") {
    throw new Error(
      outcome === "timeout"
        ? "Sign-out timed out — you are still signed in. Please try again."
        : "Sign-out failed — you are still signed in. Please try again.",
    );
  }
  window.location.href = redirectTo;
}
