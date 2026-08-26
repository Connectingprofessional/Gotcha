import assert from "node:assert/strict";
import test from "node:test";
import { annualizeCompensation, convertAnnualCompensation, workingHourOverlap } from "./global-compensation";

test("annualizes monthly employer compensation without losing source values", () => {
  const result = annualizeCompensation({ min: 10000, max: 15000, currency: "AED", period: "month", bonusMin: 10000 });
  assert.equal(result.min, 10000);
  assert.equal(result.max, 15000);
  assert.equal(result.annualMin, 120000);
  assert.equal(result.annualMax, 180000);
  assert.equal(result.bonusMin, 120000);
  assert.equal(result.currency, "AED");
});

test("converts annual compensation only with an explicit FX quote", () => {
  const annual = annualizeCompensation({ min: 100000, max: 120000, currency: "USD", period: "year" });
  const result = convertAnnualCompensation(annual, { base: "USD", quote: "INR", rate: 85, asOf: "2026-08-26T00:00:00Z" }, "INR");
  assert.equal(result.annualMin, 100000);
  assert.equal(result.preferredCurrency, "INR");
  assert.equal(result.preferredAnnualMin, 8500000);
  assert.equal(result.preferredAnnualMax, 10200000);
  assert.equal(result.fxAsOf, "2026-08-26T00:00:00Z");
});

test("rejects an FX quote with the wrong currency direction", () => {
  const annual = annualizeCompensation({ min: 100000, currency: "USD" });
  assert.throws(() => convertAnnualCompensation(annual, { base: "EUR", quote: "INR", rate: 90, asOf: "2026-08-26" }, "INR"), /FX quote must convert USD to INR/);
});

test("calculates working-hour overlap from IANA time zones", () => {
  const overlap = workingHourOverlap("Asia/Kolkata", "Europe/London", 9, 18, 9, 18, new Date("2026-01-15T12:00:00Z"));
  assert.equal(overlap, 4.5);
});
