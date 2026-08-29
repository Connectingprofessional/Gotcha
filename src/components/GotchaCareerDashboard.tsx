import { useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, BriefcaseBusiness, CheckCircle2, ChevronRight, Clock3,
  FileText, Globe2, Search, ShieldCheck, Sparkles, Target, Users, Zap,
} from "lucide-react";
import { JOBS, type Job } from "@/lib/data";
import { applicationAnalytics, careerHuntScore, mobilityAssessment, scoreOpportunity } from "@/lib/careerIntelligence";
import { useGotcha, useSessionUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const panel = "rounded-[10px] border border-[#0c4670] bg-[#03182a]/95 shadow-[0_8px_28px_rgba(0,0,0,.28)]";

function PanelTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-[16px] font-semibold leading-none text-slate-100">{title}</h2>{action && onAction ? <button onClick={onAction} className="text-[11px] font-semibold text-violet-300 hover:text-white">{action}</button> : null}</div>;
}

function Kpi({ icon: Icon, value, label, note, tone, onClick }: { icon: typeof Search; value: string | number; label: string; note: string; tone: string; onClick: () => void }) {
  return <button onClick={onClick} className="group flex min-w-0 items-center gap-3 rounded-[10px] border border-[#0b4770] bg-[#041b30] px-3 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.02)] transition hover:border-violet-500/70 hover:bg-[#06213a]">
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg text-white shadow-lg", tone)}><Icon className="size-5" /></span>
    <span className="min-w-0"><span className="block text-[27px] font-bold leading-7 tracking-tight text-slate-100 tabular-nums">{value}</span><span className="mt-0.5 block truncate text-[11px] font-medium text-slate-200">{label}</span><span className="block text-[10px] text-slate-400">{note}</span></span>
  </button>;
}

const MAP_POINTS = [
  { name: "India", count: 37, x: 54, y: 59, tone: "#00e0b5" },
  { name: "Singapore", count: 12, x: 64, y: 70, tone: "#00e0b5" },
  { name: "Europe", count: 28, x: 47, y: 34, tone: "#ff174f" },
  { name: "UAE / GCC", count: 19, x: 49, y: 49, tone: "#ff174f" },
  { name: "USA", count: 24, x: 25, y: 43, tone: "#8db3d9" },
  { name: "Canada", count: 8, x: 23, y: 29, tone: "#8db3d9" },
  { name: "Australia", count: 9, x: 79, y: 76, tone: "#8db3d9" },
] as const;

function WorldMap({ onOpen }: { onOpen: () => void }) {
  return <button onClick={onOpen} className="relative h-[204px] w-full overflow-hidden rounded-md border border-[#0b4265] bg-[#061a2c] text-left">
    <div className="absolute inset-0 opacity-25" style={{backgroundImage:"linear-gradient(rgba(80,160,210,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(80,160,210,.11) 1px,transparent 1px)",backgroundSize:"26px 26px"}} />
    <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full opacity-80" preserveAspectRatio="none" aria-hidden>
      <path d="M4 18c7-6 13-5 20-2 7 3 12-2 18 1 7 3 11-5 18-2 7 3 13 1 19 5 7 4 12 3 17 9l-2 16c-8 3-12 0-19 3-8 3-14-1-20 1-8 2-13-2-20 1-8 3-13-2-20 1L5 39z" fill="#123d59" stroke="#205d80" strokeWidth=".5" />
      <path d="M10 45Q29 20 47 38T85 30" fill="none" stroke="#1aa5d8" strokeWidth=".5" strokeDasharray="2 1.5" />
    </svg>
    {MAP_POINTS.map((point) => <span key={point.name} className="absolute" style={{left:`${point.x}%`,top:`${point.y}%`}}><span className="absolute -inset-2 rounded-full blur-[2px]" style={{background:point.tone,opacity:.25}}/><span className="relative block size-2.5 rounded-full ring-2 ring-slate-950/60" style={{background:point.tone,boxShadow:`0 0 10px ${point.tone}`}}/><span className="absolute bottom-3 left-2 whitespace-nowrap rounded bg-[#03182a]/90 px-1.5 py-0.5 text-[8px] font-semibold text-slate-200 shadow-lg"><b>{point.name}</b> <em className="not-italic" style={{color:point.tone}}>{point.count}</em></span></span>)}
    <div className="absolute left-3 top-3 rounded-md border border-cyan-900/70 bg-[#03182a]/85 px-2 py-1 text-[9px] font-semibold text-cyan-200">165+ active markets</div>
    <div className="absolute right-3 top-3 flex gap-2 text-[8px] text-slate-300"><span><i className="mr-1 inline-block size-2 rounded-full bg-[#ff174f]"/>Target</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#00e0b5]"/>Applied</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#8db3d9]"/>Shortlisted</span></div>
    <div className="absolute bottom-2 right-3 rounded-full border border-cyan-800 bg-[#03182a]/90 px-2 py-1 text-[8px] font-semibold text-cyan-200">Explore map →</div>
  </button>;
}

