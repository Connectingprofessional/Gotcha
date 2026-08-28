import type { Application, Job } from "./data.ts";
import { ageBand, stageAgeDays } from "./pipelineIntelligence.ts";

export type SignalPriority = "high" | "medium" | "low";

export type CareerAgentSignal = {
  title: string;
  description: string;
  priority: SignalPriority;
};

/**
 * Turns the candidate's real, current state — applications, saved jobs,
 * CV coverage — into a short list of next-best-action signals. Every
 * signal is derived from data already in the app; nothing here is
 * fabricated or hardcoded per-user copy.
 */
export function deriveCareerSignals(input: {
  applications: Application[];
  jobs: Job[];
  savedJobIds: string[];
  hasCvVariant: boolean;
  now?: number;
}): CareerAgentSignal[] {
  const { applications, jobs, savedJobIds, hasCvVariant, now = Date.now() } = input;
  const signals: CareerAgentSignal[] = [];

  if (applications.length === 0) {
    signals.push({
      title: "You haven't applied to anything yet",
      description: "Review your top matches in Opportunities and send your first application.",
      priority: "high",
    });
  }

  const stale = applications.filter((a) => {
    if (a.status === "rejected" || a.status === "offer") return false;
    return ageBand(stageAgeDays(a, now)) !== "active";
  });
  if (stale.length > 0) {
    signals.push({
      title: `${stale.length} application${stale.length > 1 ? "s" : ""} need a follow-up`,
      description: "These have been sitting in their current stage longer than usual — a nudge to the recruiter can help.",
      priority: "high",
    });
  }

  const appliedJobIds = new Set(applications.map((a) => a.jobId));
  const strongUnappliedSaves = savedJobIds
    .map((id) => jobs.find((j) => j.id === id))
    .filter((job): job is Job => Boolean(job) && !appliedJobIds.has(job!.id) && job!.match >= 85);
  if (strongUnappliedSaves.length > 0) {
    signals.push({
      title: `${strongUnappliedSaves.length} high-match saved job${strongUnappliedSaves.length > 1 ? "s" : ""} still unapplied`,
      description: `Including ${strongUnappliedSaves[0].title} at ${strongUnappliedSaves[0].company} (${strongUnappliedSaves[0].match}% match) — strong matches like this don't stay open long.`,
      priority: "high",
    });
  }

  if (!hasCvVariant) {
    signals.push({
      title: "No tailored CV variant yet",
      description: "A CV variant matched to your target role improves your ATS score and interview rate.",
      priority: "medium",
    });
  }

  return signals;
}
