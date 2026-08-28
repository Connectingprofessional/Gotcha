import assert from "node:assert/strict";
import test from "node:test";
import { matchOpportunity, rankOpportunities } from "./opportunity-matcher.ts";

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

test("rewards experience fit and flags a shortfall", () => {
  const senior = matchOpportunity(
    { ...profile, experienceYears: 8 },
    { sourceId: "x", title: "Senior Product Manager", company: "Acme", experienceYearsMin: 6, experienceYearsMax: 10 },
  );
  assert.equal(senior.experience, 100);

  const junior = matchOpportunity(
    { ...profile, experienceYears: 2 },
    { sourceId: "y", title: "Senior Product Manager", company: "Acme", experienceYearsMin: 6, experienceYearsMax: 10 },
  );
  assert.ok(junior.experience < 70);
  assert.ok(junior.gaps.includes("You may be short of the required years of experience"));
});

test("scores visa sponsorship only when the candidate needs it", () => {
  const noNeed = matchOpportunity(profile, { sourceId: "a", title: "x", company: "y", visaSponsorshipAvailable: false });
  assert.equal(noNeed.visa, 100);

  const needsAndOffered = matchOpportunity(
    { ...profile, needsVisaSponsorship: true },
    { sourceId: "b", title: "x", company: "y", visaSponsorshipAvailable: true },
  );
  assert.equal(needsAndOffered.visa, 100);
  assert.ok(needsAndOffered.reasons.includes("Employer offers visa sponsorship"));

  const needsButNotOffered = matchOpportunity(
    { ...profile, needsVisaSponsorship: true },
    { sourceId: "c", title: "x", company: "y", visaSponsorshipAvailable: false },
  );
  assert.equal(needsButNotOffered.visa, 0);
  assert.ok(needsButNotOffered.gaps.includes("Employer does not offer visa sponsorship"));

  const needsUnpublished = matchOpportunity({ ...profile, needsVisaSponsorship: true }, { sourceId: "d", title: "x", company: "y" });
  assert.equal(needsUnpublished.visa, 40);
});

test("ranks opportunities by explainable match score", () => {
  const ranked = rankOpportunities(profile, [
    { sourceId: "a", title: "Product Manager", company: "A", industry: "Retail", country: "US" },
    { sourceId: "b", title: "Senior Product Manager", company: "B", industry: "Fintech", country: "UK", location: "London", skills: ["Payments", "TypeScript"], seniority: "Senior", remote: true, salaryMax: 110000, salaryCurrency: "GBP" },
  ]);
  assert.equal(ranked[0].opportunity.company, "B");
  assert.ok(ranked[0].match.overall > ranked[1].match.overall);
});
