export type SkillGap = { skill: string; importance: "critical" | "high" | "medium"; evidence?: string };
export type DevelopmentPlan = { gaps: SkillGap[]; thirtyDay: string[]; sixtyDay: string[]; ninetyDay: string[] };

/** Provider-agnostic career development logic. */
export function buildDevelopmentPlan(input: { currentSkills: string[]; targetSkills: string[] }): DevelopmentPlan {
  const current = new Set(input.currentSkills.map((s) => s.trim().toLowerCase()).filter(Boolean));
  const gaps = input.targetSkills.filter(Boolean).filter((skill) => !current.has(skill.toLowerCase())).map((skill, i) => ({
    skill,
    importance: i < 2 ? "critical" as const : i < 5 ? "high" as const : "medium" as const,
  }));
  return {
    gaps,
    thirtyDay: gaps.slice(0, 2).map((g) => `Build practical evidence for ${g.skill}`),
    sixtyDay: gaps.slice(0, 4).map((g) => `Complete a portfolio project or applied milestone in ${g.skill}`),
    ninetyDay: gaps.slice(0, 6).map((g) => `Demonstrate ${g.skill} in target-role evidence and update the professional profile`),
  };
}
