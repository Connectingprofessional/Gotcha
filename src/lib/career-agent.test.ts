import assert from "node:assert/strict";
import test from "node:test";
import { deriveCareerSignals } from "./career-agent.ts";

const job = (over: Partial<import("./data").Job> = {}): import("./data").Job => ({
  id: "j1", title: "Senior PM", company: "Acme", logo: "", logoBg: "", location: "Remote",
  work: "Remote", match: 90, salary: "", posted: "", function: "Product", industry: "SaaS",
  tags: [], description: "", source: "Company site", ...over,
});

test("flags no applications yet as a high-priority signal", () => {
  const signals = deriveCareerSignals({ applications: [], jobs: [], savedJobIds: [], hasCvVariant: true });
  assert.ok(signals.some((s) => s.title.includes("haven't applied")));
});

test("flags a stale application that has aged past the active window", () => {
  const now = Date.now();
  const signals = deriveCareerSignals({
    applications: [{ id: "a1", jobId: "j1", status: "applied", appliedAt: new Date(now - 15 * 86_400_000).toISOString() }],
    jobs: [job()],
    savedJobIds: [],
    hasCvVariant: true,
    now,
  });
  assert.ok(signals.some((s) => s.title.includes("need a follow-up")));
});

test("does not flag a rejected or offered application as stale", () => {
  const now = Date.now();
  const signals = deriveCareerSignals({
    applications: [{ id: "a1", jobId: "j1", status: "rejected", appliedAt: new Date(now - 30 * 86_400_000).toISOString() }],
    jobs: [job()],
    savedJobIds: [],
    hasCvVariant: true,
    now,
  });
  assert.ok(!signals.some((s) => s.title.includes("need a follow-up")));
});

test("surfaces a high-match saved job that hasn't been applied to", () => {
  const signals = deriveCareerSignals({
    applications: [],
    jobs: [job({ id: "j2", match: 92 })],
    savedJobIds: ["j2"],
    hasCvVariant: true,
  });
  assert.ok(signals.some((s) => s.title.includes("high-match saved job")));
});

test("does not surface a saved job already applied to", () => {
  const signals = deriveCareerSignals({
    applications: [{ id: "a1", jobId: "j2", status: "applied", appliedAt: new Date().toISOString() }],
    jobs: [job({ id: "j2", match: 92 })],
    savedJobIds: ["j2"],
    hasCvVariant: true,
  });
  assert.ok(!signals.some((s) => s.title.includes("high-match saved job")));
});

test("flags missing CV variant as a medium-priority signal", () => {
  const signals = deriveCareerSignals({ applications: [], jobs: [], savedJobIds: [], hasCvVariant: false });
  const cvSignal = signals.find((s) => s.title.includes("CV variant"));
  assert.ok(cvSignal);
  assert.equal(cvSignal?.priority, "medium");
});
