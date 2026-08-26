import assert from "node:assert/strict";
import test from "node:test";
import { matchOpportunity, rankOpportunities } from "./opportunity-matcher";

const profile = {
  skills: ["TypeScript", "Payments", "Product Analytics"],
  titles: ["Senior Product Manager"],
  industries: ["Fintech"],
  countries: ["UK"],
  locations: ["London"],
  seniority: "Senior",
  remotePreference: "remote_preferred" as const,
  minSalary: 90000,
  salaryCurrency: "GBP",
};

test("explains a strong opportunity match", () => {
  const match = matchOpportunity(profile, {
    sourceId: "company",
    title: "Senior Product Manager",
    company: "Acme Pay",
    industry: "Fintech",
    country: "UK",
    location: "London",
    skills: ["TypeScript", "Payments", "Product Analytics"],
    seniority: "Senior",
    remote: true,
    salaryMin: 95000,
    salaryMax: 120000,
    salaryCurrency: "GBP",
  });
  assert.ok(match.overall >= 90);
  assert.ok(match.reasons.length >= 3);
  assert.equal(match.gaps.length, 0);
});

test("penalizes incompatible work mode and seniority", () => {
  const match = matchOpportunity(profile, {
    sourceId: "portal",
    title: "Product Manager",
    company: "Acme",
    country: "US",
    location: "New York",
    seniority: "Junior",
    remote: false,
  });
  assert.ok(match.overall < 60);
  assert.ok(match.gaps.includes("Seniority does not match your target"));
  assert.ok(match.gaps.includes("This opportunity is not remote"));
});

test("ranks opportunities by explainable match score", () => {
  const ranked = rankOpportunities(profile, [
    { sourceId: "a", title: "Product Manager", company: "A", industry: "Retail", country: "US" },
    { sourceId: "b", title: "Senior Product Manager", company: "B", industry: "Fintech", country: "UK", location: "London", skills: ["Payments", "TypeScript"], seniority: "Senior", remote: true, salaryMax: 110000, salaryCurrency: "GBP" },
  ]);
  assert.equal(ranked[0].opportunity.company, "B");
  assert.ok(ranked[0].match.overall > ranked[1].match.overall);
});
