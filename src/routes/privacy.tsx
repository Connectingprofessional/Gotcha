import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-fg">
      <Link to="/" className="text-sm text-primary-3">
        ← Gotcha
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Gotcha stores your profile, applications, and saved searches in this browser only. We do not sell personal
        data. AI queries you send are processed to generate search and coaching responses and are not used to train
        public models from this app.
      </p>
    </main>
  );
}
