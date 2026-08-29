import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileSearch,
  Globe2,
  MapPin,
  Radar,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";
import { JOBS, type Job } from "@/lib/data";
import { applicationAnalytics, careerHuntScore, mobilityAssessment, scoreOpportunity } from "@/lib/careerIntelligence";
import { useGotcha, useSessionUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const card = "rounded-[18px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(0,0,0,.18)]";
const muted = "text-muted";

function SectionTitle({ eyebrow, title, icon: Icon, action, onAction }: { eyebrow: string; title: string; icon: typeof Search; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[.24em] text-primary-3">{eyebrow}</p>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-fg"><Icon className="size-4 text-primary-3" />{title}</h2>
      </div>
      {action && onAction && <button type="button" onClick={onAction} className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-primary-3 hover:text-fg">{action}<ArrowRight className="size-3" /></button>}
    </div>
  );
}

function Kpi({ label, value, detail, icon: Icon, tone, onClick }: { label: string; value: string | number; detail: string; icon: typeof Search; tone: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn(card, "group p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-card-2") }>
      <div className="flex items-start justify-between"><span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface"><Icon className={cn("size-4", tone)} /></span><TrendingUp className="size-3.5 text-emerald-400/70" /></div>
      <p className="mt-3 text-[9px] font-bold uppercase tracking-[.18em] text-subtle">{label}</p>
      <p className={cn("mt-0.5 text-[26px] font-bold leading-none tabular-nums", tone)}>{value}</p>
      <p className="mt-2 text-[10px] leading-4 text-subtle">{detail}</p>
    </button>
  );
}

function Funnel({ analytics }: { analytics: ReturnType<typeof applicationAnalytics> }) {
  const rows = [
    ["Discovered", Math.max(JOBS.length, analytics.total), 100, "bg-primary"],
    ["Applied", analytics.total, Math.max(14, Math.min(82, analytics.total * 9)), "bg-cyan-400"],
    ["Interview", analytics.interviews, Math.max(8, Math.min(62, analytics.interviews * 18)), "bg-violet-400"],
    ["Offer", analytics.offers, Math.max(5, Math.min(46, analytics.offers * 24)), "bg-emerald-400"],
  ] as const;
  return <div className="space-y-3">{rows.map(([name, value, width, tone]) => <div key={name} className="grid grid-cols-[68px_minmax(0,1fr)_28px] items-center gap-2"><span className="text-[10px] text-muted">{name}</span><div className="h-2 overflow-hidden rounded-full bg-bg"><div className={cn("h-full rounded-full", tone)} style={{ width: `${width}%` }} /></div><span className="text-right text-[10px] font-bold tabular-nums text-fg">{value}</span></div>)}</div>;
}

function CareerMap({ onOpen }: { onOpen: () => void }) {
  const points = [[16, 53, "India"], [28, 38, "Singapore"], [46, 30, "Europe"], [57, 48, "GCC"], [68, 36, "APAC"], [79, 45, "US"], [88, 58, "Canada"]] as const;
  return (
    <button type="button" onClick={onOpen} className="group relative h-[280px] w-full overflow-hidden rounded-2xl border border-border/70 bg-[#06101a] text-left">
      <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(rgba(90,140,180,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(90,140,180,.09) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
      <svg viewBox="0 0 100 70" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <path d="M5 25C15 13 25 17 34 24C43 31 48 14 60 19C70 23 73 17 83 25C90 31 94 28 98 38" fill="none" stroke="rgba(110,150,185,.25)" strokeWidth=".7" />
        <path d="M8 43C19 34 29 44 39 39C49 34 57 43 67 38C78 33 88 43 96 49" fill="none" stroke="rgba(110,150,185,.18)" strokeWidth=".7" />
        <path d="M16 53Q29 38 46 30T79 45T88 58" fill="none" stroke="#22d3ee" strokeWidth=".55" strokeDasharray="2 1.6" opacity=".8" />
      </svg>
      {points.map(([left, top, label], i) => <span key={label} className="absolute" style={{ left: `${left}%`, top: `${top}%` }}><span className={cn("absolute -inset-2 rounded-full blur-[2px]", i % 3 === 0 ? "bg-emerald-400/25" : i % 3 === 1 ? "bg-cyan-400/25" : "bg-violet-400/25")} /><span className={cn("relative block size-2 rounded-full ring-2 ring-slate-950/50", i % 3 === 0 ? "bg-emerald-400" : i % 3 === 1 ? "bg-cyan-400" : "bg-violet-400")} /><span className="absolute left-3 top-0 whitespace-nowrap text-[9px] text-slate-400">{label}</span></span>)}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur"><span className="text-[10px] text-slate-300"><Globe2 className="mr-1 inline size-3 text-cyan-300" />Global opportunity density</span><span className="text-[9px] font-bold text-cyan-300 group-hover:text-white">Explore map →</span></div>
    </button>
  );
}

export function GotchaCareerDashboard({ onOpenJob }: { onOpenJob: (job: Job) => void }) {
  const user = useSessionUser();
  const applications = useGotcha((s) => s.applications);
  const savedJobIds = useGotcha((s) => s.savedJobIds);
  const cvText = useGotcha((s) => s.cvText);
  const careerEvents = useGotcha((s) => s.careerEvents);
  const setView = useGotcha((s) => s.setView);
  const setFilters = useGotcha((s) => s.setFilters);
  const [query, setQuery] = useState("");
  const analytics = applicationAnalytics(applications);
  const huntScore = careerHuntScore(user, applications);
  const mobility = user ? mobilityAssessment(user) : { score: 0, markets: [], factors: [] };
  const matches = useMemo(() => user ? [...JOBS].map((job) => ({ job, score: scoreOpportunity(job, user).overall })).sort((a, b) => b.score - a.score).slice(0, 4) : [], [user]);
  const targetMarket = user?.targetCountries?.[0] ?? "Global";
  const recent = applications.slice(0, 4).map((app) => ({ app, job: JOBS.find((j) => j.id === app.jobId) })).filter((x): x is { app: (typeof applications)[number]; job: Job } => Boolean(x.job));

  function openSearch() { const q = query.trim(); if (q) setFilters({ role: q }); setView("search"); }

  return (
    <div className="min-w-0 space-y-5">
      <section className="relative overflow-hidden rounded-[22px] border border-primary/20 bg-linear-to-br from-card via-card to-primary/5 p-5 md:p-6">
        <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/2 bg-linear-to-r from-transparent via-primary/30 to-transparent" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl"><p className="text-[9px] font-bold uppercase tracking-[.25em] text-primary-3">GOTCHA AI CAREER COMMAND CENTER</p><h1 className="mt-1 text-[28px] font-semibold tracking-tight md:text-[34px]">Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1><p className="mt-2 text-[13px] leading-6 text-muted">Real-time career intelligence to discover better-fit opportunities, understand your market and move the right applications forward.</p></div>
          <button type="button" onClick={() => setView("hunt")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold shadow-[0_0_28px_rgba(34,211,238,.16)]">Launch Hunt Mode <Zap className="size-3.5" /></button>
        </div>
        <div className="relative mt-5 flex overflow-hidden rounded-xl border border-border bg-bg/65 shadow-inner"><div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3"><Search className="size-4 shrink-0 text-primary-3" /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && openSearch()} placeholder="Ask Gotcha to find your next opportunity…" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-subtle" /></div><button type="button" onClick={openSearch} className="m-1 rounded-lg bg-primary px-5 py-2 text-xs font-bold">AI Search <ArrowRight className="ml-1 inline size-3" /></button></div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="AI Match Pool" value={JOBS.length} detail="Live opportunities in your dataset" icon={Radar} tone="text-cyan-300" onClick={() => setView("opportunities")} />
        <Kpi label="Career Hunt Score" value={huntScore || "—"} detail="Profile + activity readiness" icon={Target} tone="text-violet-300" onClick={() => setView("profile")} />
        <Kpi label="Applications" value={analytics.total} detail={`${analytics.followUpsDue} follow-ups currently due`} icon={BriefcaseBusiness} tone="text-amber-300" onClick={() => setView("applications")} />
        <Kpi label="Saved Opportunities" value={savedJobIds.length} detail="Roles you want to revisit" icon={CheckCircle2} tone="text-emerald-300" onClick={() => setView("saved")} />
      </div>

      <section className={cn(card, "p-5") }>
        <SectionTitle eyebrow="AI TALENT ACQUISITION SEARCH" title="Find roles that fit your career, not just your keywords" icon={Sparkles} action="Open AI Job Search" onAction={() => setView("search")} />
        <div className="grid gap-3 lg:grid-cols-[1.5fr_.75fr_.75fr]">
          <button type="button" onClick={() => setView("search")} className="group rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 to-transparent p-4 text-left hover:border-primary/50"><div className="flex items-center justify-between"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/15"><Sparkles className="size-4 text-primary-3" /></span><ChevronRight className="size-4 text-muted group-hover:translate-x-1 group-hover:text-primary-3" /></div><p className="mt-4 text-sm font-semibold">Natural-language talent search</p><p className="mt-1 text-xs leading-5 text-muted">Describe your ideal role, geography, seniority and work model. Gotcha carries your preferences into the existing search engine.</p><span className="mt-4 inline-flex rounded-full border border-border bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-primary-3">{user?.targetRoles?.[0] ?? "Build your target"}</span></button>
          <div className="rounded-2xl border border-border bg-surface p-4"><p className="text-[9px] font-bold uppercase tracking-[.17em] text-muted">Target market</p><p className="mt-2 text-lg font-semibold">{targetMarket}</p><p className="mt-1 text-[10px] text-subtle">Mobility readiness <b className="text-fg">{mobility.score || "—"}/100</b></p><div className="mt-3 h-1.5 rounded-full bg-bg"><div className="h-full rounded-full bg-primary" style={{ width: `${mobility.score || 0}%` }} /></div></div>
          <div className="rounded-2xl border border-border bg-surface p-4"><p className="text-[9px] font-bold uppercase tracking-[.17em] text-muted">Career signals</p><p className="mt-2 text-lg font-semibold">{careerEvents.length}</p><p className="mt-1 text-[10px] leading-4 text-subtle">Events captured across your Gotcha journey.</p><button type="button" onClick={() => setView("saved")} className="mt-3 text-[10px] font-bold text-primary-3">Review saved searches →</button></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <section className={cn(card, "p-5") }><SectionTitle eyebrow="AI CAREER COACH & INSIGHT" title="Your next best career move" icon={Sparkles} action="Open Coach" onAction={() => setView("coach")} /><div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15"><Sparkles className="size-4 text-primary-3" /></span><div><p className="text-sm font-semibold">{user?.targetRoles?.[0] ? `Prioritize ${user.targetRoles[0]} roles` : "Complete your profile to unlock personalized guidance"}</p><p className="mt-1 text-xs leading-5 text-muted">{analytics.total === 0 ? "Start with focused applications rather than volume. Gotcha will use your profile and role fit to guide the hunt." : `You have ${analytics.total} tracked application${analytics.total === 1 ? "" : "s"}. Your response rate is ${analytics.responseRate}%. Use Coach to decide what to improve next.`}</p></div></div><button type="button" onClick={() => setView("coach")} className="mt-4 rounded-lg border border-border bg-surface px-3 py-2 text-[10px] font-bold">Ask AI Career Coach <ArrowRight className="ml-1 inline size-3" /></button></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl bg-surface p-3"><p className="text-[9px] uppercase text-muted">Response</p><p className="mt-1 text-lg font-bold text-amber-300">{analytics.responseRate}%</p></div><div className="rounded-xl bg-surface p-3"><p className="text-[9px] uppercase text-muted">Interview</p><p className="mt-1 text-lg font-bold text-violet-300">{analytics.interviewRate}%</p></div><div className="rounded-xl bg-surface p-3"><p className="text-[9px] uppercase text-muted">Offer</p><p className="mt-1 text-lg font-bold text-emerald-300">{analytics.offerRate}%</p></div></div></section>

        <section className={cn(card, "p-5") }><SectionTitle eyebrow="JOB MATCH & CV ANALYSIS" title="How ready is your profile?" icon={FileSearch} action="Open CV Intelligence" onAction={() => setView("cv")} /><div className="grid grid-cols-[100px_1fr] items-center gap-5"><div className="relative flex size-24 items-center justify-center rounded-full border-[7px] border-primary/20 bg-primary/5"><div className="absolute inset-[-7px] rounded-full border-[7px] border-transparent border-t-primary border-r-primary rotate-45" /><div className="text-center"><p className="text-2xl font-bold">{cvText.trim() ? "92" : "—"}</p><p className="text-[8px] uppercase text-muted">CV score</p></div></div><div><p className="text-sm font-semibold">{cvText.trim() ? "Your CV is ready for intelligent matching" : "Upload your CV to unlock matching"}</p><p className="mt-1 text-xs leading-5 text-muted">Gotcha compares your experience with role requirements and surfaces gaps, strengths and fit signals.</p><button type="button" onClick={() => setView("cv")} className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-primary-3">Analyze CV <ArrowRight className="size-3" /></button></div></div></section>
      </div>

      <section className={cn(card, "p-5") }><SectionTitle eyebrow="GLOBAL CAREER MAP & PREDICTIVE PIPELINE" title="Where your next opportunity is moving" icon={Globe2} action="Open Global Career" onAction={() => setView("network")} /><div className="grid gap-4 lg:grid-cols-[1.65fr_.75fr]"><CareerMap onOpen={() => setView("network")} /><div className="rounded-2xl border border-border bg-surface p-4"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-muted">Predictive pipeline</p><div className="mt-4 space-y-4"><div><div className="flex justify-between text-[10px]"><span className="text-muted">Market demand</span><b>86%</b></div><div className="mt-1 h-1.5 rounded-full bg-bg"><div className="h-full w-[86%] rounded-full bg-cyan-400" /></div></div><div><div className="flex justify-between text-[10px]"><span className="text-muted">Profile fit</span><b>{mobility.score || 74}%</b></div><div className="mt-1 h-1.5 rounded-full bg-bg"><div className="h-full rounded-full bg-violet-400" style={{ width: `${mobility.score || 74}%` }} /></div></div><div><div className="flex justify-between text-[10px]"><span className="text-muted">Momentum</span><b>{Math.min(99, 55 + analytics.total * 7)}%</b></div><div className="mt-1 h-1.5 rounded-full bg-bg"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(99, 55 + analytics.total * 7)}%` }} /></div></div></div><button type="button" onClick={() => setView("market")} className="mt-5 w-full rounded-lg border border-border px-3 py-2 text-[10px] font-bold">View market intelligence →</button></div></div></section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <section className={cn(card, "p-5") }><SectionTitle eyebrow="TOP CURATED OPPORTUNITIES" title="High-fit roles for your next move" icon={Target} action="View all opportunities" onAction={() => setView("opportunities")} /><div className="grid gap-2">{matches.map(({ job, score }) => <button key={job.id} type="button" onClick={() => onOpenJob(job)} className="group grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left hover:border-primary/40"><div className="min-w-0"><p className="truncate text-xs font-semibold">{job.title}</p><p className="mt-0.5 truncate text-[10px] text-muted">{job.company} · {job.location}</p><div className="mt-2 flex items-center gap-2 text-[9px] text-subtle"><MapPin className="size-3" />{job.location}<span>•</span><CircleDollarSign className="size-3" />{job.salary ?? "Competitive"}</div></div><div className="text-right"><span className="text-lg font-bold text-cyan-300">{score}%</span><p className="text-[8px] uppercase tracking-wider text-muted">match</p></div></button>)}</div></section>
        <section className={cn(card, "p-5") }><SectionTitle eyebrow="RECENT ACTIVITY / FUNNEL" title="Your hunt at a glance" icon={BarChart3} action="Open Applications" onAction={() => setView("applications")} /><Funnel analytics={analytics}/><div className="mt-5 border-t border-border pt-4">{recent.length ? recent.map(({ app, job }) => <button key={app.id} type="button" onClick={() => onOpenJob(job)} className="mb-2 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-card"><span className="min-w-0 truncate text-[10px] font-medium">{job.title}</span><span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[8px] text-muted">{app.stage}</span></button>) : <p className="text-[10px] text-subtle">Your recent applications will appear here as you use Gotcha.</p>}</div></section>
      </div>

      <section className={cn(card, "overflow-hidden p-5 md:p-6") }><div className="text-center"><p className="text-[9px] font-bold uppercase tracking-[.24em] text-primary-3">WHY PROFESSIONALS CHOOSE GOTCHA</p><h2 className="mt-1 text-xl font-semibold">One intelligence layer for the entire career hunt.</h2><p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-muted">Search, matching, market intelligence, coaching, CV analysis and application momentum — connected through one career operating system.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[Zap,"AI-Powered Matching","Fit signals beyond keywords"],[BriefcaseBusiness,"Real-time Opportunities","Live opportunity discovery"],[Globe2,"Career Intelligence","Global market visibility"],[UserRound,"End-to-End Support","Coach, CV and applications"]].map(([Icon,title,desc]) => { const I = Icon as typeof Zap; return <button type="button" key={title as string} onClick={() => setView(title === "AI-Powered Matching" ? "search" : title === "Real-time Opportunities" ? "opportunities" : title === "Career Intelligence" ? "market" : "coach")} className="rounded-xl border border-border bg-surface p-4 text-left hover:border-primary/40"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10"><I className="size-4 text-primary-3" /></span><p className="mt-3 text-xs font-semibold">{title as string}</p><p className="mt-1 text-[10px] leading-4 text-muted">{desc as string}</p></button>; })}</div></section>
    </div>
  );
}
