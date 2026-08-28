import assert from "node:assert/strict";
import test from "node:test";
import {
  deduplicateOpportunities,
  normalizeOpportunity,
  opportunityDeduplicationKey,
} from "./opportunity-normalizer.ts";

test("normalizes opportunity fields and skills", () => {
  const result = normalizeOpportunity({
    sourceId: " portal ",
    title: "  Senior   Product Manager ",
    company: " Example   Corp ",
    skills: ["AI", " AI ", "Payments"],
    location: " London  ",
  });
  assert.equal(result.title, "Senior Product Manager");
  assert.equal(result.company, "Example Corp");
  assert.deepEqual(result.skills, ["AI", "Payments"]);
  assert.equal(result.location, "London");
});

test("clamps invalid experience years and fixes an inverted range", () => {
  const negative = normalizeOpportunity({ sourceId: "a", title: "x", company: "y", experienceYearsMin: -3 });
  assert.equal(negative.experienceYearsMin, undefined);

  const inverted = normalizeOpportunity({ sourceId: "b", title: "x", company: "y", experienceYearsMin: 8, experienceYearsMax: 3 });
  assert.equal(inverted.experienceYearsMax, 8);
});

test("preserves an unpublished visa sponsorship status as unknown", () => {
  const result = normalizeOpportunity({ sourceId: "a", title: "x", company: "y" });
  assert.equal(result.visaSponsorshipAvailable, undefined);

  const published = normalizeOpportunity({ sourceId: "b", title: "x", company: "y", visaSponsorshipAvailable: true });
  assert.equal(published.visaSponsorshipAvailable, true);
});

test("uses canonical application URL for cross-source identity", () => {
  const a = { sourceId: "portal-a", title: "PM", company: "Acme", applicationUrl: "https://jobs.example.com/123?utm_source=a#apply" };
  const b = { sourceId: "portal-b", title: "Product Manager", company: "Acme", applicationUrl: "https://jobs.example.com/123?utm_source=b" };
  assert.equal(opportunityDeduplicationKey(a), opportunityDeduplicationKey(b));
});

test("deduplicates portal copies and retains richer data", () => {
  const result = deduplicateOpportunities([
    { sourceId: "a", title: "Engineer", company: "Acme", location: "Berlin" },
    { sourceId: "b", title: "Engineer", company: "Acme", location: "Berlin", skills: ["TypeScript", "Node"], applicationUrl: "https://acme.example/jobs/1" },
  ]);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].skills, ["Node", "TypeScript"]);
  assert.equal(result[0].applicationUrl, "https://acme.example/jobs/1");
});
