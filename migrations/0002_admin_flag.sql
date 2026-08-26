-- Adds an admin flag to Better Auth's "user" table so a real signed-in
-- account can be granted platform-administrator access. Not settable via the
-- public sign-up API (see the `additionalFields` config in
-- src/lib/auth/server.ts, which marks this field `input: false`).

alter table "user" add column if not exists "isAdmin" boolean not null default false;
