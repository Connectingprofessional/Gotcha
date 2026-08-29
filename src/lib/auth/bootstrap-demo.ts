/**
 * One-time (idempotent) provisioning for the public "Demo" sign-in shown on
 * the sign-in card (`demo@gotecha.com` / `huntends`).
 *
 * The credentials are intentionally public — this is a showcase account, not
 * a secret — so unlike `bootstrap-admin.ts` they're constants here rather
 * than env vars. Creates the account via Better Auth's real sign-up the
 * first time anyone hits "Sign in" with those credentials; a no-op every
 * time after.
 */
import { createServerFn } from "@tanstack/react-start";
import { auth } from "./server";
import { getSql } from "../db";

export const DEMO_EMAIL = "demo@gotecha.com";
export const DEMO_PASSWORD = "huntends";
const DEMO_NAME = "Alex Rivera";

export const provisionDemoUser = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from "user" where email = ${DEMO_EMAIL}
    `;
    if (existing.length === 0) {
      await auth.api.signUpEmail({
        body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME },
      });
    }
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[auth] demo user provisioning failed:", error);
    return { ok: false as const, error: message };
  }
});
