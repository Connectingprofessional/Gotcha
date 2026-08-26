export type Compensation = {
  min?: number;
  max?: number;
  currency: string;
  period?: "hour" | "month" | "year";
  bonusMin?: number;
  bonusMax?: number;
  equity?: boolean;
};

export type FxRate = { base: string; quote: string; rate: number; asOf: string };

export type NormalizedCompensation = Compensation & {
  annualMin?: number;
  annualMax?: number;
  preferredCurrency?: string;
  preferredAnnualMin?: number;
  preferredAnnualMax?: number;
  fxAsOf?: string;
};

const PERIODS: Record<NonNullable<Compensation["period"]>, number> = {
  hour: 2080,
  month: 12,
  year: 1,
};

const normalizeCurrency = (value: string) => value.trim().toUpperCase();

function annualize(value: number | undefined, period: Compensation["period"] = "year") {
  return value === undefined ? undefined : value * PERIODS[period ?? "year"];
}

/** Converts employer-provided compensation to annual amounts without changing the source values. */
export function annualizeCompensation(compensation: Compensation): NormalizedCompensation {
  const period = compensation.period ?? "year";
  return {
    ...compensation,
    currency: normalizeCurrency(compensation.currency),
    annualMin: annualize(compensation.min, period),
    annualMax: annualize(compensation.max, period),
    bonusMin: annualize(compensation.bonusMin, period),
    bonusMax: annualize(compensation.bonusMax, period),
  };
}

/** Converts annual compensation using an explicitly timestamped FX quote. */
export function convertAnnualCompensation(
  compensation: NormalizedCompensation,
  fx: FxRate,
  preferredCurrency: string,
): NormalizedCompensation {
  const from = normalizeCurrency(compensation.currency);
  const to = normalizeCurrency(preferredCurrency);
  if (from === to) {
    return { ...compensation, preferredCurrency: to, preferredAnnualMin: compensation.annualMin, preferredAnnualMax: compensation.annualMax, fxAsOf: fx.asOf };
  }
  if (normalizeCurrency(fx.base) !== from || normalizeCurrency(fx.quote) !== to || !Number.isFinite(fx.rate) || fx.rate <= 0) {
    throw new Error(`FX quote must convert ${from} to ${to}`);
  }
  return {
    ...compensation,
    preferredCurrency: to,
    preferredAnnualMin: compensation.annualMin === undefined ? undefined : compensation.annualMin * fx.rate,
    preferredAnnualMax: compensation.annualMax === undefined ? undefined : compensation.annualMax * fx.rate,
    fxAsOf: fx.asOf,
  };
}

/**
 * Returns the candidate/employer local-time overlap in hours for a daily UTC window.
 * IANA timezone names are resolved by Intl, so DST rules are respected by the runtime.
 */
export function workingHourOverlap(
  candidateTimeZone: string,
  employerTimeZone: string,
  candidateStartHour = 9,
  candidateEndHour = 18,
  employerStartHour = 9,
  employerEndHour = 18,
  at = new Date(),
): number {
  const candidateOffset = timezoneOffsetMinutes(candidateTimeZone, at);
  const employerOffset = timezoneOffsetMinutes(employerTimeZone, at);
  const candidateStartUtc = candidateStartHour * 60 - candidateOffset;
  const candidateEndUtc = candidateEndHour * 60 - candidateOffset;
  const employerStartUtc = employerStartHour * 60 - employerOffset;
  const employerEndUtc = employerEndHour * 60 - employerOffset;
  return Math.max(0, Math.min(candidateEndUtc, employerEndUtc) - Math.max(candidateStartUtc, employerStartUtc)) / 60;
}

function timezoneOffsetMinutes(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(date);
  const value = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = value.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === "+" ? minutes : -minutes;
}
