import type { Application, Job } from "./data";
import { ageBand, nextAction, stageAgeDays } from "./pipelineIntelligence";

export type HuntMission = { id: string; priority: "high" | "medium"; title: string; action: string; applicationId?: string };

export function buildHuntMissions(applications: Application[], jobs: Job[], now = Date.now()): HuntMission[] {
  return applications
    .map((application) => ({ application, days: stageAgeDays(application, now), job: jobs.find((j) => j.id === application.jobId) }))
    .filter(({ application, days }) => ageBand(days) !== "active" || application.status === "interview" || application.status === "offer")
    .sort((a, b) => b.days - a.days)
    .slice(0, 10)
    .map(({ application, days, job }, i) => ({
      id: `mission-${application.id}`,
      priority: i < 3 || days >= 12 ? "high" : "medium",
      title: `Action required: ${job?.company ?? "Unknown company"} — ${job?.title ?? "Unknown role"}`,
      action: nextAction(application, now),
      applicationId: application.id,
    }));
}
