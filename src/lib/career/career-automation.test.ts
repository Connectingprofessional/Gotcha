import assert from "node:assert/strict";
import test from "node:test";
import { buildHuntPlan, computeFollowUpDate, evaluateCareerAutomation } from "./career-automation.ts";

test("blocks automation without a verified application URL", () => {
  const result = evaluateCareerAutomation({ overallScore: 90 });
  assert.equal(result.huntStatus, "blocked");
  assert.equal(result.recommendation, "review");
});

test("skips weak opportunities", () => {
  const result = evaluateCareerAutomation({ overallScore: 40, applicationUrl: "https://example.com/jobs/1" });
  assert.equal(result.recommendation, "skip");
  assert.equal(result.huntStatus, "skipped");
});

test("requires approval for promising opportunities below auto threshold", () => {
  const result = evaluateCareerAutomation({ overallScore: 72, autoApplyThreshold: 80, applicationUrl: "https://example.com/jobs/1" });
  assert.equal(result.recommendation, "review");
  assert.equal(result.huntStatus, "waiting_for_approval");
});

test("queues qualified opportunities and schedules follow up", () => {
  const result = evaluateCareerAutomation({
    overallScore: 91,
    applicationUrl: "https://example.com/jobs/1",
    appliedAt: "2026-08-01T00:00:00.000Z",
    followUpDays: 5,
    userApprovalRequired: false,
  });
  assert.equal(result.recommendation, "apply");
  assert.equal(result.huntStatus, "queued");
  assert.equal(result.followUpStatus, "queued");
  assert.equal(result.nextFollowUpAt, "2026-08-06T00:00:00.000Z");
  assert.ok(buildHuntPlan("auto_with_approval", result).includes("request_approval"));
  assert.ok(buildHuntPlan("auto_with_approval", result).includes("schedule_follow_up"));
});

test("computes a follow-up date a fixed number of days after applying", () => {
  assert.equal(computeFollowUpDate("2026-08-01", 5), "2026-08-06T00:00:00.000Z");
  assert.equal(computeFollowUpDate("2026-08-01"), "2026-08-08T00:00:00.000Z"); // default 7 days
});

test("returns undefined for an unparseable applied-at date rather than throwing", () => {
  assert.equal(computeFollowUpDate("not-a-date"), undefined);
});
