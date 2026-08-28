export type CompanySignal = { type: "hiring" | "compensation" | "market" | "risk"; label: string; value: string; severity: "positive" | "neutral" | "warning" };
export type CompanyProfile = { name: string; locations: string[]; signals: CompanySignal[]; rolesOpen: number; confidence: number };

export function companyHealth(profile: CompanyProfile): "strong" | "stable" | "watch" {
  const warnings = profile.signals.filter((s) => s.severity === "warning").length;
  if (warnings >= 2) return "watch";
  if (profile.rolesOpen > 0 && profile.confidence >= 70) return "strong";
  return "stable";
}

/** Derives a company snapshot from the roles Gotcha already has data on — no external company data source. */
export function deriveCompanyProfile(companyName: string, jobsAtCompany: { location: string; match: number; salaryMin?: number; salaryMax?: number; currency?: string; visaSponsorship?: "yes" | "no" | "unknown"; verifiedEmployer?: boolean }[]): CompanyProfile {
  const locations = [...new Set(jobsAtCompany.map((j) => j.location))];
  const avgMatch = jobsAtCompany.length ? Math.round(jobsAtCompany.reduce((sum, j) => sum + j.match, 0) / jobsAtCompany.length) : 0;
  const verified = jobsAtCompany.some((j) => j.verifiedEmployer);
  const visaFriendly = jobsAtCompany.some((j) => j.visaSponsorship === "yes");
  const salaries = jobsAtCompany.filter((j) => j.salaryMax).map((j) => j.salaryMax as number);
  const topSalary = salaries.length ? Math.max(...salaries) : null;
  const currency = jobsAtCompany.find((j) => j.currency)?.currency ?? "";

  const signals: CompanySignal[] = [
    { type: "hiring", label: "Open roles tracked", value: String(jobsAtCompany.length), severity: jobsAtCompany.length >= 2 ? "positive" : "neutral" },
    { type: "market", label: "Average candidate match", value: `${avgMatch}%`, severity: avgMatch >= 80 ? "positive" : "neutral" },
  ];
  if (topSalary) signals.push({ type: "compensation", label: "Top compensation seen", value: `${currency} ${topSalary.toLocaleString()}`, severity: "positive" });
  if (!verified) signals.push({ type: "risk", label: "Employer verification", value: "Unverified source", severity: "warning" });
  if (visaFriendly) signals.push({ type: "hiring", label: "Visa sponsorship", value: "Available on some roles", severity: "positive" });

  return { name: companyName, locations, signals, rolesOpen: jobsAtCompany.length, confidence: verified ? 85 : 60 };
}
