import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Globe2, MapPin, Radar, TrendingUp, Zap } from "lucide-react";
import { JOBS } from "@/lib/data";
import { useGotcha, useSessionUser } from "@/lib/store";
import { scoreOpportunity } from "@/lib/careerIntelligence";
import { cn } from "@/lib/utils";

const stages = [
  { n: 1, title: "Foundation", items: "Vision · Architecture · Brand · Navigation" },
  { n: 2, title: "Identity + Opportunity", items: "Profile · Preferences · CV · Discovery · Search · AI Match · Quality" },
  { n: 3, title: "Career Command Center", items: "Dashboard · Roadmap · Lifecycle · Ageing" },
  { n: 4, title: "Application + AI", items: "Applications · Follow-ups · Interviews · Mock Interview · Agent · Hunt Mode · Score · Digital Twin" },
  { n: 5, title: "Global Intelligence", items: "Company · Market · Career Map · Mobility" },
  { n: 6, title: "Global Access + Growth", items: "Language · Currency · Network · Learning" },
  { n: 7, title: "Analytics + Production", items: "Analytics · Gotcha Shield · Security · QA · Deployment" },
];

const pipeline = [
  "Search", "Shortlisted", "Screened", "Applied", "Response", "Interview", "Stage 1", "Stage 2", "Stage 3", "Final Discussion", "HR Discussion", "Offer", "Appointment"
];

export function GotchaRoadmap() {
  const user = useSessionUser();
  const applications = useGotcha((s) => s.applications);
  const [activeStage, setActiveStage] = useState(3);
  const scored = useMemo(() => user ? JOBS.map(job => ({ job, score: scoreOpportunity(job, user).overall })).sort((a,b) => b.score-a.score) : [], [user]);
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    applications.forEach((a: any) => { const key = String(a.stage ?? a.status ?? "Applied"); result[key] = (result[key] ?? 0) + 1; });
    return result;
  }, [applications]);
  const activePipeline = Math.min(pipeline.length - 1, Math.max(0, applications.length ? 3 : 0));

  return <section className="rounded-2xl border border-border bg-card p-5 md:p-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-3"><Radar className="size-4" /> 32-Point Product Roadmap</div><h2 className="mt-2 text-2xl font-semibold md:text-3xl">The Career Road, in motion.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Seven connected build stages power one candidate journey. Every opportunity moves through the same living pipeline, with ageing, location, company, source and next action visible.</p></div>
      <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3"><p className="text-[10px] uppercase tracking-wider text-muted">Build status</p><p className="mt-1 text-lg font-semibold">Stage {activeStage} focus</p></div>
    </div>

    <div className="mt-6 grid gap-2 md:grid-cols-7">{stages.map(s => <button key={s.n} onClick={() => setActiveStage(s.n)} className={cn("rounded-xl border p-3 text-left transition", activeStage === s.n ? "border-primary/50 bg-primary/10" : "border-border bg-surface hover:bg-card-2")}><div className="flex items-center justify-between"><span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary-3">{s.n}</span>{s.n < 3 ? <CheckCircle2 className="size-4 text-success" /> : s.n === 3 ? <Zap className="size-4 text-primary-3" /> : null}</div><p className="mt-3 text-sm font-semibold">{s.title}</p><p className="mt-1 line-clamp-3 text-[10px] leading-4 text-muted">{s.items}</p></button>)}</div>

    <div className="mt-6 rounded-xl border border-border bg-surface p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em] text-muted">Live candidate pipeline</p><p className="mt-1 text-sm font-semibold">Every opportunity has a place on the road</p></div><div className="flex items-center gap-2 text-xs text-muted"><Clock3 className="size-3.5" /> Ageing tracked at every stage</div></div>
      <div className="mt-6 overflow-x-auto pb-3"><div className="min-w-[1150px] px-2"><div className="relative h-24"><div className="absolute left-5 right-5 top-9 h-1 rounded-full bg-border" /><div className="absolute left-5 top-9 h-1 rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(0, activePipeline / (pipeline.length - 1)) * 100}%` }} />
        {pipeline.map((stage, i) => { const current = i === activePipeline; const passed = i <= activePipeline; return <div key={stage} className="absolute top-0 flex w-20 -translate-x-1/2 flex-col items-center text-center" style={{ left: `${5 + (90 * i / (pipeline.length - 1))}%` }}><div className={cn("relative z-10 mt-1 flex size-8 items-center justify-center rounded-full border-2 bg-card transition-all", passed ? "border-primary text-primary-3" : "border-border text-subtle", current && "scale-125 shadow-[0_0_0_7px_rgba(255,255,255,0.04)]")}><span className="text-[9px] font-bold">{i + 1}</span></div><span className={cn("mt-3 text-[10px] font-semibold", current ? "text-fg" : "text-muted")}>{stage}</span>{current && <span className="mt-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-primary-3"><span className="size-1.5 animate-pulse rounded-full bg-primary" /> Current</span>}</div> })}
      </div></div></div>
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <DataCard icon={BriefcaseBusiness} label="Tracked opportunities" value={String(applications.length)} detail="Live application records" />
      <DataCard icon={Clock3} label="Ageing watch" value={String(Object.values(counts).reduce((a: number,b: any) => a + Number(b), 0))} detail="Stage-aware pipeline" />
      <DataCard icon={Globe2} label="Global targeting" value={String(user?.targetCountries?.length ?? 0)} detail="Target countries" />
      <DataCard icon={TrendingUp} label="Top match" value={scored[0] ? `${scored[0].score}%` : "—"} detail={scored[0] ? scored[0].job.company : "Complete profile"} />
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-xl border border-border bg-bg p-4"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-muted">Opportunity movement</p><h3 className="mt-1 font-semibold">What Gotcha is watching</h3></div><ArrowRight className="size-4 text-primary-3" /></div><div className="mt-4 space-y-2">{scored.slice(0, 4).map(({job, score}) => <div key={job.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"><span className="flex size-9 items-center justify-center rounded-lg text-xs font-bold" style={{background: job.logoBg}}>{job.logo}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{job.title}</p><p className="truncate text-xs text-muted">{job.company} · {job.location}</p></div><span className="text-xs font-bold text-primary-3">{score}%</span></div>)}</div></div>
      <div className="rounded-xl border border-border bg-bg p-4"><p className="text-xs uppercase tracking-wider text-muted">Candidate view</p><h3 className="mt-1 font-semibold">Next-best-action layer</h3><div className="mt-4 space-y-3"><MiniSignal icon={MapPin} title="Location" text={user?.location ?? "Add location to profile"} /><MiniSignal icon={Zap} title="Current focus" text={stages[activeStage - 1].title} /><MiniSignal icon={Clock3} title="Pipeline status" text={applications.length ? `${applications.length} opportunity records connected` : "Start tracking opportunities"} /></div></div>
    </div>
  </section>;
}

function DataCard({ icon: Icon, label, value, detail }: { icon: typeof BriefcaseBusiness; label: string; value: string; detail: string }) { return <div className="rounded-xl border border-border bg-surface p-4"><Icon className="size-4 text-primary-3" /><p className="mt-3 text-[10px] uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-[10px] text-muted">{detail}</p></div>; }
function MiniSignal({ icon: Icon, title, text }: { icon: typeof MapPin; title: string; text: string }) { return <div className="flex items-center gap-3 rounded-lg border border-border p-3"><Icon className="size-4 shrink-0 text-primary-3" /><div><p className="text-xs font-semibold">{title}</p><p className="mt-0.5 text-[11px] text-muted">{text}</p></div></div>; }
