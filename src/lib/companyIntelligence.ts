export type CompanySignal = { type: "hiring" | "compensation" | "market" | "risk"; label: string; value: string; severity: "positive" | "neutral" | "warning" };
export type CompanyProfile = { name: string; locations: string[]; signals: CompanySignal[]; rolesOpen: number; confidence: number };

export function companyHealth(profile: CompanyProfile): "strong" | "stable" | "watch" {
  const warnings = profile.signals.filter((s) => s.severity === "warning").length;
  if (warnings >= 2) return "watch";
  if (profile.rolesOpen > 0 && profile.confidence >= 70) return "strong";
  return "stable";
}
