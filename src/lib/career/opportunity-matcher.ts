import type { OpportunityRecord } from "./opportunity-normalizer.ts";

export type CareerProfile = {
  skills?: string[];
  titles?: string[];
  industries?: string[];
  countries?: string[];
  locations?: string[];
  seniority?: string;
  preferredEmploymentTypes?: string[];
  remotePreference?: "remote_only" | "remote_preferred" | "any";
  minSalary?: number;
  salaryCurrency?: string;
  /** Candidate's total years of relevant experience, if known. */
  experienceYears?: number;
  /**
   * Whether the candidate requires visa/work-permit sponsorship to take the
   * role. `undefined`/`false` means sponsorship is not a requirement.
   */
  needsVisaSponsorship?: boolean;
};

export type MatchBreakdown = {
  overall: number;
  skills: number;
  title: number;
  industry: number;
  location: number;
  seniority: number;
  workMode: number;
  compensation: number;
  experience: number;
  visa: number;
  reasons: string[];
  gaps: string[];
};

const norm = (value: string) => value.trim().toLowerCase();
const set = (values?: string[]) => new Set((values ?? []).filter(Boolean).map(norm));
const overlapScore = (wanted?: string[], actual?: string[]) => {
  const a = set(wanted);
  const b = set(actual);
  if (!a.size) return 50;
  if (!b.size) return 0;
  return Math.round((([...a].filter((x) => b.has(x)).length / a.size) * 100));
};

const textScore = (wanted: string[] | undefined, value?: string) => {
  const terms = wanted ?? [];
  if (!terms.length) return 50;
  const text = norm(value ?? "");
  if (!text) return 0;
  if (terms.some((term) => text === norm(term))) return 100;
  if (terms.some((term) => text.includes(norm(term)))) return 85;
  return 0;
};

export function matchOpportunity(profile: CareerProfile, opportunity: OpportunityRecord): MatchBreakdown {
  const skills = overlapScore(profile.skills, opportunity.skills);
  const title = textScore(profile.titles, opportunity.title);
  const industry = textScore(profile.industries, opportunity.industry);
  const location = Math.max(
    textScore(profile.locations, opportunity.location),
    textScore(profile.countries, opportunity.country),
  );
  const seniority = profile.seniority && opportunity.seniority
    ? norm(profile.seniority) === norm(opportunity.seniority) ? 100 : 0
    : 50;
  const workMode = profile.remotePreference === "remote_only"
    ? opportunity.remote ? 100 : 0
    : profile.remotePreference === "remote_preferred"
      ? opportunity.remote ? 100 : 60
      : 50;
  const compensation = profile.minSalary == null || opportunity.salaryMin == null
    ? 50
    : profile.salaryCurrency && opportunity.salaryCurrency && norm(profile.salaryCurrency) !== norm(opportunity.salaryCurrency)
      ? 50
      : opportunity.salaryMax != null && opportunity.salaryMax >= profile.minSalary ? 100 : 25;

  const experience = (() => {
    const years = profile.experienceYears;
    const min = opportunity.experienceYearsMin;
    const max = opportunity.experienceYearsMax;
    if (years == null || (min == null && max == null)) return 50;
    if (min != null && years < min) {
      // Under the bar: score degrades the further short the candidate is.
      const shortfall = min - years;
      return Math.max(0, Math.round(70 - shortfall * 20));
    }
    if (max != null && years > max + 5) {
      // Very senior for the role: still workable, mildly discounted.
      return 70;
    }
    return 100;
  })();

  const visa = (() => {
    if (!profile.needsVisaSponsorship) return 100;
    if (opportunity.visaSponsorshipAvailable === true) return 100;
    if (opportunity.visaSponsorshipAvailable === false) return 0;
    return 40; // sponsorship policy not published — unknown, not disqualifying.
  })();

  const overall = Math.round(
    skills * 0.26 + title * 0.17 + industry * 0.10 + location * 0.11 +
    seniority * 0.09 + workMode * 0.05 + compensation * 0.09 +
    experience * 0.08 + visa * 0.05,
  );

  const reasons: string[] = [];
  const gaps: string[] = [];
  if (skills >= 80) reasons.push("Strong skills alignment");
  else if (profile.skills?.length) gaps.push("Some required skills are not in your profile");
  if (title >= 85) reasons.push("Role title closely matches your target");
  if (industry >= 85) reasons.push("Industry matches your preference");
  if (location >= 85) reasons.push("Location or country matches your preference");
  if (workMode >= 80 && profile.remotePreference) reasons.push("Work-mode preference is compatible");
  if (compensation >= 80 && profile.minSalary != null) reasons.push("Compensation meets your minimum");
  if (seniority === 0) gaps.push("Seniority does not match your target");
  if (opportunity.remote === false && profile.remotePreference && profile.remotePreference !== "any") {
    gaps.push("This opportunity is not remote");
  }
  if (compensation === 25) gaps.push("Published compensation may be below your minimum");
  if (experience >= 100 && profile.experienceYears != null && opportunity.experienceYearsMin != null) {
    reasons.push("Your experience meets the role's requirement");
  } else if (experience < 70 && profile.experienceYears != null && opportunity.experienceYearsMin != null) {
    gaps.push("You may be short of the required years of experience");
  }
  if (profile.needsVisaSponsorship) {
    if (visa === 100) reasons.push("Employer offers visa sponsorship");
    else if (visa === 0) gaps.push("Employer does not offer visa sponsorship");
    else gaps.push("Visa sponsorship policy is not published — confirm before applying");
  }

  return { overall, skills, title, industry, location, seniority, workMode, compensation, experience, visa, reasons, gaps };
}

export function rankOpportunities(profile: CareerProfile, opportunities: OpportunityRecord[]) {
  return opportunities
    .map((opportunity) => ({ opportunity, match: matchOpportunity(profile, opportunity) }))
    .sort((a, b) => b.match.overall - a.match.overall);
}
