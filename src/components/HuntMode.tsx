import { Crosshair, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGotcha } from "@/lib/store";
import { JOBS } from "@/lib/data";
import { buildHuntMissions } from "@/lib/huntMode";

export function HuntModePage() {
  const huntMode = useGotcha((s) => s.huntMode);
  const setHuntMode = useGotcha((s) => s.setHuntMode);
  const applications = useGotcha((s) => s.applications);
  const huntActions = useGotcha((s) => s.huntActions);
  const completeHuntAction = useGotcha((s) => s.completeHuntAction);
  const setView = useGotcha((s) => s.setView);

  const missions = buildHuntMissions(applications, JOBS);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Hunt Mode</h1>
          <p className="text-sm text-muted">
            A prioritized queue of what needs your attention right now — the hunt ends faster when nothing stalls.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHuntMode(!huntMode)}
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            huntMode ? "border-primary bg-primary/15 text-primary" : "border-border text-muted",
          )}
        >
          <Crosshair className="size-4" />
          {huntMode ? "Hunt Mode: On" : "Hunt Mode: Off"}
        </button>
      </div>

      {!huntMode ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Crosshair className="mx-auto mb-2 size-6 text-subtle" />
          <p className="text-sm text-muted">Turn on Hunt Mode to see your prioritized action queue.</p>
          <button
            type="button"
            onClick={() => setHuntMode(true)}
            className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium"
          >
            Turn on Hunt Mode
          </button>
        </div>
      ) : (
        <>
          <div>
            <h2 className="mb-2 text-sm font-medium text-muted">Getting started</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {huntActions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    if (!a.completed) completeHuntAction(a.id);
                    setView(a.view);
                  }}
                  className={cn(
                    "flex items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                    a.completed ? "border-border bg-card/50 opacity-60" : "border-border bg-card",
                  )}
                >
                  {a.completed ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0 text-subtle" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted">{a.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium text-muted">Priority missions</h2>
            {missions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted">Nothing urgent right now — your pipeline is moving well.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {missions.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          m.priority === "high" ? "bg-danger/15 text-danger" : "bg-warn/15 text-warn",
                        )}
                      >
                        {m.priority === "high" ? "Urgent" : "Soon"}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted">{m.action}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setView("applications")}
                      className="flex shrink-0 items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                    >
                      Review <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
