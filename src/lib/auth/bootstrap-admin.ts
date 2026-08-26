/**
 * One-time (idempotent) admin account provisioning.
 *
 * Reads the intended admin email/password from server-only env vars
 * (ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD — set as Cloudflare
 * secrets, never committed to the repo), creates the account via Better
 * Auth's real sign-up if it doesn't exist yet, then flips `isAdmin` to true
 * directly in the database (the public API can never set `isAdmin` — see the
 * `additionalFields` config in `./server`).
 *
 * Safe to call repeatedly: does nothing once the account already exists and
 * is already an admin.
 */
import { createServerFn } from "@tanstack/react-start";
import { auth } from "./server";
import { getSql } from "../db";

export const provisionAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Administrator";

  if (!email || !password) {
    return {
      ok: false as const,
      error: "ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD are not set on this deployment.",
    };
  }

  const sql = await getSql();
  const existing = await sql<{ id: string; isAdmin: boolean }>`
    select id, "isAdmin" from "user" where email = ${email}
  `;

  if (existing.length === 0) {
    await auth.api.signUpEmail({ body: { email, password, name } });
  }

  await sql`update "user" set "isAdmin" = true where email = ${email}`;

  return { ok: true as const, email };
});
