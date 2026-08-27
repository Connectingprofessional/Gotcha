/**
 * Shared career intelligence primitives for the non-dashboard product suite.
 * Pure functions keep the logic usable from server routes, workers and UI views.
 */

export type PipelineStage =
  | "search"
  | "shortlisted"
  | "screened"
  | "applied"
  | "response"
  | "interview"
  | "stage_1"
  | "stage_2"
  | "stage_3"
  | "final"
  | "hr"
  | "offer"
  | "appointment";

export type ApplicationOutcome = "active" | "rejected" | "no_response" | "on_hold" | "closed";

export interface CareerApplication {
  id: string;
  company: string;
  role: string;
  location?: string;
  source?: string;
  cvVersion?: string;
  stage: PipelineStage;
  outcome?: ApplicationOutcome;
  enteredAt: string;
  updatedAt: string;
  respondedAt?: string;
  interviewAt?: string;
  offerAt?: string;
}

export interface FunnelStageMetric {
  stage: PipelineStage;
  count: number;
  share: number;
  conversionFromPrevious: number | null;
  medianAgeDays: number;
}

const STAGES: PipelineStage[] = [
  "search", "shortlisted", "screened", "applied", "response", "interview",
  "stage_1", "stage_2", "stage_3", "final", "hr", "offer", "appointment",
];

function ageDays(date: string, now = Date.now()): number {
  const ms = Math.max(0, now - Date.parse(date));
  return Math.floor(ms / 86_400_000);
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** Build a live funnel from current application records. */
export function buildFunnel(applications: CareerApplication[], now = Date.now()): FunnelStageMetric[] {
  const counts = new Map(STAGES.map((stage) => [stage, 0]));
  const ages = new Map<PipelineStage, number[]>();

  for (const application of applications) {
    if (application.outcome === "rejected" || application.outcome === "closed") continue;
    const stage = application.stage;
    counts.set(stage, (counts.get(stage) ?? 0) + 1);
    ages.set(stage, [...(ages.get(stage) ?? []), ageDays(application.updatedAt, now)]);
  }

  const total = applications.length || 1;
  let previous = 0;
  return STAGES.map((stage) => {
    const count = counts.get(stage) ?? 0;
    const conversionFromPrevious = previous > 0 ? Number(((count / previous) * 100).toFixed(1)) : null;
    previous = count;
    return {
      stage,
      count,
      share: Number(((count / total) * 100).toFixed(1)),
      conversionFromPrevious,
      medianAgeDays: median(ages.get(stage) ?? []),
    };
  });
}

export interface AgeingInsight {
  applicationId: string;
  ageDays: number;
  severity: "normal" | "stalled" | "attention";
  recommendedAction: string;
}

/** Turn stage ageing into an actionable work queue. */
export function buildAgeingInsights(applications: CareerApplication[], now = Date.now()): AgeingInsight[] {
  return applications
    .filter((application) => application.outcome === "active" || !application.outcome)
    .map((application) => {
      const days = ageDays(application.updatedAt, now);
      const severity = days >= 12 ? "attention" : days >= 5 ? "stalled" : "normal";
      const recommendedAction = severity === "attention"
        ? "Follow up now and review whether the opportunity is still active."
        : severity === "stalled"
          ? "Prepare a targeted follow-up and verify the opportunity status."
          : application.stage === "interview"
            ? "Complete interview preparation and confirm the next step."
            : "Keep momentum and progress the opportunity to the next stage.";
      return { applicationId: application.id, ageDays: days, severity, recommendedAction };
    })
    .sort((a, b) => b.ageDays - a.ageDays);
}

export interface CvVersionPerformance {
  cvVersion: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
}

/** Measure CV variants against actual pipeline outcomes. */
export function compareCvVersions(applications: CareerApplication[]): CvVersionPerformance[] {
  const versions = new Map<string, CareerApplication[]>();
  for (const application of applications) {
    if (!application.cvVersion) continue;
    versions.set(application.cvVersion, [...(versions.get(application.cvVersion) ?? []), application]);
  }

  return [...versions.entries()].map(([cvVersion, records]) => {
    const applicationsCount = records.length || 1;
    const responses = records.filter((r) => ["response", "interview", "stage_1", "stage_2", "stage_3", "final", "hr", "offer", "appointment"].includes(r.stage)).length;
    const interviews = records.filter((r) => ["interview", "stage_1", "stage_2", "stage_3", "final", "hr", "offer", "appointment"].includes(r.stage)).length;
    const offers = records.filter((r) => ["offer", "appointment"].includes(r.stage)).length;
    return {
      cvVersion,
      applications: records.length,
      responses,
      interviews,
      offers,
      responseRate: Number(((responses / applicationsCount) * 100).toFixed(1)),
      interviewRate: Number(((interviews / applicationsCount) * 100).toFixed(1)),
      offerRate: Number(((offers / applicationsCount) * 100).toFixed(1)),
    };
  }).sort((a, b) => b.responseRate - a.responseRate);
}

export interface SourcePerformance {
  source: string;
  applications: number;
  responses: number;
  interviews: number;
  responseRate: number;
  interviewRate: number;
}

/** Compare career channels such as company portal, agency, network and social. */
export function compareSources(applications: CareerApplication[]): SourcePerformance[] {
  const groups = new Map<string, CareerApplication[]>();
  for (const application of applications) {
    const source = application.source?.trim() || "Unknown";
    groups.set(source, [...(groups.get(source) ?? []), application]);
  }
  return [...groups.entries()].map(([source, records]) => {
    const responses = records.filter((r) => r.stage !== "search" && r.stage !== "shortlisted" && r.stage !== "screened").length;
    const interviews = records.filter((r) => ["interview", "stage_1", "stage_2", "stage_3", "final", "hr", "offer", "appointment"].includes(r.stage)).length;
    const total = records.length || 1;
    return {
      source,
      applications: records.length,
      responses,
      interviews,
      responseRate: Number(((responses / total) * 100).toFixed(1)),
      interviewRate: Number(((interviews / total) * 100).toFixed(1)),
    };
  }).sort((a, b) => b.responseRate - a.responseRate);
}
