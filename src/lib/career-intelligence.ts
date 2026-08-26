import type { Job } from "./data";
import { scoreMatch } from "./data";
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
};

const normalize = (value: string) => value.toLowerCase().trim();

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
  const salaryScore = user?.salaryGoal ? 86 : 78;
  const growthScore = job.match >= 90 ? 95 : job.match >= 80 ? 88 : 76;
  const score = Math.min(99, Math.round(base * 0.35 + skillScore * 0.2 + titleScore * 0.15 + industryScore * 0.1 + locationScore * 0.08 + salaryScore * 0.05 + growthScore * 0.07));
  const reasons = [
    `${skillScore}% skill alignment`,
    `${growthScore}% career-growth signal`,
    `${locationScore}% location/work-model fit`,
  ];
  const gaps = job.tags.filter((tag) => !skills.some((skill) => normalize(skill).includes(normalize(tag)) || normalize(tag).includes(normalize(skill)))).slice(0, 3);
  return { score, skills: skillScore, experience: titleScore, industry: industryScore, location: locationScore, salary: salaryScore, growth: growthScore, priority: score >= 90 ? "HIGH" : score >= 80 ? "MEDIUM" : "LOW", reasons, gaps };
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
