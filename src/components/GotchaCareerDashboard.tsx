import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Globe2,
  Radar,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { JOBS, type Job } from "@/lib/data";
import { applicationAnalytics, careerHuntScore, scoreOpportunity, shieldAssessment } from "@/lib/careerIntelligence";
import { useGotcha, useSessionUser } from "@/lib/store";
import { cn } from "@/lib/utils";

// The 7 stages of the Gotcha build/candidate journey. Order and names match
// the locked "Career Command Center" report structure.
const STAGES = [
  { n: 1, title: "Foundation & Architecture", color: "#38bdf8", ticks: 4 },
  { n: 2, title: "Professional Identity + Opportunity Engine", color: "#22c55e", ticks: 6 },
  { n: 3, title: "Career Command Center + Roadmap", color: "#7c5cff", ticks: 4 },
  { n: 4, title: "Applications + AI Career Engine", color: "#f59e0b", ticks: 7 },
  { n: 5, title: "Global Intelligence", color: "#38bdf8", ticks: 5 },
  { n: 6, title: "Global Access + Career Development", color: "#22c55e", ticks: 4 },
  { n: 7, title: "Analytics + Shield + Production QA", color: "#ef4444", ticks: 2 },
] as const;

const TOTAL_TICKS = STAGES.reduce((n, s) => n + s.ticks, 0);

const PIPELINE = ["Search", "Shortlisted", "Screened", "Applied", "Response", "Interview", "Stage 1", "Stage 2", "Final", "Appointment"];

// Rough, non-cartographic region positions (percent of map card) — this is a
// stylised signal map, not a geographically accurate projection.
const MAP_MARKERS = [
  { label: "North America", left: "16%", top: "42%", kind: "shortlisted" as const },
  { label: "Europe", left: "48%", top: "34%", kind: "applied" as const },
  { label: "Asia-Pacific", left: "72%", top: "40%", kind: "target" as const },
  { label: "Asia-Pacific", left: "80%", top: "58%", kind: "applied" as const },
  { label: "Asia-Pacific", left: "68%", top: "52%", kind: "target" as const },
  { label: "Middle East", left: "60%", top: "48%", kind: "shortlisted" as const },
];

const MARKER_COLOR: Record<string, string> = { target: "#ef4444", applied: "#22c55e", shortlisted: "#94a3b8" };

