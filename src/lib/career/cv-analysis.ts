export type CvAnalysisResult = {
  score: number | null;
  matched: string[];
  missing: string[];
  suggestions: string[];
};

/**
 * Parses the structured CV-analysis response format defined by
 * `CV_SYSTEM` in `../ai.ts`:
 *
 *   SCORE: 82
 *   MATCHED: Product Strategy, Payments
 *   MISSING: SQL, A/B Testing
 *   SUGGESTIONS:
 *   - rewrite 1
 *   - rewrite 2
 *
 * Falls back gracefully (nulls / empty arrays) on malformed or partial
 * output rather than throwing, since this is free-form LLM text.
 */
export function parseCvAnalysis(text: string): CvAnalysisResult {
  const scoreMatch = text.match(/SCORE:\s*(-?\d{1,3})/i);
  const score = scoreMatch ? Math.min(100, Math.max(0, Number(scoreMatch[1]))) : null;

  const matchedMatch = text.match(/MATCHED:\s*(.+)/i);
  const matched = matchedMatch
    ? matchedMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const missingMatch = text.match(/MISSING:\s*(.+)/i);
  const missing = missingMatch
    ? missingMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const suggestionsBlock = text.split(/SUGGESTIONS:/i)[1] ?? "";
  const suggestions = suggestionsBlock
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  return { score, matched, missing, suggestions };
}
