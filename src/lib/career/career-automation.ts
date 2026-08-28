export type AutomationStatus = "ready" | "waiting_for_approval" | "queued" | "completed" | "blocked" | "skipped";

export type HuntMode = "manual" | "assisted" | "auto_with_approval";

export type CareerAutomationInput = {
  overallScore: number;
  dataConfidence?: number;
  applicationUrl?: string;
  sourceUrl?: string;
  appliedAt?: string;
  followUpDays?: number;
  userApprovalRequired?: boolean;
  autoApplyThreshold?: number;
};

export type CareerAutomationResult = {
  recommendation: "apply" | "review" | "skip";
  huntStatus: AutomationStatus;
  followUpStatus: AutomationStatus;
  nextFollowUpAt?: string;
  reasons: string[];
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function evaluateCareerAutomation(input: CareerAutomationInput): CareerAutomationResult {
  const score = clamp(input.overallScore);
  const confidence = clamp(input.dataConfidence ?? 100);
  const threshold = clamp(input.autoApplyThreshold ?? 80);
  const reasons: string[] = [];

  if (!input.applicationUrl) {
    reasons.push("No verified application URL is available.");
    return { recommendation: "review", huntStatus: "blocked", followUpStatus: "waiting_for_approval", reasons };
  }

  if (confidence < 50) {
    reasons.push("Opportunity data confidence is too low for automated action.");
    return { recommendation: score >= 60 ? "review" : "skip", huntStatus: "waiting_for_approval", followUpStatus: "waiting_for_approval", reasons };
  }

  if (score < 50) {
    reasons.push("Overall opportunity score is below the automation threshold.");
    return { recommendation: "skip", huntStatus: "skipped", followUpStatus: "skipped", reasons };
  }

  if (score < threshold) {
    reasons.push("Opportunity is promising but below the configured auto-apply threshold.");
    return { recommendation: "review", huntStatus: "waiting_for_approval", followUpStatus: "waiting_for_approval", reasons };
  }

  const appliedAt = input.appliedAt ? new Date(input.appliedAt) : undefined;
  const followUpDays = Math.max(1, Math.floor(input.followUpDays ?? 7));
  const nextFollowUpAt = appliedAt && !Number.isNaN(appliedAt.getTime())
    ? new Date(appliedAt.getTime() + followUpDays * 86_400_000).toISOString()
    : undefined;

  reasons.push("Overall score and data confidence meet the automation threshold.");
  return {
    recommendation: "apply",
    huntStatus: input.userApprovalRequired === false ? "queued" : "waiting_for_approval",
    followUpStatus: appliedAt ? "queued" : "waiting_for_approval",
    nextFollowUpAt,
    reasons,
  };
}

export function buildHuntPlan(mode: HuntMode, result: CareerAutomationResult): string[] {
  if (result.huntStatus === "blocked" || result.huntStatus === "skipped") return ["record_outcome"];
  const steps = ["discover", "deduplicate", "evaluate", "rank"];
  if (result.recommendation === "apply") steps.push(mode === "auto_with_approval" ? "request_approval" : "prepare_application");
  if (result.nextFollowUpAt) steps.push("schedule_follow_up");
  return steps;
}

/**
 * Once a candidate has actually applied, the "should I apply" decision is
 * moot — only follow-up scheduling remains. Kept separate from
 * `evaluateCareerAutomation` so callers don't need to re-run (and
 * potentially fail) the apply/review/skip gate just to get a follow-up date
 * for an application that already exists.
 */
export function computeFollowUpDate(appliedAt: string, followUpDays = 7): string | undefined {
  const applied = new Date(appliedAt);
  if (Number.isNaN(applied.getTime())) return undefined;
  return new Date(applied.getTime() + Math.max(1, Math.floor(followUpDays)) * 86_400_000).toISOString();
}