export function GotchaCareerDashboard({ onOpenJob }: { onOpenJob: (j: Job) => void }) {
  const user = useSessionUser();
  const applications = useGotcha((s) => s.applications);
  const savedJobIds = useGotcha((s) => s.savedJobIds);
  const careerEvents = useGotcha((s) => s.careerEvents);
  const setView = useGotcha((s) => s.setView);

  const analytics = applicationAnalytics(applications);
  const huntScore = careerHuntScore(user, applications);

  const topMatches = useMemo(
    () => (user ? [...JOBS].map((job) => ({ job, score: scoreOpportunity(job, user).overall })).sort((a, b) => b.score - a.score).slice(0, 2) : []),
    [user],
  );
  const shield = topMatches[0] ? shieldAssessment(topMatches[0].job) : { level: "low" as const, reasons: [] };
  const riskySignals = JOBS.filter((j) => shieldAssessment(j).level !== "low").length;

  const funnel = [
    { label: "Search", value: JOBS.length, color: "#38bdf8" },
    { label: "Shortlisted", value: savedJobIds.length, color: "#2dd4bf" },
    { label: "Applied", value: analytics.applied + analytics.interviews + analytics.assessments + analytics.offers + analytics.rejected, color: "#f59e0b" },
    { label: "Interview", value: analytics.interviews + analytics.offers, color: "#fb923c" },
    { label: "Offer", value: analytics.offers, color: "#ef4444" },
  ];
  const maxFunnel = Math.max(1, funnel[0].value);

  const activePipelineIndex = Math.min(PIPELINE.length - 1, analytics.total === 0 ? 0 : analytics.offers > 0 ? 9 : analytics.interviews > 0 ? 6 : analytics.applied > 0 ? 3 : 1);

  const recentActivity = careerEvents.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Row 1: roadmap ring · global map · live pipeline */}
      <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr_1fr]">
        <RoadmapRingCard activeStage={3} />
        <GlobalMapCard />
        <LivePipelineCard activeIndex={activePipelineIndex} />
      </section>

      {/* Row 2: hunt funnel · recent activity · ai recommendations */}
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1fr_1fr]">
        <FunnelCard funnel={funnel} maxFunnel={maxFunnel} />
        <RecentActivityCard events={recentActivity} />
        <AiRecommendationsCard matches={topMatches} onOpenJob={onOpenJob} onSeeAll={() => setView("coach")} />
      </section>

      {/* Row 3: key metrics + shield */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <ShieldCheck className="size-4 text-primary-3" /> Key Metrics &amp; Gotcha Shield
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricTile label="Career Hunt Score" value={`${huntScore}`} suffix="/100" tone="text-primary-3" />
          <MetricTile label="Application Response Rate" value={`${analytics.responseRate}`} suffix="%" tone="text-warn" />
          <MetricTile label="Interview Conversion Rate" value={`${analytics.interviewRate}`} suffix="%" tone="text-fg" />
          <MetricTile label="Gotcha Shield Status" value={shield.level === "low" ? "SECURE" : shield.level.toUpperCase()} suffix="" tone={shield.level === "low" ? "text-success" : "text-danger"} />
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted">Gotcha Shield Signals</p>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-muted"><ShieldAlert className="size-3.5 text-danger" /> Fake Job Detect</span><span className="font-semibold">0</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-muted"><ShieldAlert className="size-3.5 text-warn" /> Scam Indicators</span><span className="font-semibold">{riskySignals}</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoadmapRingCard({ activeStage }: { activeStage: number }) {
  const donutData = STAGES.map((s) => ({ name: s.title, value: s.ticks, color: s.color }));
  const left = STAGES.filter((s) => [1, 3, 6].includes(s.n));
  const right = STAGES.filter((s) => [2, 4, 5].includes(s.n));
  const bottom = STAGES.filter((s) => s.n === 7);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        <Radar className="size-4 text-primary-3" /> 32-Stage Master Product Roadmap &amp; Workflow
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="space-y-2">{left.map((s) => <StageEntry key={s.n} stage={s} />)}</div>
        <div className="relative mx-auto size-[132px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} dataKey="value" innerRadius={40} outerRadius={62} paddingAngle={3} stroke="none" startAngle={90} endAngle={-270}>
                {donutData.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-muted">Stage</span>
            <span className="text-xl font-semibold tabular-nums">{activeStage}/7</span>
            <span className="text-[9px] text-subtle">{TOTAL_TICKS} sub-points</span>
          </div>
        </div>
        <div className="space-y-2">{right.map((s) => <StageEntry key={s.n} stage={s} />)}</div>
      </div>
      <div className="mt-2">{bottom.map((s) => <StageEntry key={s.n} stage={s} centered />)}</div>
    </div>
  );
}

function StageEntry({ stage, centered }: { stage: (typeof STAGES)[number]; centered?: boolean }) {
  return (
    <div className={cn("flex items-start gap-2", centered && "justify-center text-center")}>
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-bg" style={{ background: stage.color }}>
        {stage.n}
      </span>
      <p className="text-[11px] leading-4 text-muted">{stage.title}</p>
    </div>
  );
}

function GlobalMapCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        <Globe2 className="size-4 text-primary-3" /> Global Career Map
      </div>
      <div className="relative h-[220px] overflow-hidden rounded-lg border border-border bg-[radial-gradient(ellipse_at_center,_var(--color-surface),_var(--color-bg))]">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,rgba(139,155,180,0.25)_1px,transparent_1.2px)] [background-size:14px_14px]" />
        {MAP_MARKERS.map((m, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: m.left, top: m.top }}>
            <span className="block size-2.5 animate-pulse rounded-full" style={{ background: MARKER_COLOR[m.kind] }} />
          </div>
        ))}
        <div className="absolute left-3 top-1/2 text-[10px] font-medium text-subtle">North America</div>
        <div className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-medium text-subtle">Europe</div>
        <div className="absolute right-3 top-1/2 text-[10px] font-medium text-subtle">Asia-Pacific</div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: MARKER_COLOR.target }} /> Target</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: MARKER_COLOR.applied }} /> Applied</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: MARKER_COLOR.shortlisted }} /> Shortlisted</span>
      </div>
    </div>
  );
}

