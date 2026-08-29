import assert from "node:assert/strict";
import test from "node:test";
import { buildMobilityAndCompContext, evaluateGlobalOpportunity } from "./global-opportunity-intelligence.ts";

test("treats a same-country job as already work-authorized", () => {
  const context = buildMobilityAndCompContext(
    { country: "India", currency: "INR", salaryMin: 4500000, salaryMax: 6500000, visaSponsorship: "no" },
    { country: "India", currency: "INR" },
  );
  const result = evaluateGlobalOpportunity(context);
  assert.equal(result.mobilityScore, 85); // 50 base + 35 for authorized work status
});

test("flags a cross-border role with no sponsorship as a mobility risk", () => {
  const context = buildMobilityAndCompContext(
    { country: "Singapore", currency: "USD", salaryMin: 180000, salaryMax: 230000, visaSponsorship: "no" },
    { country: "India", currency: "INR" },
  );
  const result = evaluateGlobalOpportunity(context);
  assert.ok(result.mobilityScore < 50);
});

test("carries the destination currency through when no target currency is set", () => {
  const context = buildMobilityAndCompContext(
    { country: "Singapore", currency: "USD", salaryMin: 180000, salaryMax: 230000 },
    null,
  );
  const result = evaluateGlobalOpportunity(context);
  assert.equal(result.targetCurrency, "USD");
  assert.equal(result.salaryAnnualMin, 180000);
  assert.equal(result.salaryAnnualMax, 230000);
});

test("leaves compensation undefined rather than fabricating it when the job has no currency", () => {
  const context = buildMobilityAndCompContext({ country: "India" }, { country: "India", currency: "INR" });
  assert.equal(context.compensation, undefined);
});

test("computes working-hour overlap for a country pair with unambiguous single time zones", () => {
  const context = buildMobilityAndCompContext(
    { country: "Singapore", currency: "USD", salaryMin: 180000 },
    { country: "India", currency: "INR" },
  );
  const result = evaluateGlobalOpportunity(context);
  assert.ok(result.timezoneOverlapHours !== undefined && result.timezoneOverlapHours > 0);
});

test("leaves timezone overlap undefined for a country not in the unambiguous single-zone list", () => {
  const context = buildMobilityAndCompContext(
    { country: "United States", currency: "USD", salaryMin: 180000 },
    { country: "India", currency: "INR" },
  );
  const result = evaluateGlobalOpportunity(context);
  assert.equal(result.timezoneOverlapHours, undefined);
});