function MatchRing({ score }: { score: number }) {
  return <div className="relative size-[128px] shrink-0"><div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(#7c3cff ${score*3.6}deg,#18253a 0deg)`}}/><div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[#04182b]"><strong className="text-[25px] text-violet-400">{score}%</strong><span className="text-[10px] text-cyan-300">Great Match</span></div></div>;
}

const FUNNEL_STAGES = [
  ["Applied", 42, "bg-cyan-400"],
  ["Assessment", 13, "bg-blue-500"],
  ["Interview", 13, "bg-orange-500"],
  ["Offer", 3, "bg-rose-500"],
  ["Hired", 1, "bg-violet-500"],
] as const;

function FunnelShape({ analytics, onOpen }: { analytics: ReturnType<typeof applicationAnalytics>; onOpen: () => void }) {
  const values = [analytics.total || 42, 13, analytics.interviews || 13, analytics.offers || 3, 1];
  const max = Math.max(...values, 1);
  return <button type="button" onClick={onOpen} className="group relative w-full overflow-hidden rounded-lg border border-[#0d3b5a] bg-[#061b2e] p-2.5 text-left transition hover:border-violet-500/70">
    <div className="mb-2 flex items-center justify-between"><span className="text-[9px] text-slate-400">Click funnel to expand stage detail</span><ChevronRight className="size-3 text-violet-300 transition group-hover:translate-x-1"/></div>
    <div className="flex min-h-[148px] flex-col items-center justify-center gap-0.5">
      {FUNNEL_STAGES.map(([label,,tone], i) => { const value=values[i]; const width=36 + (value/max)*58; return <div key={label} className="relative flex h-[25px] items-center justify-center" style={{width:`${width}%`}}><div className={cn("absolute inset-0 rounded-[5px] opacity-90",tone)} /><span className="relative z-10 text-[9px] font-bold text-slate-950">{label} · {value}</span></div>; })}
    </div>
  </button>;
}

function FunnelDetail({ analytics, onClose }: { analytics: ReturnType<typeof applicationAnalytics>; onClose: () => void }) {
  const values = [analytics.total || 42, 13, analytics.interviews || 13, analytics.offers || 3, 1];
  const max = Math.max(...values, 1);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}><div className="w-full max-w-[760px] rounded-2xl border border-cyan-800 bg-[#03182a] p-5 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-bold">Application Funnel</h3><p className="mt-1 text-[11px] text-slate-400">Each stage is scaled to its current volume.</p></div><button type="button" onClick={onClose} className="rounded-full border border-[#17445f] px-3 py-1 text-xs text-slate-300">Close</button></div><div className="space-y-3">{FUNNEL_STAGES.map(([label,,tone],i)=>{const value=values[i]; const width=Math.max(12,(value/max)*100); return <div key={label} className="grid grid-cols-[90px_1fr_42px] items-center gap-3"><span className="text-[10px] font-semibold text-slate-300">{label}</span><div className="h-10 rounded-md bg-[#07182a] p-1"><div className={cn("flex h-full items-center rounded",tone)} style={{width:`${width}%`}}><span className="pl-3 text-[10px] font-bold text-slate-950">{value}</span></div></div><span className="text-right text-[10px] font-bold text-slate-200">{Math.round(value/max*100)}%</span></div>})}</div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg border border-[#123e5c] bg-[#061b2e] p-2"><b className="block text-lg">{values[0]}</b><span className="text-[9px] text-slate-400">Applications</span></div><div className="rounded-lg border border-[#123e5c] bg-[#061b2e] p-2"><b className="block text-lg">{values[2]}</b><span className="text-[9px] text-slate-400">Interviews</span></div><div className="rounded-lg border border-[#123e5c] bg-[#061b2e] p-2"><b className="block text-lg">{values[3]}</b><span className="text-[9px] text-slate-400">Offers</span></div></div></div></div>;
}

export function GotchaCareerDashboard({ onOpenJob }: { onOpenJob: (job: Job) => void }) {
  const user = useSessionUser();
  const applications = useGotcha(s => s.applications);
  const careerEvents = useGotcha(s => s.careerEvents);
  const setView = useGotcha(s => s.setView);
  const setFilters = useGotcha(s => s.setFilters);
  const [query, setQuery] = useState("");
  const [funnelOpen, setFunnelOpen] = useState(false);
  const analytics = applicationAnalytics(applications);
  const huntScore = careerHuntScore(user, applications);
  const mobility = user ? mobilityAssessment(user) : {score:0,markets:[],factors:[]};
  const matches = useMemo(() => user ? [...JOBS].map(job => ({job,score:scoreOpportunity(job,user).overall})).sort((a,b)=>b.score-a.score).slice(0,4) : [], [user]);
  const bestScore = matches[0]?.score ?? 87;
  const targetRole = user?.targetRoles?.[0] ?? "VP Talent Acquisition";
  const targetMarket = user?.targetCountries?.[0] ?? "India";
  const openSearch = () => { const q=query.trim(); if(q) setFilters({role:q}); setView("search"); };

  return <div className="min-w-0 bg-[#020d18] text-slate-100">
    <div className="mb-3 flex items-start justify-between gap-4">
      <div><h1 className="text-[26px] font-bold tracking-tight">Welcome back, <span className="text-violet-400">{user?.name?.split(" ")[0] ?? "Neeraj"}!</span></h1><p className="text-[13px] text-slate-300">Here's your career overview and latest updates.</p></div>
      <div className="flex items-center gap-3"><button onClick={()=>setView("hunt")} className="rounded-full border border-cyan-700/80 bg-[#062139] px-4 py-2 text-[12px] font-semibold shadow-[0_0_18px_rgba(0,180,255,.12)]"><span className="mr-2 inline-block size-2 rounded-full bg-emerald-400"/>Career OS: 7 Stages</button><button onClick={()=>setView("profile")} className="flex size-11 items-center justify-center rounded-full border border-cyan-800 bg-[#06182b]"><Zap className="size-4 text-slate-300"/></button></div>
    </div>

    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-8">
      <Kpi icon={BriefcaseBusiness} value="2,977" label="Jobs Found" note="+34% today" tone="bg-violet-600" onClick={()=>setView("search")} />
      <Kpi icon={Sparkles} value="377" label="AI Curated Opps" note="+88 today" tone="bg-blue-600" onClick={()=>setView("opportunities")} />
      <Kpi icon={CheckCircle2} value="111" label="High Match Profiles" note=">80% ATS" tone="bg-emerald-500" onClick={()=>setView("cv")} />
      <Kpi icon={FileText} value="37" label="Active Applications" note="This Month" tone="bg-orange-500" onClick={()=>setView("applications")} />
      <Kpi icon={Users} value="13" label="Interviews" note="In Progress" tone="bg-violet-600" onClick={()=>setView("applications")} />
      <Kpi icon={CheckCircle2} value="3" label="Verified Offers" note="In Hand" tone="bg-cyan-500" onClick={()=>setView("applications")} />
      <Kpi icon={Globe2} value="165+" label="Global Talent Map" note="Locations" tone="bg-blue-600" onClick={()=>setView("global")} />
      <Kpi icon={Clock3} value="2.1" label="Avg. Response" note="Time" tone="bg-violet-600" onClick={()=>setView("applications")} />
    </div>

    <div className="mt-3 grid gap-3 xl:grid-cols-[1.48fr_.88fr_1fr]">
      <section className={cn(panel,"p-3.5")}><PanelTitle title="AI Talent Acquisition Search (AI-Powered)" /><p className="text-[12px] leading-5 text-slate-300">Find global VP/Director Talent Acquisition roles in Europe, Middle East and Singapore, remote/hybrid, $150K+, posted last 7d</p><div className="mt-2 flex items-center gap-2"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#164b6d] bg-[#061b30] px-3 py-2"><Search className="size-4 text-slate-300"/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&openSearch()} placeholder="Search with AI" className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-slate-500"/></div><button onClick={openSearch} className="rounded-md bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-[11px] font-bold">Search with AI</button></div><div className="mt-2 flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[10px]"><span className="font-semibold text-slate-300">Popular Searches:</span>{["VP TA Global","Director Talent Acquisition","TA Leadership"].map(x=><button key={x} onClick={()=>{setFilters({role:x});setView("search")}} className="rounded-full bg-[#132f49] px-3 py-1 text-slate-300">{x}</button>)}<button onClick={()=>setView("saved")} className="text-violet-400">More</button></div><div className="mt-2 grid grid-cols-5 gap-1.5">{[["Job Boards","184 Sources",FileText],["Company Sites","12,460 Firms",BriefcaseBusiness],["Agencies","2,340 Firms",Target],["Executive Search","420 Firms",Users],["Job Apps","126 Apps",FileText]].map(([a,b,I])=><button key={String(a)} onClick={()=>setView("search")} className="rounded-lg border border-[#183f5c] bg-[#0a2036] p-2 text-left hover:border-violet-500"><I className="size-4 text-violet-400"/><p className="mt-1 text-[10px] font-medium">{a}</p><p className="text-[10px] text-slate-400">{b}</p></button>)}</div></section>
      <section className={cn(panel,"p-3.5")}><PanelTitle title="AI Career Coach & Insight"/><p className="text-[12px] leading-5 text-slate-300">GOTCHA is tailored for Leadership TA. Your profile is in high demand for Director/VP level roles at FinTech and Tech companies across EMEA & APAC.</p><p className="mt-3 text-[11px] font-semibold">Recommended Skills:</p><div className="mt-1.5 flex flex-wrap gap-1.5">{["People Analytics","Talent Intelligence","HR Analytics","HR Analytics","AI Recruitment"].map((x,i)=><span key={`${x}-${i}`} className="rounded-full bg-[#4c3610] px-2.5 py-1 text-[10px] text-amber-200">{x}</span>)}</div><button onClick={()=>setView("coach")} className="mt-3 text-[10px] font-semibold text-violet-300">Open AI Career Coach <ArrowRight className="ml-1 inline size-3"/></button></section>
      <section className={cn(panel,"p-3.5")}><PanelTitle title="Global Career Map & Predictive Pipeline"/><WorldMap onOpen={()=>setView("global")}/></section>
    </div>

    <div className="mt-3 grid gap-3 xl:grid-cols-[1.08fr_1.02fr_1.5fr]">
      <section className={cn(panel,"p-3.5")}><PanelTitle title="Top Curated Opportunities" action="View all" onAction={()=>setView("opportunities")}/><div className="grid grid-cols-[1.55fr_.55fr_.9fr_58px] gap-2 border-b border-[#124260] pb-1 text-[9px] text-slate-400"><span>Job</span><span>Match</span><span>Location</span><span/></div>{matches.map(({job,score})=><button key={job.id} onClick={()=>onOpenJob(job)} className="grid w-full grid-cols-[1.55fr_.55fr_.9fr_58px] items-center gap-2 border-b border-[#0c3048] py-2 text-left hover:bg-[#08243a]"><span className="flex min-w-0 items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded bg-[#173b56] text-[11px] font-bold">{job.logo}</span><span className="min-w-0"><b className="block truncate text-[10px] text-slate-200">{job.title}</b><small className="block truncate text-[9px] text-slate-400">{job.company}</small></span></span><span className="text-[10px] font-bold text-emerald-400">{score}%<small className="block font-normal">Match</small></span><span className="text-[9px] text-slate-300">{job.location}<small className="block text-emerald-400">Match Profile</small></span><span className="rounded-md bg-gradient-to-r from-violet-600 to-purple-500 px-2 py-1.5 text-center text-[10px] font-bold">Apply</span></button>)}</section>
      <section className={cn(panel,"p-3.5")}><PanelTitle title="Job Match & CV Analysis"/><div className="flex items-center gap-4"><MatchRing score={bestScore}/><div className="space-y-2 text-[11px]">{[["Skills Match",82],["Experience Match",94],["Leadership Match",96],["Industry Match",78],["Keywords Match",81]].map(([x,v],i)=><div key={String(x)}><span className={cn("mr-2 inline-block size-2 rounded-full",i<3?"bg-violet-400":"bg-cyan-300")}/>{x}<b className="float-right ml-5">{v}</b></div>)}</div></div><button onClick={()=>setView("cv")} className="mt-4 ml-auto block text-[10px] font-semibold text-violet-300">View Full Analysis <ArrowRight className="ml-1 inline size-3"/></button></section>
      <section className={cn(panel,"p-3.5")}><PanelTitle title="Recent Activity" action="View all" onAction={()=>setView("applications")}/><FunnelShape analytics={analytics} onOpen={()=>setFunnelOpen(true)}/><div className="mt-2 grid grid-cols-2 gap-1.5">{(applications.slice(0,4).length?applications.slice(0,4):[{id:"demo1",jobId:JOBS[0].id,status:"interview"},{id:"demo2",jobId:JOBS[1].id,status:"applied"}]).map((app:any,i)=>{const job=JOBS.find(j=>j.id===app.jobId)??JOBS[i];return <button key={app.id} onClick={()=>setView("applications")} className="flex items-center gap-2 rounded-md border border-[#0d3b5a] bg-[#061b2e] p-2 text-left"><span className="flex size-7 items-center justify-center rounded bg-[#176092]"><Users className="size-4"/></span><span className="min-w-0 flex-1"><b className="block truncate text-[9px]">{app.status==='interview'?"AI Match Interview":"New Match Match"}</b><small className="block truncate text-[8px] text-slate-400">{job.title}</small></span><small className="text-[8px] text-slate-400">{i+1}m ago</small></button>})}</div></section>
    </div>

    <section className={cn(panel,"mt-3 p-3.5")}><h2 className="mb-3 text-[14px] font-semibold text-violet-300">Why Professionals Choose GOTCHA</h2><div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">{[[Sparkles,"AI-Powered Matching","Smarter algorithms that match you to perfect opportunities"],[BriefcaseBusiness,"Real-time Opportunities","Live job data from top companies worldwide"],[BarChart3,"Career Intelligence","Market insights to make smarter career moves"],[Users,"AI-Powered Coaching","Personalized guidance & skill development"],[ShieldCheck,"End-to-End Support","AI, Coach, CV Intelligence & Application Tracking"]].map(([I,t,d])=><button key={String(t)} onClick={()=>setView(t==="Career Intelligence"?"market":t==="AI-Powered Coaching"?"coach":t==="End-to-End Support"?"applications":"search")} className="flex min-h-[68px] items-center gap-3 rounded-lg border border-[#0d3e5d] bg-[#061c30] px-3 text-left hover:border-violet-500"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#142d49]"><I className="size-4 text-slate-200"/></span><span><b className="block text-[11px] text-slate-200">{t}</b><small className="mt-0.5 block text-[9px] leading-3.5 text-slate-400">{d}</small></span></button>)}</div></section>
    {funnelOpen && <FunnelDetail analytics={analytics} onClose={()=>setFunnelOpen(false)} />}
  </div>;
}
