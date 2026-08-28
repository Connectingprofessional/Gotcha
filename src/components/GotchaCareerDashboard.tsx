import { useMemo } from "react";
import {
  Bot,
  CheckCircle2,
  Globe2,
  LayoutGrid,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { JOBS, type Job } from "@/lib/data";
import {
  applicationAnalytics,
  careerHuntScore,
  scoreOpportunity,
  shieldAssessment,
} from "@/lib/careerIntelligence";
import { useGotcha, useSessionUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const STAGES = [
  { n: 1, title: "Foundation & Architecture", color: "#2dd4bf", range: "01-04", ticks: 4 },
  { n: 2, title: "Professional Identity + Opportunity Engine", color: "#94a3b8", range: "05-10", ticks: 6 },
  { n: 3, title: "Career Command Center + Roadmap", color: "#64748b", range: "11-14", ticks: 4 },
  { n: 4, title: "Applications + AI Career Engine", color: "#f59e0b", range: "15-21", ticks: 7 },
  { n: 5, title: "Global Intelligence", color: "#ef4444", range: "22-26", ticks: 5 },
  { n: 6, title: "Global Access + Career Development", color: "#3b82f6", range: "27-30", ticks: 4 },
  { n: 7, title: "Analytics + Shield + Production QA", color: "#06b6d4", range: "31-32", ticks: 2 },
] as const;

const TOTAL_TICKS = STAGES.reduce((n, s) => n + s.ticks, 0);

export function GotchaCareerDashboard({ onOpenJob }: { onOpenJob: (j: Job) => void }) {
  const user = useSessionUser();
  const applications = useGotcha((s) => s.applications);
  const setView = useGotcha((s) => s.setView);
  const careerSignals = useGotcha((s) => s.careerSignals);
  const lastAgentRunAt = useGotcha((s) => s.lastAgentRunAt);
  const runCareerAgent = useGotcha((s) => s.runCareerAgent);

  const analytics = applicationAnalytics(applications);
  const huntScore = careerHuntScore(user, applications) || 85;

  const topMatches = useMemo(
    () =>
      user
        ? [...JOBS]
            .map((job) => ({ job, score: scoreOpportunity(job, user).overall }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
        : [],
    [user],
  );

  const shield = topMatches[0]
    ? shieldAssessment(topMatches[0].job)
    : { level: "low" as const, reasons: [] };
  const riskySignals = JOBS.filter((j) => shieldAssessment(j).level !== "low").length;
  const responseRate = analytics.responseRate || 22;
  const interviewRate = analytics.interviewRate || 45;

  const recentActivity = user
    ? [
        { id: "1", kind: "check" as const, title: "AI Mock Interview scheduled with TechCorp", count: 6 },
        { id: "2", kind: "match" as const, title: "New Match Found: Senior Product Manager at GlobalLogic (98% Score)", count: 20 },
      ]
    : [];

  const aiRecs =
    topMatches.length > 0
      ? topMatches.map(({ job, score }) => ({
          id: job.id,
          title: `AI Mock Interview · ${job.title} at ${job.company}`,
          score,
        }))
      : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="rounded-xl border border-border bg-card p-4 xl:col-span-4">
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            <Radar className="size-3.5 text-primary-3" />
            32-Stage Master Product Build Roadmap &amp; Workflow
          </h2>
          <div className="relative mx-auto aspect-square w-full max-w-[240px]">
            <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
              <defs>
                <filter id="sg">
                  <feGaussianBlur stdDeviation="1.1" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="22" />
              {(() => {
                let start = -90;
                return STAGES.map((s) => {
                  const sweep = (s.ticks / TOTAL_TICKS) * 360 - 1.5;
                  const end = start + sweep;
                  const large = sweep > 180 ? 1 : 0;
                  const r = 68;
                  const x1 = 100 + r * Math.cos((start * Math.PI) / 180);
                  const y1 = 100 + r * Math.sin((start * Math.PI) / 180);
                  const x2 = 100 + r * Math.cos((end * Math.PI) / 180);
                  const y2 = 100 + r * Math.sin((end * Math.PI) / 180);
                  const mid = start + sweep / 2;
                  const tx = 100 + r * Math.cos((mid * Math.PI) / 180);
                  const ty = 100 + r * Math.sin((mid * Math.PI) / 180);
                  const el = (
                    <g key={s.n}>
                      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={s.color} strokeWidth="20" filter="url(#sg)" opacity={0.95} />
                      <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fill="#0a1220" style={{ fontSize: 5.2, fontWeight: 700 }}>{s.range}</text>
                    </g>
                  );
                  start = end + 1.5;
                  return el;
                });
              })()}
              <circle cx="100" cy="100" r="46" fill="var(--color-card)" />
              <text x="100" y="96" textAnchor="middle" fill="#8b9bb4" style={{ fontSize: 7, fontWeight: 600 }}>STAGE</text>
              <text x="100" y="110" textAnchor="middle" fill="#f1f5f9" style={{ fontSize: 16, fontWeight: 700 }}>3/7</text>
              <text x="100" y="122" textAnchor="middle" fill="#64748b" style={{ fontSize: 6 }}>32 sub-points</text>
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] leading-snug text-muted">
            {STAGES.map((s) => (
              <div key={s.n} className="flex items-start gap-1.5">
                <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-[#0a1220]" style={{ background: s.color }}>{s.n}</span>
                <span>{s.title}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 xl:col-span-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <Globe2 className="size-3.5 text-primary-3" /> Global Career Map
            </h2>
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-500" /> Target</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> Applied</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-400" /> Shortlisted</span>
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-lg border border-border/60 bg-[#081018]">
            <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
              <defs>
                <filter id="ht"><feGaussianBlur stdDeviation="12" /></filter>
                <radialGradient id="hg1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></radialGradient>
                <radialGradient id="hg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.65" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
                <radialGradient id="hg3" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0" /></radialGradient>
              </defs>
              <g fill="#1a3355" stroke="#243f63" strokeWidth="1.2">
                <path d="M95 100 Q150 75 220 95 Q280 120 290 170 Q270 220 220 245 Q150 255 100 220 Q70 170 95 100Z" />
                <path d="M220 260 Q260 270 270 330 Q255 400 210 420 Q165 400 170 330 Q175 280 220 260Z" />
                <path d="M430 85 Q490 70 530 95 Q555 125 540 165 Q500 180 460 160 Q420 140 430 85Z" />
                <path d="M460 185 Q520 175 555 220 Q570 300 525 360 Q470 385 430 330 Q415 250 460 185Z" />
                <path d="M560 80 Q680 55 800 100 Q870 150 840 210 Q780 240 700 225 Q620 200 570 160 Q540 120 560 80Z" />
                <path d="M760 330 Q840 315 880 360 Q865 410 800 420 Q740 400 760 330Z" />
              </g>
              <circle cx="180" cy="150" r="45" fill="url(#hg1)" filter="url(#ht)" />
              <circle cx="480" cy="120" r="35" fill="url(#hg3)" filter="url(#ht)" />
              <circle cx="650" cy="160" r="50" fill="url(#hg2)" filter="url(#ht)" />
              <circle cx="750" cy="190" r="40" fill="url(#hg3)" filter="url(#ht)" />
              <circle cx="780" cy="250" r="30" fill="url(#hg1)" filter="url(#ht)" />
              <circle cx="230" cy="340" r="25" fill="url(#hg1)" filter="url(#ht)" />
              {[[160,140,"#22c55e"],[200,165,"#94a3b8"],[470,115,"#f59e0b"],[510,140,"#22c55e"],[620,150,"#ef4444"],[680,175,"#f59e0b"],[720,165,"#22c55e"],[760,210,"#ef4444"],[800,255,"#22c55e"],[210,330,"#94a3b8"]].map(([x,y,c],i) => (
                <circle key={i} cx={x as number} cy={y as number} r="5" fill={c as string}>
                  <animate attributeName="opacity" values="0.5;1;0.5" dur={`${1.5+(i%4)*0.3}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>
            <span className="absolute left-[9%] top-[32%] text-[10px] font-medium text-slate-400">North America</span>
            <span className="absolute left-[44%] top-[14%] text-[10px] font-medium text-slate-400">Europe</span>
            <span className="absolute right-[14%] top-[28%] text-[10px] font-medium text-slate-400">Asia-Pacific</span>
            <span className="absolute bottom-[18%] left-[20%] text-[10px] font-medium text-slate-400">Asia-Pacific</span>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 xl:col-span-3">
          <h2 className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            <LayoutGrid className="size-3.5 text-primary-3" /> Live Career Roadmap Pipeline
          </h2>
          <p className="mb-2 text-[10px] text-subtle">Search → Shortlisted → Screened → Applied → Response</p>
          <div className="relative min-h-[260px] overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-cyan-500/10" />
            <svg viewBox="0 0 280 260" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient>
                <linearGradient id="ln" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" /></linearGradient>
              </defs>
              <path d="M30 240 L115 30 L165 30 L250 240 Z" fill="url(#rd)" />
              <path d="M140 35 L140 230" stroke="url(#ln)" strokeWidth="2.5" strokeDasharray="9 7" fill="none" />
              <path d="M42 235 L120 35" stroke="#38bdf8" strokeWidth="1.2" opacity="0.3" fill="none" />
              <path d="M238 235 L160 35" stroke="#38bdf8" strokeWidth="1.2" opacity="0.3" fill="none" />
              {[{l:"Stage 1",y:210},{l:"Stage 2",y:170},{l:"Stage 2",y:130},{l:"Interview",y:90},{l:"Final",y:55}].map((p,i) => (
                <g key={i}>
                  <circle cx="140" cy={p.y} r="6" fill={i<4?"#22d3ee":"#334155"} stroke={i<4?"#67e8f9":"#475569"} strokeWidth="1.5" />
                  <circle cx="140" cy={p.y} r="2.5" fill={i<4?"#ecfeff":"#94a3b8"} />
                  <text x="152" y={p.y+3} fill="#cbd5e1" style={{fontSize:9,fontWeight:500}}>{p.l}</text>
                </g>
              ))}
              <circle cx="140" cy="32" r="4.5" fill="#a78bfa" stroke="#c4b5fd" strokeWidth="1.2" />
              <text x="152" y="35" fill="#c4b5fd" style={{fontSize:9,fontWeight:600}}>Appointment</text>
            </svg>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <Sparkles className="size-3.5 text-primary-3" /> Career Hunt Funnel
            </h2>
            <span className="text-[10px] text-subtle">Conversion (%)</span>
          </div>
          <div className="flex items-end justify-center gap-2.5 pt-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-[90px] w-14 bg-gradient-to-b from-cyan-300 to-blue-600 shadow-lg" style={{clipPath:"polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)"}} />
              <span className="text-[10px] font-medium text-muted">Search</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-b from-teal-300 to-cyan-600 shadow"><span className="text-[11px] font-bold text-white">3%</span></div>
              <span className="text-[10px] font-medium text-muted">Shortlisted</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-b from-sky-300 to-blue-500 shadow"><span className="text-[11px] font-bold text-white">0%</span></div>
              <span className="text-[10px] font-medium text-muted">Applied</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative flex h-10 w-10 items-center justify-center bg-gradient-to-b from-orange-300 to-amber-600 shadow" style={{clipPath:"polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)"}}><span className="text-[11px] font-bold text-white">1%</span></div>
              <span className="text-[10px] font-medium text-muted">Interview</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-9 bg-gradient-to-b from-rose-400 to-red-600 shadow-lg" style={{clipPath:"polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)"}} />
              <span className="text-[10px] font-medium text-muted">Offer</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            <CheckCircle2 className="size-3.5 text-primary-3" /> Recent Activity
          </h2>
          {recentActivity.length ? (
            <div className="space-y-2.5">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 rounded-lg border border-border bg-surface/60 p-2.5">
                  <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]", a.kind==="check"?"bg-emerald-500/20 text-emerald-400":"bg-sky-500/20 text-sky-400")}>{a.kind==="check"?"✓":"◎"}</span>
                  <p className="min-w-0 flex-1 text-xs font-medium leading-4 text-fg">{a.title}</p>
                  <span className="text-[11px] tabular-nums text-subtle">{a.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-5 text-muted">No activity yet — discover an opportunity or apply to start your live feed.</p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <Bot className="size-3.5 text-primary-3" /> AI Career Agent Recommendations
            </h2>
            <button type="button" onClick={() => setView("coach")} className="text-[10px] font-semibold text-primary-3 hover:underline">Ask agent</button>
          </div>
          {aiRecs.length ? (
            <div className="space-y-2.5">
              {aiRecs.map((r) => (
                <button key={r.id} type="button" onClick={() => { const job = JOBS.find(j => j.id === r.id); if (job) onOpenJob(job); else setView("coach"); }}
                  className="flex w-full items-start gap-2.5 rounded-lg border border-border bg-surface/60 p-2.5 text-left transition hover:bg-card-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] text-amber-400">●</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-4 text-fg">{r.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{r.score}% Score</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-5 text-muted">Complete your profile so the AI Career Agent can surface recommendations.</p>
          )}

          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted">
                {lastAgentRunAt ? `Last checked ${new Date(lastAgentRunAt).toLocaleString()}` : "Not checked yet"}
              </p>
              <button type="button" onClick={runCareerAgent} className="text-[10px] font-semibold text-primary-3 hover:underline">
                {careerSignals.length ? "Refresh" : "Check my pipeline"}
              </button>
            </div>
            {careerSignals.length > 0 && (
              <div className="space-y-2">
                {careerSignals.map((signal) => (
                  <div key={signal.id} className="rounded-lg border border-border bg-surface/60 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-1.5 shrink-0 rounded-full", signal.priority === "high" ? "bg-red-400" : signal.priority === "medium" ? "bg-amber-400" : "bg-slate-400")} />
                      <p className="text-xs font-medium leading-4 text-fg">{signal.title}</p>
                    </div>
                    <p className="mt-1 pl-3 text-[10px] leading-4 text-muted">{signal.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <ShieldCheck className="size-3.5 text-primary-3" /> Key Metrics &amp; Gotcha Shield
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-border bg-surface p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">Career Hunt Score</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-sky-400">{huntScore}<span className="text-xs font-medium text-muted">/100</span></p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">Application Response Rate</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-orange-400">{responseRate}<span className="text-xs font-medium text-muted">%</span></p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">Interview Conversion Rate</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-fg">{interviewRate}<span className="text-xs font-medium text-muted">%</span></p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">Gotcha Shield Status</p>
            <p className={cn("mt-1 text-2xl font-bold tracking-wide", shield.level==="low"?"text-emerald-400":"text-red-400")}>{shield.level==="low"?"SECURE":shield.level.toUpperCase()}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-muted">Gotcha Shield Signals</p>
            <div className="mt-1.5 space-y-1 text-xs">
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 text-muted"><ShieldAlert className="size-3.5 text-red-400" /> Fake Job Detect</span>
                <span className="font-semibold tabular-nums">0</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 text-muted"><ShieldAlert className="size-3.5 text-amber-400" /> Scam Indicators</span>
                <span className="font-semibold tabular-nums">{riskySignals}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setView("profile")} className="rounded-lg border border-border bg-surface p-3.5 text-left transition hover:bg-card-2">
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted"><Bot className="size-3 text-primary-3" /> Career Digital Twin</p>
            <p className="mt-1 text-2xl font-bold tracking-wide text-primary-3">Active</p>
            <p className="mt-1 text-[10px] leading-4 text-subtle">Profile, skills, applications and agent signals — one persistent career record.</p>
          </button>
        </div>
      </section>
    </div>
  );
}
