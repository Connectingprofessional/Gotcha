export type OpportunityRecord = {
  id?: string;
  sourceId: string;
  title: string;
  company: string;
  location?: string;
  country?: string;
  industry?: string;
  skills?: string[];
  seniority?: string;
  employmentType?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  /** Minimum years of experience the opportunity expects, if published. */
  experienceYearsMin?: number;
  /** Maximum years of experience the opportunity expects, if published. */
  experienceYearsMax?: number;
  /**
   * Whether the employer/opportunity is known to offer visa/work-permit
   * sponsorship. `undefined` means unpublished/unknown, not "no".
   */
  visaSponsorshipAvailable?: boolean;
  applicationUrl?: string;
  sourceUrl?: string;
  postedAt?: string;
  expiresAt?: string;
  description?: string;
};

const clean = (value?: string) => value?.replace(/\s+/g, " ").trim() || undefined;
const keyPart = (value?: string) => (clean(value) ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const cleanYears = (value?: number) =>
  value === undefined || value === null || !Number.isFinite(value) || value < 0 ? undefined : value;

export function normalizeOpportunity(input: OpportunityRecord): OpportunityRecord {
  const experienceYearsMin = cleanYears(input.experienceYearsMin);
  let experienceYearsMax = cleanYears(input.experienceYearsMax);
  if (experienceYearsMax !== undefined && experienceYearsMin !== undefined && experienceYearsMax < experienceYearsMin) {
    experienceYearsMax = experienceYearsMin;
  }

  return {
    ...input,
    experienceYearsMin,
    experienceYearsMax,
    visaSponsorshipAvailable: input.visaSponsorshipAvailable,
    id: clean(input.id),
    sourceId: clean(input.sourceId) ?? "unknown",
    title: clean(input.title) ?? "Untitled opportunity",
    company: clean(input.company) ?? "Unknown company",
    location: clean(input.location),
    country: clean(input.country),
    industry: clean(input.industry),
    skills: [...new Set((input.skills ?? []).map(clean).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
    seniority: clean(input.seniority),
    employmentType: clean(input.employmentType),
    applicationUrl: clean(input.applicationUrl),
    sourceUrl: clean(input.sourceUrl),
    description: clean(input.description),
  };
}

function canonicalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

function fallbackOpportunityKey(opportunity: OpportunityRecord): string {
  return [
    "job",
    keyPart(opportunity.company),
    keyPart(opportunity.title),
    keyPart(opportunity.location ?? opportunity.country),
  ].join(":");
}

/** Stable identity used to collapse the same opportunity reported by many sources. */
export function opportunityDeduplicationKey(input: OpportunityRecord): string {
  const opportunity = normalizeOpportunity(input);
  const url = canonicalUrl(opportunity.applicationUrl ?? opportunity.sourceUrl);
  if (url) return `url:${url}`;
  return fallbackOpportunityKey(opportunity);
}

function mergeOpportunity(previous: OpportunityRecord, incoming: OpportunityRecord): OpportunityRecord {
  const merged: OpportunityRecord = { ...previous };
  for (const [field, value] of Object.entries(incoming) as [keyof OpportunityRecord, OpportunityRecord[keyof OpportunityRecord]][]) {
    if (
      value !== undefined &&
      value !== "" &&
      (merged[field] === undefined ||
        (Array.isArray(value) && value.length > (Array.isArray(merged[field]) ? merged[field].length : 0)))
    ) {
      merged[field] = value as never;
    }
  }
  return merged;
}

/** Deduplicates cross-portal results while retaining the richest record. */
export function deduplicateOpportunities(inputs: OpportunityRecord[]): OpportunityRecord[] {
  const byIdentity = new Map<string, OpportunityRecord>();

  for (const input of inputs) {
    const normalized = normalizeOpportunity(input);
    const url = canonicalUrl(normalized.applicationUrl ?? normalized.sourceUrl);
    const urlKey = url ? `url:${url}` : undefined;
    const fallbackKey = fallbackOpportunityKey(normalized);
    const previous = (urlKey ? byIdentity.get(urlKey) : undefined) ?? byIdentity.get(fallbackKey);

    if (!previous) {
      byIdentity.set(fallbackKey, normalized);
      if (urlKey) byIdentity.set(urlKey, normalized);
      continue;
    }

    const merged = mergeOpportunity(previous, normalized);
    byIdentity.set(fallbackKey, merged);
    if (urlKey) byIdentity.set(urlKey, merged);
  }

  return [...new Set(byIdentity.values())];
}
