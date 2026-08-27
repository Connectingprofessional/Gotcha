import type { Application } from "./data";

/** Canonical candidate journey used by the Command Center. Existing stored
 * application statuses map into this richer roadmap without breaking legacy data. */
export const PIPELINE_STAGES = [
  "SEARCH",
  "SHORTLISTED",
  "SCREENED",
  "APPLIED",
  "RESPONSE",
  "INTERVIEW",
  "STAGE_1",
  "STAGE_2",
  "STAGE_3",
  "FINAL_DISCUSSION",
  "HR_DISCUSSION",
  "OFFER",
  "APPOINTMENT",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

const LEGACY_STAGE: Record<Application["status"], PipelineStage> = {
  applied: "APPLIED",
  interview: "INTERVIEW",
  assessment: "STAGE_1",
  offer: "OFFER",
  rejected: "SEARCH",
};

export function pipelineStage(application: Application): PipelineStage {
  return LEGACY_STAGE[application.status];
}

export function stageAgeDays(application: Application, now = Date.now()): number {
  const activity = application.lastActivityAt ?? application.appliedAt;
  const started = new Date(activity).getTime();
  if (!Number.isFinite(started)) return 0;
  return Math.max(0, Math.floor((now - started) / 86_400_000));
}

export type AgeBand = "active" | "ageing" | "attention";

export function ageBand(days: number): AgeBand {
  if (days >= 12) return "attention";
  if (days >= 5) return "ageing";
  return "active";
}

export function pipelineSummary(applications: Application[], now = Date.now()) {
  const byStage = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage, 0])) as Record<PipelineStage, number>;
  let ageing = 0;
  let attention = 0;

  for (const application of applications) {
    byStage[pipelineStage(application)] += 1;
    const band = ageBand(stageAgeDays(application, now));
    if (band === "ageing") ageing += 1;
    if (band === "attention") attention += 1;
  }

  const active = applications.length - ageing - attention;
  return { byStage, active: Math.max(0, active), ageing, attention, total: applications.length };
}

export function nextAction(application: Application, now = Date.now()): string {
  const days = stageAgeDays(application, now);
  if (application.status === "rejected") return "Archive outcome and learn from the funnel signal";
  if (application.status === "offer") return "Review offer, mobility and compensation details";
  if (application.status === "interview") return days >= 3 ? "Follow up and prepare for the next interview" : "Prepare for interview";
  if (days >= 12) return "Escalate follow-up or mark as no response";
  if (days >= 5) return "Send a focused follow-up";
  return "Monitor movement and keep the opportunity active";
}
