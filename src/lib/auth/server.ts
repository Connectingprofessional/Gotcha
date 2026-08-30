/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * Independent deploy (Cloudflare Worker) — no Grok Build broker, gate
 * identity, or live-preview sandbox. Sign-in is native Better Auth only:
 * email/password plus whichever social providers have credentials set
 * (Google, GitHub). To enable local email/password, flip the flag in
 * `./email-password` only.
 */
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { neonDialect } from "./neon-dialect";
import { pgliteDialect } from "./pglite-dialect";

void ensureDbReady();

const globalAuthRef = globalThis as typeof globalThis & {
  __gotchaAuthDevSecret__?: string;
};
function devAuthSecret(): string {
  globalAuthRef.__gotchaAuthDevSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__gotchaAuthDevSecret__;
}

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const authDisabled = env("VITE_AUTH_ENABLED") === "false";

/** True whenever auth isn't explicitly turned off. Email/password is always
 * available in that case; social providers layer on top when configured. */
export const authConfigured = !authDisabled;

const googleClientId = env("GOOGLE_CLIENT_ID");
const googleClientSecret = env("GOOGLE_CLIENT_SECRET");
export const googleAuthConfigured = Boolean(googleClientId && googleClientSecret);

const githubClientId = env("GITHUB_CLIENT_ID");
const githubClientSecret = env("GITHUB_CLIENT_SECRET");
export const githubAuthConfigured = Boolean(githubClientId && githubClientSecret);

const explicitBaseURL = env("BETTER_AUTH_URL");
const PRODUCTION_ORIGINS: string[] = [
  "https://gotcha.recreationeeraj.workers.dev",
];
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const baseURL = explicitBaseURL ?? {
  allowedHosts: ["localhost", "127.0.0.1", "[::1]"],
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

// Better Auth rejects state-changing requests (including sign-out) whose
// Origin is not trusted. Always include the deployed Worker origin in addition
// to any configured BETTER_AUTH_URL so production cookies and CSRF checks work.
const trustedOrigins: string[] = [
  ...new Set([
    ...PRODUCTION_ORIGINS,
    ...(explicitBaseURL ? [explicitBaseURL] : []),
    ...LOCAL_DEV_ORIGINS,
  ]),
];

const databaseUrl = env("DATABASE_URL");

const database = databaseUrl
  ? { dialect: neonDialect(databaseUrl), type: "postgres" as const }
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

export const SESSION_TOKEN_COOKIE = "__Host-gotcha-auth.session_token";

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {
  ...(googleAuthConfigured
    ? { google: { clientId: googleClientId as string, clientSecret: googleClientSecret as string } }
    : {}),
  ...(githubAuthConfigured
    ? { github: { clientId: githubClientId as string, clientSecret: githubClientSecret as string } }
    : {}),
};

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? devAuthSecret(),
  database,
  trustedOrigins,
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: Object.keys(socialProviders),
      requireLocalEmailVerified: false,
    },
  },
  session: { cookieCache: { enabled: true, maxAge: 300 } },
  ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-gotcha-auth.session_data" },
      account_data: { name: "__Host-gotcha-auth.account_data" },
      dont_remember: { name: "__Host-gotcha-auth.dont_remember" },
    },
  },
  plugins: [tanstackStartCookies()],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}
