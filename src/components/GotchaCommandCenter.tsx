import { useMemo, useState } from "react";
import { ArrowRight, Brain, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleDollarSign, Globe2, GraduationCap, MessageSquareText, Radar, Search, ShieldCheck, Sparkles, Target, TrendingUp, UserRound, Zap } from "lucide-react";
import { JOBS } from "@/lib/data";
import { useGotcha, useSessionUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const actions = [
  { icon: Search, title: "Discover", text: "Find high-fit global opportunities", view: "search" as const },
  { icon: BriefcaseBusiness, title: "Applications", text: "Manage your active pipeline", view: "applications" as const },
  { icon: Brain, title: "AI Career Agent", text: "Ask what to do next", view: "coach" as const },
  { icon: GraduationCap, title: "Close Skill Gaps", text: "Build the skills your target roles need", view: "learn" as const },
];

export function GotchaCommandCenter() {
  const user = useSessionUser();
  const applications = useGotcha((s) => s.applications);
  const setView = useGotcha((s) => s.setView);
  const [agentOpen, setAgentOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const topJobs = useMemo(() => [...JOBS].sort((a, b) => b.match - a.match).slice(0, 4), []);
  const applied = applications.length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const responseRate = applied ? Math.round(((interviews + offers) / applied) * 100) : 0;
  const profileStrength = Math.min(100, 64 + (user?.skills.length ?? 0) * 5 + (user?.about ? 8 : 0));
  const huntScore = Math.min(100, 55 + Math.min(25, applied * 2) + Math.min(15, interviews * 5) + (offers ? 5 : 0));
  const agentAnswer = question.trim()
    ? `Based on your current career profile, start with the highest-match opportunities, tailor your CV to the role, and prepare for the next interview before adding more applications. Your strongest current signal is a ${topJobs[0]?.match ?? 0}% opportunity match.`
    : "Tell me your target role, country, salary goal or career problem. I will turn it into the next actions inside Gotcha.";

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-3"><Sparkles className="size-3.5" /> Gotcha 2.0</div><p className="mt-0.5 text-xs text-muted">Global Career Operating System</p></div>
          <button onClick={() => setView("profile")} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-card-2"><UserRound className="size-4" /> {user?.name ?? "Professional"}</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1.3fr_.7fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Career Command Center</p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">THE HUNT <span className="bg-linear-to-r from-primary-3 to-primary bg-clip-text text-transparent">ENDS HERE.</span></h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted md:text-base">{user ? `Good to see you, ${user.name.split(" ")[0]}.` : "Your career intelligence starts here."} Gotcha connects opportunities, preparation, applications and career growth in one operating system.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => setView("search")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Find my next move <ArrowRight className="size-4" /></button>
                <button onClick={() => setAgentOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-card-2"><Brain className="size-4" /> Ask Career Agent</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 self-end">
              <Metric label="Hunt Score" value={`${huntScore}`} suffix="/100" icon={Target} />
              <Metric label="Profile Strength" value={`${profileStrength}`} suffix="%" icon={UserRound} />
              <Metric label="Interview Rate" value={`${responseRate}`} suffix="%" icon={TrendingUp} />
              <Metric label="Offers" value={`${offers}`} suffix="" icon={CheckCircle2} />
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((item) => { const Icon = item.icon; return <button key={item.title} onClick={() => setView(item.view)} className="group rounded-xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:bg-card-2"><div className="flex items-start justify-between"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary-3"><Icon className="size-4" /></span><ChevronRight className="size-4 text-subtle transition group-hover:translate-x-1" /></div><p className="mt-4 text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-muted">{item.text}</p></button>; })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-muted">AI Opportunity Engine</p><h2 className="mt-1 text-xl font-semibold">Best opportunities right now</h2></div><button onClick={() => setView("opportunities")} className="text-xs font-semibold text-primary-3">View all</button></div>
            <div className="mt-4 divide-y divide-border">{topJobs.map((job) => <Opportunity key={job.id} job={job} onOpen={() => setView("opportunities")} />)}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2"><Radar className="size-4 text-primary-3" /><p className="text-xs uppercase tracking-[0.16em] text-muted">GOTCHA Signals</p></div><h2 className="mt-1 text-xl font-semibold">Your market pulse</h2>
            <div className="mt-5 space-y-3"><Signal icon={TrendingUp} title="High demand" text="Your strongest matched roles are currently in demand." /><Signal icon={Globe2} title="Global mobility" text="International and remote roles are available in the current dataset." /><Signal icon={CircleDollarSign} title="Compensation" text="Compare salary ranges before prioritising an application." /><Signal icon={ShieldCheck} title="Trust layer" text="Use Gotcha Shield before submitting sensitive information." /></div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <InsightCard icon={Brain} title="Career Digital Twin" value="Active" text="Your profile, skills, goals and application outcomes become one career intelligence layer." onClick={() => setView("profile")} />
          <InsightCard icon={Zap} title="Next Best Action" value={interviews ? "Prepare" : "Discover"} text={interviews ? "You have interviews in your pipeline. Open Career Coach and prepare before applying further." : "Start with your highest-fit opportunity and tailor your application."} onClick={() => setView(interviews ? "coach" : "search")} />
          <InsightCard icon={GraduationCap} title="Skill Advantage" value="Build" text="Turn market gaps into learning actions, then feed completed skills back into your profile." onClick={() => setView("learn")} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em] text-muted">Application Command Center</p><h2 className="mt-1 text-xl font-semibold">Your pipeline</h2></div><button onClick={() => setView("applications")} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-3">Open applications <ArrowRight className="size-3.5" /></button></div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">{[["Applied", applications.filter(a => a.status === "applied").length],["Interview", interviews],["Assessment", applications.filter(a => a.status === "assessment").length],["Offer", offers],["Rejected", applications.filter(a => a.status === "rejected").length]].map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-surface p-4"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div>)}</div>
        </section>
      </main>
      {agentOpen && <AgentDialog question={question} setQuestion={setQuestion} answer={agentAnswer} onClose={() => setAgentOpen(false)} />}
    </div>
  );
}

function Metric({ label, value, suffix, icon: Icon }: { label: string; value: string; suffix: string; icon: typeof Target }) { return <div className="rounded-xl border border-border bg-surface/80 p-4"><Icon className="size-4 text-primary-3" /><p className="mt-4 text-[11px] uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-2xl font-semibold">{value}<span className="text-xs text-muted">{suffix}</span></p></div>; }
function Opportunity({ job, onOpen }: { job: (typeof JOBS)[number]; onOpen: () => void }) { return <button onClick={onOpen} className="flex w-full items-center gap-3 py-3 text-left hover:bg-card-2"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ background: job.logoBg }}>{job.logo}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{job.title}</span><span className="block truncate text-xs text-muted">{job.company} · {job.location} · {job.work}</span></span><span className="text-right"><span className={cn("block text-sm font-bold", job.match >= 90 ? "text-success" : "text-primary-3")}>{job.match}%</span><span className="text-[10px] uppercase text-subtle">match</span></span></button>; }
function Signal({ icon: Icon, title, text }: { icon: typeof TrendingUp; title: string; text: string }) { return <div className="flex gap-3 rounded-lg border border-border p-3"><Icon className="mt-0.5 size-4 shrink-0 text-primary-3" /><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted">{text}</p></div></div>; }
function InsightCard({ icon: Icon, title, value, text, onClick }: { icon: typeof Brain; title: string; value: string; text: string; onClick: () => void }) { return <button onClick={onClick} className="rounded-xl border border-border bg-card p-5 text-left transition hover:bg-card-2"><div className="flex items-center justify-between"><Icon className="size-4 text-primary-3" /><span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{value}</span></div><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-muted">{text}</p></button>; }
function AgentDialog({ question, setQuestion, answer, onClose }: { question: string; setQuestion: (v: string) => void; answer: string; onClose: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.16em] text-primary-3">AI Career Agent</p><h2 className="mt-1 text-xl font-semibold">What should I do next?</h2></div><button onClick={onClose} className="text-sm text-muted">Close</button></div><div className="mt-5 flex gap-2"><MessageSquareText className="mt-3 size-4 text-muted" /><textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. Find me senior fintech roles in Dubai with strong growth potential" className="min-h-28 flex-1 resize-none rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary" /></div><div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted">{answer}</div><div className="mt-4 flex justify-end"><button onClick={onClose} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Continue in Gotcha</button></div></div></div>; }
