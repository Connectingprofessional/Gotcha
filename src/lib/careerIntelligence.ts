import type { Application, Job } from "./data";
import type { User } from "./store";

export type MatchBreakdown = { skills: number; experience: number; industry: number; salary: number; location: number; remote: number; visa: number; growth: number; overall: number; gaps: string[] };
export type ApplicationAnalytics = { total: number; applied: number; interviews: number; assessments: number; offers: number; rejected: number; responseRate: number; interviewRate: number; offerRate: number };
export type MobilityAssessment = { score: number; markets: string[]; factors: string[] };
export type ShieldAssessment = { level: "low" | "medium" | "high"; reasons: string[] };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.-]+/g, " ").trim();
const tokens = (value: string) => new Set(normalize(value).split(/\s+/).filter(Boolean));
const overlap = (a: string[], b: string[]) => { const x = new Set(a.flatMap(v => [...tokens(v)])); const y = new Set(b.flatMap(v => [...tokens(v)])); if (!x.size) return 0; let hits = 0; y.forEach(v => { if (x.has(v)) hits++; }); return Math.round((hits / Math.max(1, Math.min(x.size, y.size))) * 100); };

export function scoreOpportunity(job: Job, user: User): MatchBreakdown {
  const skillScore = overlap(user.skills, [...job.tags, job.description]);
  const titleScore = overlap([user.title, ...(user.targetRoles ?? [])], [job.title]);
  const experience = Math.max(45, Math.round((skillScore * 0.45) + (titleScore * 0.55)));
  const industry = (user.about + " " + (user.targetRoles ?? []).join(" ")).toLowerCase().includes(job.industry.toLowerCase()) ? 96 : 72;
  const locationText = `${user.location} ${(user.targetCountries ?? []).join(" ")}`.toLowerCase();
  const location = locationText.includes(job.location.split(",")[0].toLowerCase()) || job.location.toLowerCase().includes("remote") ? 94 : 68;
  const remote = job.work === "Remote" ? 96 : user.remotePreference === "Any" || user.remotePreference === job.work ? 90 : 70;
  const salary = user.salaryGoal ? 82 : 76;
  const visa = (user.targetCountries ?? []).some(c => job.location.toLowerCase().includes(c.toLowerCase())) ? 88 : 70;
  const growth = job.match >= 90 ? 94 : job.match >= 80 ? 84 : 72;
  const gaps = job.tags.filter(tag => !user.skills.some(skill => normalize(skill).includes(normalize(tag)) || normalize(tag).includes(normalize(skill)))).slice(0, 4);
  const overall = Math.round(skillScore * .24 + experience * .2 + industry * .12 + salary * .1 + location * .08 + remote * .08 + visa * .05 + growth * .13);
  return { skills: skillScore, experience, industry, salary, location, remote, visa, growth, overall: Math.max(0, Math.min(100, overall)), gaps };
}

export function applicationAnalytics(applications: Application[]): ApplicationAnalytics {
  const total = applications.length; const applied = applications.filter(a => a.status === "applied").length; const interviews = applications.filter(a => a.status === "interview").length; const assessments = applications.filter(a => a.status === "assessment").length; const offers = applications.filter(a => a.status === "offer").length; const rejected = applications.filter(a => a.status === "rejected").length;
  return { total, applied, interviews, assessments, offers, rejected, responseRate: total ? Math.round(((interviews + offers) / total) * 100) : 0, interviewRate: total ? Math.round(((interviews + offers) / total) * 100) : 0, offerRate: total ? Math.round((offers / total) * 100) : 0 };
}

export function careerHuntScore(user: User | null, applications: Application[]): number {
  if (!user) return 0; const profile = Math.min(100, 45 + user.skills.length * 5 + (user.about ? 10 : 0) + (user.targetRoles?.length ? 8 : 0) + (user.targetCountries?.length ? 5 : 0)); const activity = Math.min(100, 50 + applications.length * 2 + applications.filter(a => a.status === "interview").length * 5 + applications.filter(a => a.status === "offer").length * 8); return Math.round(profile * .45 + activity * .55);
}

export function mobilityAssessment(user: User): MobilityAssessment { const countries = user.targetCountries ?? []; const score = Math.min(100, 55 + countries.length * 8 + (user.skills.length >= 5 ? 15 : 5) + (user.remotePreference === "Remote" || user.remotePreference === "Any" ? 10 : 0)); return { score, markets: countries.length ? countries.slice(0, 5) : ["Singapore", "UAE", "UK", "Germany", "India"], factors: ["Role demand", "Transferable skills", "Work model", "Country preference"] }; }

export function shieldAssessment(job: Job): ShieldAssessment { const reasons: string[] = []; if (!job.company || !job.source) reasons.push("Incomplete employer or source information"); if (/payment|fee|deposit/i.test(job.description)) reasons.push("Job text contains payment-related language"); if (!job.posted) reasons.push("Posting freshness is unavailable"); const level = reasons.length >= 2 ? "high" : reasons.length === 1 ? "medium" : "low"; return { level, reasons: reasons.length ? reasons : ["No obvious risk signal in the available listing data"] }; }

export function companyIntelligence(jobs: Job[], company: string) { const rows = jobs.filter(j => j.company === company); const skills = [...new Set(rows.flatMap(j => j.tags))].slice(0, 10); return { company, openRoles: rows.length, locations: [...new Set(rows.map(j => j.location))], skills, averageMatch: rows.length ? Math.round(rows.reduce((n, j) => n + j.match, 0) / rows.length) : 0, hiringSignal: rows.length >= 3 ? "High" : rows.length === 2 ? "Medium" : "Emerging" as "High" | "Medium" | "Emerging" }; }
