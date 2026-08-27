export type CvVersion = { id: string; label: string; skills: string[]; applications: number; responses: number; interviews: number; offers: number };
export type CvAnalysis = { score: number; keywordCoverage: number; experienceAlignment: number; strengths: string[]; gaps: string[]; recommendations: string[] };

/** Provider-agnostic CV analysis primitives for the Career Intelligence layer. */
export function analyseCv(input: { text: string; targetSkills?: string[]; targetSeniority?: string }): CvAnalysis {
  const text = input.text.toLowerCase();
  const skills = (input.targetSkills ?? []).filter(Boolean);
  const matched = skills.filter((skill) => text.includes(skill.toLowerCase()));
  const keywordCoverage = skills.length ? Math.round((matched.length / skills.length) * 100) : 0;
  const experienceAlignment = input.targetSeniority && text.includes(input.targetSeniority.toLowerCase()) ? 100 : 70;
  const gaps = skills.filter((skill) => !text.includes(skill.toLowerCase()));
  return { score: Math.round(keywordCoverage * 0.65 + experienceAlignment * 0.35), keywordCoverage, experienceAlignment, strengths: matched.slice(0, 8), gaps: gaps.slice(0, 8), recommendations: gaps.length ? [`Add evidence for: ${gaps.slice(0, 5).join(", ")}`, "Tailor the professional summary to the target role."] : ["Maintain current keyword coverage.", "Add quantified impact to the strongest achievements."] };
}

export function cvVersionPerformance(versions: CvVersion[]) {
  return versions.map((version) => ({ ...version, responseRate: version.applications ? version.responses / version.applications : 0, interviewRate: version.applications ? version.interviews / version.applications : 0, offerRate: version.applications ? version.offers / version.applications : 0 }));
}
export function bestCvVersion(versions: CvVersion[]) { return cvVersionPerformance(versions).sort((a, b) => b.responseRate - a.responseRate)[0] ?? null; }
