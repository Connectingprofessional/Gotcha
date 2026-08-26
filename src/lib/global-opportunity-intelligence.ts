export type EmploymentType = "full-time" | "part-time" | "contract" | "fixed-term" | "temporary" | "freelance" | "consulting" | "internship" | "eor" | "unknown";

export type SalaryPeriod = "hourly" | "monthly" | "annual";

export type CompensationInput = {
  currency: string;
  min?: number;
  max?: number;
  period?: SalaryPeriod;
  bonusMin?: number;
  bonusMax?: number;
  equityAnnualValue?: number;
};

export type FxQuote = {
  base: string;
  quote: string;
  rate: number;
  asOf: string;
  source: string;
};

export type WageFloor = {
  amount: number;
  currency: string;
  period: SalaryPeriod;
  scope: "national" | "regional" | "sector" | "occupation" | "collective";
  effectiveFrom: string;
  source: string;
};

export type TaxEstimate = {
  grossAnnual: number;
  incomeTax: number;
  socialContributions: number;
  otherPayrollDeductions: number;
  netAnnual: number;
  effectiveRate: number;
  currency: string;
  asOf: string;
  source: string;
};

export type CostOfLiving = {
  monthly: number;
  currency: string;
  housing?: number;
  utilities?: number;
  transport?: number;
  food?: number;
  healthcare?: number;
  familyAdjustment?: number;
  asOf: string;
  source: string;
};

export type Benefits = {
  annualLeaveDays?: number;
  sickLeaveDays?: number;
  publicHolidayDays?: number;
  healthInsurance?: boolean;
  pension?: boolean;
  parentalLeave?: boolean;
  relocationAllowance?: number;
  bonusEligible?: boolean;
  notes?: string[];
};

export type MobilityInput = {
  destinationCountry: string;
  candidateCountry?: string;
  workAuthorization?: "authorized" | "sponsorship-required" | "unknown";
  visaRequired?: boolean;
  sponsorship?: "yes" | "no" | "unknown";
  estimatedVisaWeeks?: number;
  requiredDocuments?: string[];
  availableDocuments?: string[];
  relocationAvailable?: boolean;
  eorAvailable?: boolean;
};

export type TimezoneInput = {
  candidateTimeZone?: string;
  employerTimeZone?: string;
  requiredStartHour?: number;
  requiredEndHour?: number;
  overlapHours?: number;
};

export type GlobalOpportunityContext = {
  compensation?: CompensationInput;
  fx?: FxQuote;
  wageFloor?: WageFloor;
  tax?: TaxEstimate;
  costOfLiving?: CostOfLiving;
  benefits?: Benefits;
  employmentType?: EmploymentType;
  mobility?: MobilityInput;
  timezone?: TimezoneInput;
  targetCurrency?: string;
};

export type GlobalOpportunityResult = {
  salaryAnnualMin?: number;
  salaryAnnualMax?: number;
  salaryTargetAnnual?: number;
  targetCurrency?: string;
  wageFloorCompliant: "yes" | "no" | "unknown";
  wageFloorRatio?: number;
  estimatedNetAnnual?: number;
  estimatedNetMonthly?: number;
  estimatedMonthlyLivingCost?: number;
  estimatedMonthlyDisposable?: number;
  benefitsScore: number;
  employmentScore: number;
  mobilityScore: number;
  timezoneScore: number;
  financialScore: number;
  confidence: "high" | "medium" | "low";
  warnings: string[];
  reasons: string[];
};

function annualize(amount: number | undefined, period: SalaryPeriod = "annual") {
  if (amount === undefined || !Number.isFinite(amount)) return undefined;
  if (period === "monthly") return amount * 12;
  if (period === "hourly") return amount * 2080;
  return amount;
}

