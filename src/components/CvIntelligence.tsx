import { useState } from "react";
import { FileText, Sparkles, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGotcha, useSessionUser } from "@/lib/store";
import { cvAnalyze, generateCoverLetter } from "@/lib/ai";
import { parseCvAnalysis, type CvAnalysisResult } from "@/lib/career/cv-analysis";

type Tab = "analyze" | "variants" | "letters";

const TABS: { id: Tab; label: string }[] = [
  { id: "analyze", label: "Analyze & Optimize" },
  { id: "variants", label: "Resume Variants" },
  { id: "letters", label: "Cover Letters" },
];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warn" : "text-danger";
  const circumference = 2 * Math.PI * 26;
  const offset = circumference * (1 - score / 100);
  return (
    <div className="relative flex size-20 items-center justify-center">
      <svg viewBox="0 0 64 64" className="size-20 -rotate-90">
        <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <span className={cn("absolute text-lg font-semibold tabular", color)}>{score}%</span>
    </div>
  );
}

function KeywordChips({ items, tone }: { items: string[]; tone: "success" | "danger" }) {
  if (items.length === 0) return <p className="text-xs text-subtle">None found</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((k) => (
        <span
          key={k}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs",
            tone === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger",
          )}
        >
          {k}
        </span>
      ))}
    </div>
  );
}

function AnalyzeTab({ jd, setJd }: { jd: string; setJd: (v: string) => void }) {
  const cvText = useGotcha((s) => s.cvText);
  const setCvText = useGotcha((s) => s.setCvText);
  const saveCvVariant = useGotcha((s) => s.saveCvVariant);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CvAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  async function analyze() {
    if (!cvText.trim() || !jd.trim()) {
      setError("Paste both your CV and a job description first.");
      return;
    }
    setError("");
    setBusy(true);
    setResult(null);
    const res = await cvAnalyze({ data: { cvText, jobText: jd } });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(parseCvAnalysis(res.text));
  }

  function saveVariant() {
    if (!result) return;
    saveCvVariant({
      name: variantName || `Variant ${new Date().toLocaleDateString()}`,
      cvText,
      targetRole: targetRole || undefined,
      atsScore: result.score ?? undefined,
      matchedKeywords: result.matched,
      missingKeywords: result.missing,
      suggestions: result.suggestions,
    });
    setSaveOpen(false);
    setVariantName("");
    setTargetRole("");
    setSavedMsg("Saved as a resume variant.");
    setTimeout(() => setSavedMsg(""), 3000);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Your CV</label>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV…"
            rows={10}
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Target job description</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description you're targeting…"
            rows={10}
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={analyze}
          disabled={busy}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          <Sparkles className="size-4" />
          {busy ? "Analyzing…" : "Analyze Match"}
        </button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      {result && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start gap-6">
            {result.score !== null && (
              <div className="flex flex-col items-center gap-1">
                <ScoreRing score={result.score} />
                <span className="text-[11px] text-muted">ATS match</span>
              </div>
            )}
            <div className="min-w-[200px] flex-1 space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Matched keywords</p>
                <KeywordChips items={result.matched} tone="success" />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Missing keywords</p>
                <KeywordChips items={result.missing} tone="danger" />
              </div>
            </div>
          </div>

          {result.suggestions.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium text-muted">Suggested rewrites</p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-fg">
                    <span className="text-primary">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 border-t border-border pt-4">
            {!saveOpen ? (
              <button
                type="button"
                onClick={() => setSaveOpen(true)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
              >
                Save as resume variant
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Variant name (e.g. Senior PM — FinTech)"
                  className="rounded-md border border-border bg-input px-2.5 py-1.5 text-xs outline-none"
                />
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Target role (optional)"
                  className="rounded-md border border-border bg-input px-2.5 py-1.5 text-xs outline-none"
                />
                <button type="button" onClick={saveVariant} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium">
                  Save
                </button>
                <button type="button" onClick={() => setSaveOpen(false)} className="text-xs text-muted">
                  Cancel
                </button>
              </div>
            )}
            {savedMsg && <p className="mt-2 text-xs text-success">{savedMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function VariantsTab({ onUse }: { onUse: () => void }) {
  const variants = useGotcha((s) => s.cvVariants);
  const activateCvVariant = useGotcha((s) => s.activateCvVariant);
  const deleteCvVariant = useGotcha((s) => s.deleteCvVariant);

  if (variants.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <FileText className="mx-auto mb-2 size-6 text-subtle" />
        <p className="text-sm text-muted">No saved variants yet.</p>
        <p className="mt-1 text-xs text-subtle">
          Run an analysis in "Analyze & Optimize" and save it as a variant to build your library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {variants.map((v) => (
        <div key={v.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{v.name}</p>
              {v.targetRole && <p className="text-xs text-muted">{v.targetRole}</p>}
            </div>
            {v.atsScore !== undefined && (
              <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                {v.atsScore}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-subtle">Updated {new Date(v.updatedAt).toLocaleDateString()}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                activateCvVariant(v.id);
                onUse();
              }}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
            >
              Use this version
            </button>
            <button
              type="button"
              onClick={() => deleteCvVariant(v.id)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-danger"
              aria-label={`Delete ${v.name}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoverLettersTab({ jd }: { jd: string }) {
  const cvText = useGotcha((s) => s.cvText);
  const coverLetters = useGotcha((s) => s.coverLetters);
  const saveCoverLetter = useGotcha((s) => s.saveCoverLetter);
  const deleteCoverLetter = useGotcha((s) => s.deleteCoverLetter);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function generate() {
    if (!cvText.trim() || !jd.trim()) {
      setError("Add your CV and a job description in the Analyze tab first.");
      return;
    }
    setError("");
    setBusy(true);
    const res = await generateCoverLetter({ data: { cvText, jobText: jd, jobTitle, company } });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    saveCoverLetter({ content: res.text, jobTitle: jobTitle || undefined, company: company || undefined });
  }

  function copy(id: string, content: string) {
    navigator.clipboard?.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Job title</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Senior Product Manager"
            className="rounded-md border border-border bg-input px-2.5 py-1.5 text-sm outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Razorpay"
            className="rounded-md border border-border bg-input px-2.5 py-1.5 text-sm outline-none"
          />
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          <Sparkles className="size-4" />
          {busy ? "Writing…" : "Generate cover letter"}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-[11px] text-subtle">
        Uses your CV and the job description from the "Analyze &amp; Optimize" tab.
      </p>

      {coverLetters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">No cover letters yet — generate your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coverLetters.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-medium">
                  {c.jobTitle || "Untitled role"}
                  {c.company && <span className="text-muted"> · {c.company}</span>}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copy(c.id, c.content)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted"
                  >
                    {copiedId === c.id ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                    {copiedId === c.id ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCoverLetter(c.id)}
                    className="rounded-md px-2 py-1 text-xs text-danger"
                    aria-label="Delete cover letter"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-xs text-muted">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CvIntelligencePage() {
  const [tab, setTab] = useState<Tab>("analyze");
  const [jd, setJd] = useState("");
  const user = useSessionUser();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">CV Intelligence</h1>
        <p className="text-sm text-muted">
          ATS analysis, job-specific optimization, resume variants and cover letters
          {user ? ` for ${user.name}` : ""}.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "border-primary text-fg" : "border-transparent text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "analyze" && <AnalyzeTab jd={jd} setJd={setJd} />}
      {tab === "variants" && <VariantsTab onUse={() => setTab("analyze")} />}
      {tab === "letters" && <CoverLettersTab jd={jd} />}
    </div>
  );
}
