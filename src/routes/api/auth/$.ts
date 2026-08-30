import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Mounts Better Auth at /api/auth/* — this is what makes get-session,
 * sign-out, sign-in, and every social provider's OAuth callback all work.
 *
 * This file was missing entirely from the deployed app, which is why every
 * request under /api/auth/ (get-session, sign-out, etc.) returned 404 —
 * confirmed via the browser's Network tab showing repeated
 * "get-session ... 404" entries.
 */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
