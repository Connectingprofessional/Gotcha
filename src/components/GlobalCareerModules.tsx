import { useState } from "react";
import { BarChart3, Building2, Globe2, Handshake, LockKeyhole, MessageCircleMore, ShieldCheck, UsersRound } from "lucide-react";
import { JOBS } from "@/lib/data";
import { companyIntelligence, mobilityAssessment } from "@/lib/careerIntelligence";
import { useGotcha, useSessionUser } from "@/lib/store";

export function GlobalCareerModules() {
  const user = useSessionUser();
  const referrals = useGotcha(s => s.referrals);
  const mentorRequests = useGotcha(s => s.mentorRequests);
  const circles = useGotcha(s => s.careerCircles);
  const requestMentor = useGotcha(s => s.requestMentor);
  const updateProfile = useGotcha(s => s.updateProfile);
  const [goal, setGoal] = useState("");
  const mobility = user ? mobilityAssessment(user) : { score: 0, markets: [] as string[], factors: [] as string[] };
  const companies = [...new Set(JOBS.map(j => j.company))].slice(0, 4).map(company => companyIntelligence(JOBS, company));
  return <section className="space-y-5">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <ModuleCard icon={Globe2} title="Global Mobility" value={`${mobility.score}%`} text={`Best markets: ${mobility.markets.slice(0, 3).join(" · ")}`} />
      <ModuleCard icon={Building2} title="Company Intelligence" value={`${companies.length} tracked`} text="Hiring signal, locations, roles and skills demand." />
      <ModuleCard icon={ShieldCheck} title="Gotcha Shield" value="Active" text="Risk assessment is applied before opportunity prioritisation." />
      <ModuleCard icon={BarChart3} title="Career Analytics" value="Live" text="Application, interview and offer performance is calculated from your pipeline." />
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Handshake className="size-4 text-primary-3" /><h2 className="text-lg font-semibold">Referral Network</h2></div><p className="mt-1 text-xs text-muted">Request or build trusted professional introductions around target opportunities.</p><div className="mt-4 rounded-lg border border-border bg-surface p-3"><p className="text-xs text-muted">Active referral requests</p><p className="mt-1 text-2xl font-semibold">{referrals.length}</p></div></div>
      <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><UsersRound className="size-4 text-primary-3" /><h2 className="text-lg font-semibold">Career Circles & Mentoring</h2></div><p className="mt-1 text-xs text-muted">Focused communities and mentorship for practical career outcomes.</p><div className="mt-3 grid grid-cols-3 gap-2">{circles.map(c => <div key={c.id} className="rounded-lg border border-border p-3"><p className="text-xs font-semibold">{c.name}</p><p className="mt-1 text-[10px] text-muted">{c.members} members</p></div>)}</div><div className="mt-4 flex gap-2"><input value={goal} onChange={e => setGoal(e.target.value)} placeholder="What do you want mentorship on?" className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2 text-xs" /><button onClick={() => { if (goal.trim()) { requestMentor(goal.trim()); setGoal(""); } }} className="rounded-md bg-primary px-3 py-2 text-xs font-semibold">Request</button></div><p className="mt-2 text-[10px] text-muted">Open requests: {mentorRequests.filter(x => x.status === "open").length}</p></div>
    </div>
    <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Building2 className="size-4 text-primary-3" /><h2 className="text-lg font-semibold">Company Intelligence</h2></div><div className="mt-4 grid gap-2 md:grid-cols-2">{companies.map(c => <div key={c.company} className="rounded-lg border border-border bg-surface p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{c.company}</p><span className="text-xs text-primary-3">{c.hiringSignal} signal</span></div><p className="mt-1 text-xs text-muted">{c.openRoles} roles · {c.averageMatch}% avg match · {c.locations.join(", ")}</p><p className="mt-2 text-[10px] text-subtle">Skills: {c.skills.join(", ")}</p></div>)}</div></div>
    <div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2"><LockKeyhole className="size-4 text-primary-3" /><h3 className="font-semibold">Stealth & Privacy</h3></div><p className="mt-2 text-xs leading-5 text-muted">Control recruiter visibility, block employers and use anonymous discovery while employed.</p><button onClick={() => updateProfile({ stealthMode: !user?.stealthMode, recruiterVisibility: user?.stealthMode ? "visible" : "anonymous" })} className="mt-3 rounded-md border border-border px-3 py-2 text-xs font-semibold">{user?.stealthMode ? "Stealth Mode ON" : "Enable Stealth Mode"}</button></div><div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2"><MessageCircleMore className="size-4 text-primary-3" /><h3 className="font-semibold">Interview Intelligence</h3></div><p className="mt-2 text-xs leading-5 text-muted">Use the existing AI Coach for role-specific preparation, STAR answers and interview practice.</p><button onClick={() => useGotcha.getState().setView("coach")} className="mt-3 rounded-md bg-primary px-3 py-2 text-xs font-semibold">Start Interview Prep</button></div></div>
  </section>;
}

function ModuleCard({ icon: Icon, title, value, text }: { icon: typeof Globe2; title: string; value: string; text: string }) { return <div className="rounded-xl border border-border bg-card p-4"><Icon className="size-4 text-primary-3" /><p className="mt-3 text-xs uppercase tracking-wider text-muted">{title}</p><p className="mt-1 text-xl font-semibold">{value}</p><p className="mt-1 text-xs leading-5 text-muted">{text}</p></div>; }
