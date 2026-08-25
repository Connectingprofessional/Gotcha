import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-fg">
      <Link to="/" className="text-sm text-primary-3">
        ← Gotcha
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Gotcha is a career intelligence product. Job listings are illustrative and aggregated for demonstration.
        Always verify roles on the employer’s site before applying. Use of the platform is at your own discretion.
      </p>
    </main>
  );
}
