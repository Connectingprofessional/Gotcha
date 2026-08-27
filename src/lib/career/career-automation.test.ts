import { describe, expect, it } from "vitest";
import { buildHuntPlan, evaluateCareerAutomation } from "./career-automation";

describe("career automation", () => {
  it("blocks automation without a verified application URL", () => {
    const result = evaluateCareerAutomation({ overallScore: 90 });
    expect(result.huntStatus).toBe("blocked");
    expect(result.recommendation).toBe("review");
  });

  it("skips weak opportunities", () => {
    const result = evaluateCareerAutomation({ overallScore: 40, applicationUrl: "https://example.com/jobs/1" });
    expect(result.recommendation).toBe("skip");
    expect(result.huntStatus).toBe("skipped");
  });

  it("requires approval for promising opportunities below auto threshold", () => {
    const result = evaluateCareerAutomation({ overallScore: 72, autoApplyThreshold: 80, applicationUrl: "https://example.com/jobs/1" });
    expect(result.recommendation).toBe("review");
    expect(result.huntStatus).toBe("waiting_for_approval");
  });

  it("queues qualified opportunities and schedules follow up", () => {
    const result = evaluateCareerAutomation({
      overallScore: 91,
      applicationUrl: "https://example.com/jobs/1",
      appliedAt: "2026-08-01T00:00:00.000Z",
      followUpDays: 5,
      userApprovalRequired: false,
    });
    expect(result.recommendation).toBe("apply");
    expect(result.huntStatus).toBe("queued");
    expect(result.followUpStatus).toBe("queued");
    expect(result.nextFollowUpAt).toBe("2026-08-06T00:00:00.000Z");
    expect(buildHuntPlan("auto_with_approval", result)).toContain("request_approval");
    expect(buildHuntPlan("auto_with_approval", result)).toContain("schedule_follow_up");
  });
});