function LivePipelineCard({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        <TrendingUp className="size-4 text-primary-3" /> Live Career Roadmap Pipeline
      </div>
      <div className="relative h-[220px] overflow-x-auto">
        <div className="relative h-full min-w-[440px]">
          {PIPELINE.map((label, i) => {
            const bottomPct = 8 + (i / (PIPELINE.length - 1)) * 74;
            const leftPct = 4 + (i / (PIPELINE.length - 1)) * 90;
            const passed = i <= activeIndex;
            return (
              <div key={label} className="absolute flex -translate-x-1/2 flex-col items-center text-center" style={{ left: `${leftPct}%`, bottom: `${bottomPct}%` }}>
                <span className={cn("mb-1 flex size-3.5 items-center justify-center rounded-full border-2", passed ? "border-primary bg-primary/30" : "border-border bg-card-2")} />
                <span className={cn("whitespace-nowrap text-[9px] font-medium", passed ? "text-fg" : "text-subtle")}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FunnelCard({ funnel, maxFunnel }: { funnel: { label: string; value: number; color: string }[]; maxFunnel: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><Sparkles className="size-4 text-primary-3" /> Career Hunt Funnel</div>
        <span className="text-[10px] text-subtle">Conversion (%)</span>
      </div>
      <div className="space-y-2.5">
        {funnel.map((f, i) => {
          const prev = i > 0 ? funnel[i - 1].value : f.value;
          const conv = prev ? Math.round((f.value / prev) * 100) : 0;
          const widthPct = Math.max(14, (f.value / maxFunnel) * 100);
          return (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-right text-[10px] text-muted">{f.label}</div>
              <div className="h-6 flex-1 rounded-md bg-surface">
                <div className="flex h-6 items-center rounded-md px-2 text-[10px] font-semibold text-bg transition-all" style={{ width: `${widthPct}%`, background: f.color }}>
                  {f.value}
                </div>
              </div>
              <div className="w-10 shrink-0 text-right text-[10px] text-subtle">{i > 0 ? `${conv}%` : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivityCard({ events }: { events: { type: string; occurredAt: string }[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        <CheckCircle2 className="size-4 text-primary-3" /> Recent Activity
      </div>
      {events.length ? (
        <div className="space-y-3">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
              <div>
                <p className="text-xs font-medium leading-4">{describeEvent(e.type)}</p>
                <p className="mt-0.5 text-[10px] text-subtle">{new Date(e.occurredAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs leading-5 text-muted">No activity yet — discover an opportunity or apply to start your live feed.</p>
      )}
    </div>
  );
}

function describeEvent(type: string): string {
  const map: Record<string, string> = {
    "application.created": "New application submitted",
    "application.status_changed": "Application status updated",
    "opportunity.saved": "Opportunity shortlisted",
    "search.performed": "Search saved",
    "profile.updated": "Profile updated",
    "referral.requested": "Referral requested",
    "mentor.requested": "Mentor request opened",
    "goal.updated": "Career goal updated",
  };
  return map[type] ?? type;
}

function AiRecommendationsCard({ matches, onOpenJob, onSeeAll }: { matches: { job: Job; score: number }[]; onOpenJob: (j: Job) => void; onSeeAll: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><Bot className="size-4 text-primary-3" /> AI Career Agent Recommendations</div>
        <button type="button" onClick={onSeeAll} className="text-[10px] font-semibold text-primary-3">Ask agent</button>
      </div>
      {matches.length ? (
        <div className="space-y-2.5">
          {matches.map(({ job, score }) => (
            <button key={job.id} type="button" onClick={() => onOpenJob(job)} className="flex w-full items-start gap-2 rounded-lg border border-border bg-surface p-2.5 text-left hover:bg-card-2">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-warn" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold leading-4">AI Mock Interview scheduled with {job.company}</span>
                <span className="mt-0.5 block text-[10px] text-muted">New Match Found: {job.title} at {job.company} ({score}% Score)</span>
              </span>
              <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-subtle" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs leading-5 text-muted">Complete your profile so the AI Career Agent can surface recommendations.</p>
      )}
    </div>
  );
}

function MetricTile({ label, value, suffix, tone }: { label: string; value: string; suffix: string; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-bold tabular-nums", tone)}>{value}<span className="text-xs font-medium text-muted">{suffix}</span></p>
    </div>
  );
}