function convert(amount: number | undefined, from: string, to: string, fx?: FxQuote) {
  if (amount === undefined) return undefined;
  if (from.toUpperCase() === to.toUpperCase()) return amount;
  if (!fx || fx.base.toUpperCase() !== from.toUpperCase() || fx.quote.toUpperCase() !== to.toUpperCase() || !(fx.rate > 0)) return undefined;
  return amount * fx.rate;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function evaluateGlobalOpportunity(ctx: GlobalOpportunityContext = {}): GlobalOpportunityResult {
  const warnings: string[] = [];
  const reasons: string[] = [];
  const targetCurrency = (ctx.targetCurrency ?? ctx.compensation?.currency ?? "").toUpperCase() || undefined;
  const salaryMin = annualize(ctx.compensation?.min, ctx.compensation?.period);
  const salaryMax = annualize(ctx.compensation?.max, ctx.compensation?.period);
  const salaryTarget = salaryMin !== undefined && salaryMax !== undefined ? (salaryMin + salaryMax) / 2 : salaryMax ?? salaryMin;

  let targetMin = convert(salaryMin, ctx.compensation?.currency ?? "", targetCurrency ?? "", ctx.fx);
  let targetMax = convert(salaryMax, ctx.compensation?.currency ?? "", targetCurrency ?? "", ctx.fx);
  let targetSalary = convert(salaryTarget, ctx.compensation?.currency ?? "", targetCurrency ?? "", ctx.fx);
  if (targetCurrency && ctx.compensation?.currency?.toUpperCase() === targetCurrency) {
    targetMin = salaryMin;
    targetMax = salaryMax;
    targetSalary = salaryTarget;
  }
  if ((salaryMin !== undefined || salaryMax !== undefined) && targetCurrency && targetMin === undefined) {
    warnings.push("Currency conversion is unavailable; the original employer currency is retained.");
  }

  let wageFloorCompliant: GlobalOpportunityResult["wageFloorCompliant"] = "unknown";
  let wageFloorRatio: number | undefined;
  if (ctx.wageFloor && targetSalary !== undefined) {
    const floorAnnual = annualize(ctx.wageFloor.amount, ctx.wageFloor.period);
    const floorTarget = convert(floorAnnual, ctx.wageFloor.currency, targetCurrency ?? ctx.wageFloor.currency, ctx.fx);
    if (floorTarget !== undefined && floorTarget > 0) {
      wageFloorRatio = targetSalary / floorTarget;
      wageFloorCompliant = targetSalary >= floorTarget ? "yes" : "no";
      reasons.push(wageFloorCompliant === "yes" ? `${wageFloorRatio.toFixed(1)}× the applicable wage floor` : "Advertised compensation is below the supplied wage floor");
    } else warnings.push("Wage-floor currency conversion is unavailable.");
  } else warnings.push("Local wage-floor data is not available for this opportunity.");

  const netAnnual = ctx.tax?.netAnnual;
  const netMonthly = netAnnual !== undefined ? netAnnual / 12 : undefined;
  const living = ctx.costOfLiving?.monthly;
  const disposable = netMonthly !== undefined && living !== undefined ? netMonthly - living : undefined;
  if (ctx.tax && ctx.tax.currency !== targetCurrency) warnings.push("Tax estimate uses a different currency than the target compensation currency.");
  if (netMonthly !== undefined && living !== undefined) reasons.push(`Estimated disposable income: ${Math.round(disposable ?? 0).toLocaleString()} ${targetCurrency ?? ctx.tax?.currency ?? ""}/month`);
  else warnings.push("Tax or cost-of-living data is incomplete; disposable income cannot be calculated reliably.");

  const b = ctx.benefits;
  const benefitSignals = [b?.annualLeaveDays !== undefined, b?.sickLeaveDays !== undefined, b?.publicHolidayDays !== undefined, b?.healthInsurance !== undefined, b?.pension !== undefined, b?.parentalLeave !== undefined].filter(Boolean).length;
  const benefitsScore = clamp(50 + benefitSignals * 8 + (b?.healthInsurance ? 5 : 0) + (b?.pension ? 5 : 0));

  const employmentScore = ctx.employmentType && ctx.employmentType !== "unknown" ? 90 : 55;
  if (ctx.employmentType === "eor" || ctx.mobility?.eorAvailable) reasons.push("EOR route is available for this opportunity.");

  let mobilityScore = 55;
  if (ctx.mobility) {
    mobilityScore = 50;
    if (ctx.mobility.workAuthorization === "authorized") mobilityScore += 35;
    else if (ctx.mobility.sponsorship === "yes") mobilityScore += 25;
    else if (ctx.mobility.workAuthorization === "sponsorship-required" && ctx.mobility.sponsorship === "no") mobilityScore -= 35;
    if (ctx.mobility.eorAvailable) mobilityScore += 10;
    if (ctx.mobility.relocationAvailable) mobilityScore += 5;
    const required = new Set(ctx.mobility.requiredDocuments ?? []);
    const available = new Set(ctx.mobility.availableDocuments ?? []);
    const missing = [...required].filter((d) => !available.has(d));
    if (missing.length) warnings.push(`Missing mobility documents: ${missing.join(", ")}`);
    if (ctx.mobility.estimatedVisaWeeks !== undefined) reasons.push(`Estimated immigration processing: ${ctx.mobility.estimatedVisaWeeks} weeks (verify with the relevant authority).`);
  }
  mobilityScore = clamp(mobilityScore);

  const timezoneScore = ctx.timezone?.overlapHours !== undefined ? clamp(ctx.timezone.overlapHours / 8 * 100) : 60;
  const financialScore = disposable !== undefined ? clamp(50 + (disposable / Math.max(1, netMonthly!)) * 50) : targetSalary !== undefined ? 65 : 50;
  const confidence = warnings.length === 0 ? "high" : warnings.length <= 2 ? "medium" : "low";

  return {
    salaryAnnualMin: targetMin ?? salaryMin,
    salaryAnnualMax: targetMax ?? salaryMax,
    salaryTargetAnnual: targetSalary ?? salaryTarget,
    targetCurrency,
    wageFloorCompliant,
    wageFloorRatio,
    estimatedNetAnnual: netAnnual,
    estimatedNetMonthly: netMonthly,
    estimatedMonthlyLivingCost: living,
    estimatedMonthlyDisposable: disposable,
    benefitsScore,
    employmentScore,
    mobilityScore,
    timezoneScore,
    financialScore,
    confidence,
    warnings,
    reasons,
  };
}
