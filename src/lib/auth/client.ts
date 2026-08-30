```tsx
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for the Gotcha application.
 *
 * Talks to this application's own Better Auth API at `/api/auth/*`.
 * Authentication is handled natively by Better Auth using:
 * - Email/password
 * - Google OAuth
 * - Any additional providers explicitly configured server-side
 */
export const authClient = createAuthClient({
  baseURL:
    import.meta.env.VITE_BETTER_AUTH_URL ||
    window.location.origin,
});

/**
 * True when the authentication UI should be shown.
 */
export const authEnabled =
  import.meta.env.VITE_AUTH_ENABLED !== "false";

/**
 * Sign out of this application's session, then redirect.
 *
 * The session uses an HttpOnly secure cookie that can only be
 * cleared by the server.
 */
const SIGN_OUT_TIMEOUT_MS = 10_000;

function settleWithin(
  start: () => unknown,
  timeoutMs: number,
): Promise<"ok" | "failed" | "timeout"> {
  return new Promise((resolve) => {
    const timer = setTimeout(
      () => resolve("timeout"),
      timeoutMs,
    );

    const done = (
      outcome: "ok" | "failed",
    ) => {
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

export async function signOut(
  redirectTo = "/",
): Promise<void> {
  const outcome = await settleWithin(async () => {
    const { error } = await authClient.signOut();

    if (error) {
      throw new Error(
        error.message ?? "Sign-out failed",
      );
    }
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
```
