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
