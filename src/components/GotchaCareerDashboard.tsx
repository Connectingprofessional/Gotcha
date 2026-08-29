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

function WorldMap({ onOpen }: { onOpen: () => void }) {
  const dots = [[18,58],[26,43],[35,36],[46,43],[53,31],[59,51],[69,40],[78,46],[84,61],[91,55]];
  return <button onClick={onOpen} className="relative h-[204px] w-full overflow-hidden rounded-md border border-[#0b4265] bg-[#061a2c] text-left">
    <div className="absolute inset-0 opacity-25" style={{backgroundImage:"linear-gradient(rgba(80,160,210,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(80,160,210,.11) 1px,transparent 1px)",backgroundSize:"26px 26px"}} />
    <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full opacity-80" preserveAspectRatio="none" aria-hidden>
      <path d="M4 18c7-6 13-5 20-2 7 3 12-2 18 1 7 3 11-5 18-2 7 3 13 1 19 5 7 4 12 3 17 9l-2 16c-8 3-12 0-19 3-8 3-14-1-20 1-8 2-13-2-20 1-8 3-13-2-20 1L5 39z" fill="#123d59" stroke="#205d80" strokeWidth=".5" />
      <path d="M10 45Q29 20 47 38T85 30" fill="none" stroke="#1aa5d8" strokeWidth=".5" strokeDasharray="2 1.5" />
    </svg>
    {dots.map(([x,y],i)=><span key={`${x}-${y}`} className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_12px_currentColor]" style={{left:`${x}%`,top:`${y}%`,color:i%3===0?"#ff174f":i%3===1?"#00e0b5":"#8db3d9",background:i%3===0?"#ff174f":i%3===1?"#00e0b5":"#8db3d9"}} />)}
    <div className="absolute right-3 top-3 flex gap-3 text-[9px] text-slate-300"><span><i className="mr-1 inline-block size-2 rounded-full bg-[#ff174f]"/>Target</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#00e0b5]"/>Applied</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#8db3d9]"/>Shortlisted</span></div>
    <div className="absolute bottom-2 left-3 flex flex-col gap-1 text-[9px] text-slate-300"><span><i className="mr-1 inline-block size-2 rounded-full bg-[#ff174f]"/>Target</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#00e0b5]"/>Applied</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#8db3d9]"/>Shortlisted</span></div>
  </button>;
}

function MatchRing({ score }: { score: number }) {
  return <div className="relative size-[128px] shrink-0"><div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(#7c3cff ${score*3.6}deg,#18253a 0deg)`}}/><div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[#04182b]"><strong className="text-[25px] text-violet-400">{score}%</strong><span className="text-[10px] text-cyan-300">Great Match</span></div></div>;
}

export function GotchaCareerDashboard({ onOpenJob }: { onOpenJob: (job: Job) => void }) {
  const user = useSessionUser();
  const applications = useGotcha(s => s.applications);
  const savedJobIds = useGotcha(s => s.savedJobIds);
  const careerEvents = useGotcha(s => s.careerEvents);
  const setView = useGotcha(s => s.setView);
  const setFilters = useGotcha(s => s.setFilters);
  const [query, setQuery] = useState("");
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
      <section className={cn(panel,"p-3.5")}><PanelTitle title="Recent Activity" action="View all" onAction={()=>setView("applications")}/><div className="grid grid-cols-5 items-end gap-1 border-b border-[#17445f] pb-3">{[["Applied",analytics.total||42,"bg-cyan-400"],["In Assessment",13,"bg-cyan-400"],["Interview",analytics.interviews||13,"bg-orange-500"],["Offer",analytics.offers||3,"bg-rose-500"],["Hired",1,"bg-violet-500"]].map(([x,v,c])=><div key={String(x)} className="text-center"><div className={cn("mx-auto w-9 rounded-t-[18px]",c)} style={{height:`${Math.max(30,Number(v)*2)}px`}}/><b className="text-[11px]">{v}</b><p className="text-[8px] text-slate-400">{x}</p></div>)}</div><div className="mt-2 grid grid-cols-2 gap-1.5">{(applications.slice(0,4).length?applications.slice(0,4):[{id:"demo1",jobId:JOBS[0].id,status:"interview"},{id:"demo2",jobId:JOBS[1].id,status:"applied"}]).map((app:any,i)=>{const job=JOBS.find(j=>j.id===app.jobId)??JOBS[i];return <button key={app.id} onClick={()=>setView("applications")} className="flex items-center gap-2 rounded-md border border-[#0d3b5a] bg-[#061b2e] p-2 text-left"><span className="flex size-7 items-center justify-center rounded bg-[#176092]"><Users className="size-4"/></span><span className="min-w-0 flex-1"><b className="block truncate text-[9px]">{app.status==='interview'?"AI Match Interview":"New Match Match"}</b><small className="block truncate text-[8px] text-slate-400">{job.title}</small></span><small className="text-[8px] text-slate-400">{i+1}m ago</small></button>})}</div></section>
    </div>

    <section className={cn(panel,"mt-3 p-3.5")}><h2 className="mb-3 text-[14px] font-semibold text-violet-300">Why Professionals Choose GOTCHA</h2><div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">{[[Sparkles,"AI-Powered Matching","Smarter algorithms that match you to perfect opportunities"],[BriefcaseBusiness,"Real-time Opportunities","Live job data from top companies worldwide"],[BarChart3,"Career Intelligence","Market insights to make smarter career moves"],[Users,"AI-Powered Coaching","Personalized guidance & skill development"],[ShieldCheck,"End-to-End Support","AI, Coach, CV Intelligence & Application Tracking"]].map(([I,t,d])=><button key={String(t)} onClick={()=>setView(t==="Career Intelligence"?"market":t==="AI-Powered Coaching"?"coach":t==="End-to-End Support"?"applications":"search")} className="flex min-h-[68px] items-center gap-3 rounded-lg border border-[#0d3e5d] bg-[#061c30] px-3 text-left hover:border-violet-500"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#142d49]"><I className="size-4 text-slate-200"/></span><span><b className="block text-[11px] text-slate-200">{t}</b><small className="mt-0.5 block text-[9px] leading-3.5 text-slate-400">{d}</small></span></button>)}</div></section>
  </div>;
}
