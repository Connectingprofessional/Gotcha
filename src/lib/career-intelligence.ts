import type { Job } from "./data";
import { scoreMatch } from "./data";
import { evaluateGlobalOpportunity, type GlobalOpportunityContext, type GlobalOpportunityResult } from "./global-opportunity-intelligence";
import type { User } from "./store";

export type OpportunityAnalysis = {
  score: number;
  skills: number;
  experience: number;
  industry: number;
  location: number;
  salary: number;
  growth: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
  gaps: string[];
  global: GlobalOpportunityResult;
};

const normalize = (value: string) => value.toLowerCase().trim();

function buildGlobalContext(job: Job, user: User | null): GlobalOpportunityContext {
  const profile = user?.globalProfile ?? {};
  return {
    ...profile,
    targetCurrency: profile.targetCurrency ?? user?.currency ?? job.currency,
    compensation: profile.compensation ?? (job.salaryMin !== undefined || job.salaryMax !== undefined
      ? { currency: job.currency ?? user?.currency ?? "", min: job.salaryMin, max: job.salaryMax, period: "annual" }
      : undefined),
    mobility: profile.mobility ?? (job.country
      ? { destinationCountry: job.country, sponsorship: job.visaSponsorship, relocationAvailable: job.relocation === "available", candidateCountry: user?.country, workAuthorization: "unknown" }
      : undefined),
  };
}

export function analyzeOpportunity(job: Job, user: User | null): OpportunityAnalysis {
  const skills = user?.skills ?? [];
  const title = user?.title ?? "";
  const industry = job.industry;
  const base = scoreMatch(job, skills, title, industry);
  const skillHits = skills.filter((skill) => [...job.tags, job.title, job.description].join(" ").toLowerCase().includes(normalize(skill))).length;
  const skillScore = Math.min(99, 70 + skillHits * 7);
  const titleScore = title && job.title.toLowerCase().includes(title.toLowerCase().split(" ")[0] ?? "") ? 95 : 72;
  const industryScore = industry && (user?.about ?? "").toLowerCase().includes(industry.toLowerCase()) ? 94 : 82;
  const locationScore = user?.location && job.location.toLowerCase().includes(user.location.split(",")[0]?.toLowerCase() ?? "") ? 96 : 82;
  const global = evaluateGlobalOpportunity(buildGlobalContext(job, user));
  const salaryScore = global.salaryTargetAnnual !== undefined ? (global.wageFloorCompliant === "no" ? 20 : global.financialScore) : user?.salaryGoal ? 86 : 78;
  const growthScore = job.match >= 90 ? 95 : job.match >= 80 ? 88 : 76;
  const score = Math.min(99, Math.round(base * 0.30 + skillScore * 0.18 + titleScore * 0.13 + industryScore * 0.08 + locationScore * 0.07 + salaryScore * 0.09 + growthScore * 0.05 + global.benefitsScore * 0.03 + global.mobilityScore * 0.04 + global.timezoneScore * 0.03));
  const reasons = [`${skillScore}% skill alignment`, `${growthScore}% career-growth signal`, `${locationScore}% location/work-model fit`, ...global.reasons];
  const gaps = job.tags.filter((tag) => !skills.some((skill) => normalize(skill).includes(normalize(tag)) || normalize(tag).includes(normalize(skill)))).slice(0, 3);
  return { score, skills: skillScore, experience: titleScore, industry: industryScore, location: locationScore, salary: salaryScore, growth: growthScore, priority: score >= 90 ? "HIGH" : score >= 80 ? "MEDIUM" : "LOW", reasons, gaps, global };
}

export function rankOpportunities(jobs: Job[], user: User | null) {
  return jobs.map((job) => ({ job, analysis: analyzeOpportunity(job, user) })).sort((a, b) => b.analysis.score - a.analysis.score);
}

export function careerHuntScore(user: User | null, applicationCount: number, interviewCount: number, offerCount: number) {
  const profile = Math.min(100, 55 + (user?.skills.length ?? 0) * 5 + (user?.about ? 8 : 0) + (user?.targetRoles?.length ? 7 : 0) + (user?.careerGoal ? 8 : 0));
  const activity = Math.min(25, applicationCount * 2);
  const progress = Math.min(15, interviewCount * 5) + (offerCount ? 5 : 0);
  return Math.min(100, Math.round(profile * 0.55 + activity + progress));
}
