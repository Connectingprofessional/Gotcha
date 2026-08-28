import assert from "node:assert/strict";
import test from "node:test";
import { parseCvAnalysis } from "./cv-analysis.ts";

test("parses a well-formed structured response", () => {
  const text = [
    "SCORE: 82",
    "MATCHED: Product Strategy, Payments, Stakeholder Management",
    "MISSING: SQL, A/B Testing",
    "SUGGESTIONS:",
    "- Quantify the payments launch with a revenue or adoption metric",
    "- Lead with the outcome, not the activity",
    "- Add a line on cross-functional stakeholder alignment",
  ].join("\n");
  const result = parseCvAnalysis(text);
  assert.equal(result.score, 82);
  assert.deepEqual(result.matched, ["Product Strategy", "Payments", "Stakeholder Management"]);
  assert.deepEqual(result.missing, ["SQL", "A/B Testing"]);
  assert.equal(result.suggestions.length, 3);
  assert.equal(result.suggestions[0], "Quantify the payments launch with a revenue or adoption metric");
});

test("clamps an out-of-range score", () => {
  assert.equal(parseCvAnalysis("SCORE: 140").score, 100);
  assert.equal(parseCvAnalysis("SCORE: -5").score, 0);
});

test("degrades gracefully on malformed or partial output", () => {
  const result = parseCvAnalysis("The candidate looks like a strong fit overall.");
  assert.equal(result.score, null);
  assert.deepEqual(result.matched, []);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.suggestions, []);
});
