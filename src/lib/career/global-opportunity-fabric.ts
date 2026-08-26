export type OpportunitySourceType =
  | "job_portal"
  | "company_career"
  | "ats"
  | "agency"
  | "headhunter"
  | "government"
  | "industry_board"
  | "remote"
  | "freelance"
  | "referral"
  | "public_web";

export type OpportunitySource = {
  id: string;
  name: string;
  type: OpportunitySourceType;
  baseUrl: string;
  countries: string[];
  industries: string[];
  enabled: boolean;
  trustScore: number;
  /** Optional integration endpoint. Discovery must respect the source's access policy. */
  searchUrl?: string;
  applicationUrl?: string;
};

export type OpportunityQuery = {
  keywords?: string[];
  skills?: string[];
  industries?: string[];
  countries?: string[];
  locations?: string[];
  remote?: boolean;
  seniority?: string[];
};

/**
 * Configuration-first source registry for the global hunt engine.
 * Sources are deliberately data, not hard-coded scraping logic: connectors can
 * be added independently and only use APIs, feeds, or public pages they are
 * permitted to access.
 */
export const globalOpportunitySources: OpportunitySource[] = [];

const normalize = (value: string) => value.trim().toLowerCase();

export function registerOpportunitySource(source: OpportunitySource): void {
  const index = globalOpportunitySources.findIndex((item) => item.id === source.id);
  if (index === -1) globalOpportunitySources.push(source);
  else globalOpportunitySources[index] = source;
}

export function findOpportunitySources(query: OpportunityQuery = {}): OpportunitySource[] {
  const countries = new Set((query.countries ?? []).map(normalize));
  const industries = new Set((query.industries ?? []).map(normalize));
  const wantedTypes = query.remote ? new Set<OpportunitySourceType>(["remote", "job_portal", "company_career", "ats", "public_web"]) : null;

  return globalOpportunitySources.filter((source) => {
    if (!source.enabled) return false;
    if (wantedTypes && !wantedTypes.has(source.type)) return false;
    if (countries.size && !source.countries.some((country) => countries.has(normalize(country)) || normalize(country) === "global")) return false;
    if (industries.size && !source.industries.some((industry) => industries.has(normalize(industry)) || normalize(industry) === "all")) return false;
    return true;
  }).sort((a, b) => b.trustScore - a.trustScore);
}

export function sourceCoverageSummary(): {
  total: number;
  enabled: number;
  byType: Record<string, number>;
  globalSources: number;
} {
  const enabled = globalOpportunitySources.filter((source) => source.enabled);
  const byType: Record<string, number> = {};
  for (const source of enabled) byType[source.type] = (byType[source.type] ?? 0) + 1;
  return {
    total: globalOpportunitySources.length,
    enabled: enabled.length,
    byType,
    globalSources: enabled.filter((source) => source.countries.some((country) => normalize(country) === "global")).length,
  };
}
