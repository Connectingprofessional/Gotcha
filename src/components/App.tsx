import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  Search,
  Briefcase,
  ClipboardList,
  Sparkles,
  FileText,
  LineChart,
  GraduationCap,
  Bookmark,
  UserRound,
  Shield,
  Settings,
  Menu,
  X,
  Brain,
  Zap,
  LifeBuoy,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  LogOut,
  Crosshair,
  Handshake,
  Wand2,
  Bell,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JOBS, LEARNING, MARKET, ROLES, INDUSTRIES, type Job, type Application } from "@/lib/data";
import { useGotcha, useSessionUser, type ViewId } from "@/lib/store";
import { GotchaCareerDashboard } from "@/components/GotchaCareerDashboard";
import { askGotcha } from "@/lib/ai";
import { CvIntelligencePage } from "@/components/CvIntelligence";
import { HuntModePage } from "@/components/HuntMode";
import { GlobalCareerModules } from "@/components/GlobalCareerModules";
import { companyHealth, deriveCompanyProfile } from "@/lib/companyIntelligence";
import { buildDevelopmentPlan } from "@/lib/careerDevelopment";
import { buildAgeingInsights, type CareerApplication } from "@/lib/careerSuite";
import { scoreOpportunity } from "@/lib/careerIntelligence";
import { authClient, signIn as brokerSignIn, signOut as brokerSignOut, GROK_PROVIDERS } from "@/lib/auth/client";
import { provisionAdmin } from "@/lib/auth/bootstrap-admin";

const NAV: { id: ViewId; label: string; icon: typeof LayoutGrid; admin?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "search", label: "AI Job Search", icon: Search },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
  { id: "applications", label: "Applications", icon: ClipboardList },
  { id: "coach", label: "AI Career Coach", icon: Sparkles },
  { id: "cv", label: "CV Intelligence", icon: FileText },
  { id: "hunt", label: "Hunt Mode", icon: Crosshair },
  { id: "network", label: "Network & Privacy", icon: Handshake },
  { id: "market", label: "Market Insights", icon: LineChart },
  { id: "learn", label: "Learning Center", icon: GraduationCap },
  { id: "saved", label: "Saved Searches", icon: Bookmark },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "admin", label: "Admin", icon: Shield, admin: true },
];

function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-[1.35rem] font-semibold tracking-[0.18em] text-fg">
        GOTCHA
      </span>
      {!compact && (
        <span className="mt-0.5 text-[10px] font-medium tracking-[0.28em] text-muted uppercase">
          The hunt ends here.
        </span>
      )}
    </div>
  );
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 border-r border-border px-3 py-2 last:border-r-0">
      <span className="text-[10px] font-medium uppercase tracking-wider text-subtle">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-sm font-medium text-fg outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-surface text-fg">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}


export function App() {
  const view = useGotcha((s) => s.view);
  const setView = useGotcha((s) => s.setView);
  const user = useSessionUser();
  const sessionEmail = useGotcha((s) => s.sessionEmail);
  const hydrateFromAuth = useGotcha((s) => s.hydrateFromAuth);
  const setAdminPrompt = useGotcha((s) => s.setAdminPrompt);
  const [mobileNav, setMobileNav] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const { data: authSession } = authClient.useSession();

  // Bridges a real backend session (Google sign-in) into the app's local
  // session model on first load / after the OAuth redirect back.
  useEffect(() => {
    if (!authSession?.user?.email || sessionEmail) return;
    const wantsAdmin = new URLSearchParams(window.location.search).get("authIntent") === "admin";
    const isAdmin = Boolean((authSession.user as unknown as { isAdmin?: boolean }).isAdmin);
    hydrateFromAuth(authSession.user.email, authSession.user.name ?? "");
    if (wantsAdmin) {
      if (isAdmin) {
        setAdminPrompt(false);
        setView("admin");
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("authIntent");
      window.history.replaceState({}, "", url.toString());
    }
  }, [authSession, sessionEmail, hydrateFromAuth, setAdminPrompt, setView]);

  return (
    <div className="gotecha-grid min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex min-h-dvh max-w-[1600px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-border bg-sidebar px-4 py-5 transition-transform duration-250 md:static md:translate-x-0",
            mobileNav ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="mb-6 flex items-start justify-between px-2">
            <Logo />
            <button type="button" className="md:hidden" onClick={() => setMobileNav(false)} aria-label="Close menu">
              <X className="size-5 text-muted" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5">
            {NAV.filter((n) => !n.admin || user?.isAdmin).map((n) => {
              const Icon = n.icon;
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setView(n.id);
                    setMobileNav(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
                    active
                      ? "bg-primary/20 text-fg shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_45%,transparent)]"
                      : "text-muted hover:bg-card hover:text-fg",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {n.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-4 rounded-lg bg-linear-to-br from-primary/30 to-primary/5 p-4 hairline">
            <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-primary/30">
              <Sparkles className="size-4 text-primary-3" />
            </div>
            <p className="text-sm font-semibold">AI-Powered</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Real-time intelligence that finds the right opportunities for you.
            </p>
            <button
              type="button"
              onClick={() => setView("search")}
              className="mt-3 text-xs font-medium text-primary-3"
            >
              Learn More →
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <button
              type="button"
              className="rounded-md p-2 md:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden md:block" />
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => useGotcha.getState().setAdminPrompt(true)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-fg"
              >
                <Shield className="size-3.5" />
                Administrator Access
              </button>
              <button
                type="button"
                className="rounded-full border border-border p-2 text-muted hover:text-fg"
                aria-label="Settings"
                onClick={() => setView("profile")}
              >
                <Settings className="size-4" />
              </button>
              {user && <AssistantButton />}
              {user && <NotificationBell />}
              {user && <AccountMenu user={user} />}
            </div>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-6 lg:px-6">
            <main className="min-w-0">
              {view === "dashboard" && <GotchaCareerDashboard onOpenJob={setJob} />}
              {view === "search" && <SearchPage onOpenJob={setJob} />}
              {view === "opportunities" && <OpportunitiesPage onOpenJob={setJob} />}
              {view === "applications" && <ApplicationsPage onOpenJob={setJob} />}
              {view === "coach" && <CoachPage />}
              {view === "cv" && <CvIntelligencePage />}
              {view === "hunt" && <HuntModePage />}
              {view === "network" && <GlobalCareerModules />}
              {view === "market" && <MarketPage />}
              {view === "learn" && <LearnPage />}
              {view === "saved" && <SavedPage />}
              {view === "profile" && <ProfilePage />}
              {view === "admin" && <AdminPage />}
            </main>
          </div>

          <footer className="mt-auto border-t border-border px-4 py-6 md:px-6">
            <p className="mb-4 text-center text-sm font-medium text-muted">Why Professionals Choose Gotcha</p>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: Zap, t: "AI-Powered Matching", d: "Smart algorithms find your perfect opportunities" },
                { icon: Briefcase, t: "Real-time Opportunities", d: "Live job data from top companies worldwide" },
                { icon: Brain, t: "Career Intelligence", d: "Market insights to make smarter career moves" },
                { icon: LifeBuoy, t: "End-to-End Support", d: "AI Coach, CV Intelligence & Application Tracking" },
              ].map((x) => (
                <div key={x.t} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                    <x.icon className="size-4 text-muted" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{x.t}</p>
                    <p className="text-xs text-muted">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
              <p>© 2026 Gotcha. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="/privacy" className="hover:text-fg">Privacy Policy</a>
                <a href="/terms" className="hover:text-fg">Terms of Service</a>
                <a href="mailto:hello@gotecha.app" className="hover:text-fg">Support</a>
              </div>
              <div className="flex gap-3 text-muted">
                <Linkedin className="size-4" />
                <Twitter className="size-4" />
                <Youtube className="size-4" />
                <Instagram className="size-4" />
              </div>
            </div>
          </footer>
        </div>
      </div>

      {mobileNav && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-bg/60 md:hidden"
          aria-label="Close overlay"
          onClick={() => setMobileNav(false)}
        />
      )}
      {job && <JobModal job={job} onClose={() => setJob(null)} />}
      <DemoModal />
      <AdminGate />
    </div>
  );
}


function filterJobs(role: string, fn: string, industry: string, location: string) {
  return JOBS.filter((j) => {
    const roleOk = !role || j.title.toLowerCase().includes(role.toLowerCase().split(" ")[0] ?? "") || role === "Product Manager";
    const fnOk = !fn || j.function === fn || fn === "Technology";
    const indOk = !industry || j.industry === industry || true;
    const locOk = !location || j.location.toLowerCase().includes(location.split("/")[0].trim().toLowerCase()) || location.includes("Remote") || location.includes("India");
    return roleOk && fnOk && indOk && locOk;
  }).sort((a, b) => b.match - a.match);
}

function SearchPage({ onOpenJob }: { onOpenJob: (j: Job) => void }) {
  const filters = useGotcha((s) => s.filters);
  const setFilters = useGotcha((s) => s.setFilters);
  const saveCurrentSearch = useGotcha((s) => s.saveCurrentSearch);
  const [prompt, setPrompt] = useState("Find global Product Manager roles in FinTech, India or remote, last 7 days");
  const [ai, setAi] = useState("");
  const [busy, setBusy] = useState(false);
  const jobs = useMemo(
    () => filterJobs(filters.role, filters.function, filters.industry, filters.location),
    [filters],
  );

  async function runAi() {
    setBusy(true);
    const res = await askGotcha({
      data: {
        prompt,
        system:
          "You are Gotcha AI Job Search. Return: 1) a Boolean/X-ray string 2) 4 suggested titles 3) a 3-line search strategy. Keep it tight.",
      },
    });
    setBusy(false);
    setAi(res.ok ? res.text : res.error);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">AI Job Search</h1>
      <p className="text-sm text-muted">Natural language search across 50,000+ global sources with Boolean + X-ray generation.</p>
      <div className="rounded-xl border border-border bg-card p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-input p-3 text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={runAi} disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium glow-primary disabled:opacity-60">
            {busy ? "Searching…" : "Search with AI"}
          </button>
          <button type="button" onClick={saveCurrentSearch} className="rounded-md border border-border px-4 py-2 text-sm">
            Save search
          </button>
        </div>
        {ai && <pre className="mt-3 whitespace-pre-wrap rounded-md bg-bg p-3 text-xs text-muted">{ai}</pre>}
      </div>
      <div className="flex flex-wrap gap-2">
        <FieldSelect label="Role" value={filters.role} options={ROLES} onChange={(v) => setFilters({ role: v })} />
        <FieldSelect label="Industry" value={filters.industry} options={INDUSTRIES} onChange={(v) => setFilters({ industry: v })} />
      </div>
      <div className="space-y-2">
        {jobs.map((j) => (
          <JobCard key={j.id} job={j} onOpen={onOpenJob} />
        ))}
      </div>
    </div>
  );
}

function JobCard({ job, onOpen }: { job: Job; onOpen: (j: Job) => void }) {
  const applyTo = useGotcha((s) => s.applyTo);
  const toggleSaveJob = useGotcha((s) => s.toggleSaveJob);
  const saved = useGotcha((s) => s.savedJobIds.includes(job.id));
  const applied = useGotcha((s) => s.applications.some((a) => a.jobId === job.id));
  return (
    <article className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className="flex size-10 items-center justify-center rounded-sm text-sm font-semibold" style={{ background: job.logoBg }}>
        {job.logo}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium">{job.title}</h3>
        <p className="text-xs text-muted">
          {job.company} · {job.location} · {job.work} · {job.salary}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {job.tags.map((t) => (
            <span key={t} className="rounded-full bg-bg px-2 py-0.5 text-[10px] text-muted">
              {t}
            </span>
          ))}
        </div>
      </div>
      <span className="text-sm font-semibold text-success">{job.match}% match</span>
      <button type="button" onClick={() => onOpen(job)} className="rounded-md border border-border px-3 py-1.5 text-xs">
        View
      </button>
      <button
        type="button"
        onClick={() => applyTo(job.id)}
        disabled={applied}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium disabled:opacity-50"
      >
        {applied ? "Applied" : "Apply"}
      </button>
      <button type="button" onClick={() => toggleSaveJob(job.id)} className="text-xs text-muted">
        {saved ? "Saved" : "Save"}
      </button>
    </article>
  );
}

function OpportunitiesPage({ onOpenJob }: { onOpenJob: (j: Job) => void }) {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Opportunities</h1>
      <p className="text-sm text-muted">{JOBS.length} AI-ranked roles matched to your profile.</p>
      {JOBS.map((j) => (
        <JobCard key={j.id} job={j} onOpen={onOpenJob} />
      ))}
    </div>
  );
}

function ApplicationsPage({ onOpenJob }: { onOpenJob: (j: Job) => void }) {
  const applications = useGotcha((s) => s.applications);
  const setStatus = useGotcha((s) => s.setStatus);

  const STATUS_TO_STAGE: Record<Application["status"], CareerApplication["stage"]> = {
    applied: "applied",
    assessment: "screened",
    interview: "interview",
    offer: "offer",
    rejected: "applied",
  };
  const careerApps: CareerApplication[] = applications
    .map((a): CareerApplication | null => {
      const job = JOBS.find((j) => j.id === a.jobId);
      if (!job) return null;
      return {
        id: a.id,
        company: job.company,
        role: job.title,
        location: job.location,
        source: job.source,
        cvVersion: a.cvVariant,
        stage: STATUS_TO_STAGE[a.status],
        outcome: a.status === "rejected" ? "rejected" : "active",
        enteredAt: a.appliedAt,
        updatedAt: a.lastActivityAt ?? a.appliedAt,
      };
    })
    .filter((x): x is CareerApplication => x !== null);
  const ageing = buildAgeingInsights(careerApps).filter((i) => i.severity !== "normal");

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Applications</h1>

      {ageing.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium">Needs attention</p>
          <div className="space-y-1.5">
            {ageing.map((i) => {
              const app = applications.find((a) => a.id === i.applicationId);
              const job = app ? JOBS.find((j) => j.id === app.jobId) : null;
              return (
                <div key={i.applicationId} className="flex items-center justify-between gap-3 text-xs">
                  <span>
                    <span className={i.severity === "attention" ? "text-danger" : "text-warn"}>
                      {i.severity === "attention" ? "●" : "●"}
                    </span>{" "}
                    <span className="font-medium">{job?.company ?? "Unknown"}</span>{" "}
                    <span className="text-muted">— {i.ageDays}d since last activity</span>
                  </span>
                  <span className="text-muted">{i.recommendedAction}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => {
              const job = JOBS.find((j) => j.id === a.jobId);
              if (!job) return null;
              return (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <button type="button" className="text-left hover:text-primary-3" onClick={() => onOpenJob(job)}>
                      {job.company}
                    </button>
                  </td>
                  <td className="px-3 py-2">{job.title}</td>
                  <td className="px-3 py-2">
                    <select
                      value={a.status}
                      onChange={(e) => setStatus(a.id, e.target.value as typeof a.status)}
                      className="rounded-sm border border-border bg-input px-2 py-1 text-xs"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="assessment">Assessment</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-muted">{a.appliedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoachPage() {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "I’m your Gotcha career coach. Ask about roles, Boolean search, CV gaps, or interview prep." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    const res = await askGotcha({ data: { prompt: text } });
    setBusy(false);
    setMessages((m) => [...m, { role: "bot", text: res.ok ? res.text : res.error }]);
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3 text-sm font-semibold">AI Career Coach</div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              m.role === "bot" ? "bg-bg text-muted" : "ml-auto bg-primary/25 text-fg",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form
        className="flex gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the coach…"
          className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm outline-none"
        />
        <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium">
          Send
        </button>
      </form>
    </div>
  );
}

function MarketPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Market Insights</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {MARKET.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{m.label}</p>
              <p className={m.change >= 0 ? "text-sm text-success" : "text-sm text-danger"}>
                {m.change >= 0 ? "+" : ""}
                {m.change}%
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
              <div className="h-full rounded-full bg-primary" style={{ width: `${m.demand}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">Demand index {m.demand}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearnPage() {
  const user = useSessionUser();
  const skills = user?.skills ?? [];
  const targetTitle = user?.targetRoles?.[0] ?? user?.title ?? "";
  const marketJobs = JOBS.filter((j) => !targetTitle || j.title.toLowerCase().includes(targetTitle.toLowerCase().split(" ")[0] ?? ""));
  const targetSkills = [...new Set(marketJobs.flatMap((j) => j.tags))].slice(0, 8);
  const plan = buildDevelopmentPlan({ currentSkills: skills, targetSkills });
  const importanceTone = { critical: "text-danger", high: "text-warn", medium: "text-muted" } as const;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Learning Center</h1>

      {plan.gaps.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-sm font-medium">
            Your development plan{targetTitle ? ` for ${targetTitle}` : ""}
          </p>
          <p className="mb-3 text-xs text-muted">
            Based on skills that appear most often in roles matching your target — vs. your current profile.
          </p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {plan.gaps.map((g) => (
              <span key={g.skill} className={cn("rounded-full border border-border px-2.5 py-1 text-xs", importanceTone[g.importance])}>
                {g.skill}
              </span>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "30 days", items: plan.thirtyDay },
              { label: "60 days", items: plan.sixtyDay },
              { label: "90 days", items: plan.ninetyDay },
            ].map((col) => (
              <div key={col.label}>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">{col.label}</p>
                <ul className="space-y-1">
                  {col.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {LEARNING.map((l) => (
        <article key={l.id} className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-primary-3">{l.tag}</p>
          <h3 className="mt-1 font-medium">{l.title}</h3>
          <p className="text-xs text-muted">
            {l.source} · {l.minutes} min
          </p>
        </article>
      ))}
    </div>
  );
}

function SavedPage() {
  const savedSearches = useGotcha((s) => s.savedSearches);
  const removeSavedSearch = useGotcha((s) => s.removeSavedSearch);
  const setFilters = useGotcha((s) => s.setFilters);
  const setView = useGotcha((s) => s.setView);
  const savedJobIds = useGotcha((s) => s.savedJobIds);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Saved Searches</h1>
      {savedSearches.length === 0 && <p className="text-sm text-muted">No saved searches yet.</p>}
      {savedSearches.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <p className="font-medium">{s.query}</p>
            <p className="text-xs text-muted">{s.createdAt}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-1.5 text-xs"
              onClick={() => {
                setFilters({ role: s.role, function: s.function, industry: s.industry, location: s.location });
                setView("search");
              }}
            >
              Run
            </button>
            <button type="button" className="text-xs text-danger" onClick={() => removeSavedSearch(s.id)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <h2 className="pt-2 text-sm font-semibold">Saved jobs ({savedJobIds.length})</h2>
    </div>
  );
}

function ProfilePage() {
  const user = useSessionUser();
  const updateProfile = useGotcha((s) => s.updateProfile);
  const logout = useGotcha((s) => s.logout);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    title: user?.title ?? "",
    location: user?.location ?? "",
    about: user?.about ?? "",
    skills: (user?.skills ?? []).join(", "),
  });
  if (!user) {
    return <p className="text-sm text-muted">Sign in on the right to manage your profile.</p>;
  }
  return (
    <div className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">Profile</h1>
      {(["name", "title", "location"] as const).map((k) => (
        <label key={k} className="block text-xs text-muted">
          {k}
          <input
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-fg"
          />
        </label>
      ))}
      <label className="block text-xs text-muted">
        about
        <textarea
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-fg"
        />
      </label>
      <label className="block text-xs text-muted">
        skills (comma separated)
        <input
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-fg"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium"
          onClick={() =>
            updateProfile({
              name: form.name,
              title: form.title,
              location: form.location,
              about: form.about,
              skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
        >
          Save profile
        </button>
        <button type="button" onClick={logout} className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function AdminPage() {
  const user = useSessionUser();
  const users = useGotcha((s) => s.users);
  if (!user?.isAdmin) return <p className="text-sm text-muted">Administrator access required.</p>;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Administrator</h1>
      <p className="text-sm text-muted">{users.length} registered profiles on this device.</p>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.email} className="rounded-xl border border-border bg-card p-3 text-sm">
            <p className="font-medium">{u.name}</p>
            <p className="text-xs text-muted">
              {u.email} · {u.title}
              {u.isAdmin ? " · admin" : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AssistantButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi — I'm your Gotcha AI Assistant. Ask me about jobs, your CV, applications, or interview prep." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    const res = await askGotcha({ data: { prompt: text } });
    setBusy(false);
    setMessages((m) => [...m, { role: "bot", text: res.ok ? res.text : res.error }]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-fg"
      >
        <Wand2 className="size-3.5" />
        <span className="hidden sm:inline">AI Assistant</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-4 md:items-center" onClick={() => setOpen(false)}>
          <div
            className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wand2 className="size-4 text-primary-3" /> AI Assistant
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted hover:text-fg">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    m.role === "bot" ? "bg-bg text-muted" : "ml-auto bg-primary/25 text-fg",
                  )}
                >
                  {m.text}
                </div>
              ))}
              {busy && <div className="max-w-[85%] rounded-lg bg-bg px-3 py-2 text-sm text-muted">Thinking…</div>}
            </div>
            <form
              className="flex gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your job search…"
                className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                aria-label="Send"
                className="flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium disabled:opacity-60"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

type NotificationItem = { id: string; category: "New job" | "CV feedback" | "Employer" | "Interview"; text: string; at: string };

function buildNotifications(
  user: ReturnType<typeof useSessionUser>,
  applications: Application[],
  careerEvents: { id: string; type: string; occurredAt: string; entityId?: string; metadata: Record<string, string | number | boolean | null> }[],
  cvVariants: { id: string; atsScore?: number; createdAt: string }[],
): NotificationItem[] {
  const items: NotificationItem[] = [];
  const jobById = (id?: string) => JOBS.find((j) => j.id === id);

  if (user) {
    const appliedOrSaved = new Set(applications.map((a) => a.jobId));
    [...JOBS]
      .map((job) => ({ job, score: scoreOpportunity(job, user).overall }))
      .filter((m) => !appliedOrSaved.has(m.job.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .forEach((m) => {
        items.push({
          id: `job-${m.job.id}`,
          category: "New job",
          text: `New match: ${m.job.title} at ${m.job.company} — ${m.score}% fit`,
          at: m.job.posted,
        });
      });
  }

  careerEvents
    .filter((e) => e.type === "interview.scheduled" || e.type === "interview.outcome" || e.type === "offer.received")
    .slice(0, 5)
    .forEach((e) => {
      const job = jobById(e.entityId);
      const label =
        e.type === "interview.scheduled"
          ? `Interview scheduled${job ? ` for ${job.title} at ${job.company}` : ""}`
          : e.type === "interview.outcome"
            ? `Interview update${job ? ` for ${job.title} at ${job.company}` : ""}`
            : `Offer received${job ? ` from ${job.company}` : ""}`;
      items.push({ id: e.id, category: "Interview", text: label, at: e.occurredAt });
    });

  careerEvents
    .filter((e) => e.type === "application.status_changed" && (e.metadata.to === "interview" || e.metadata.to === "offer" || e.metadata.to === "rejected"))
    .slice(0, 5)
    .forEach((e) => {
      const job = jobById(e.entityId);
      items.push({
        id: e.id,
        category: "Employer",
        text: `${job ? job.company : "An employer"} moved your application${job ? ` for ${job.title}` : ""} to "${e.metadata.to}"`,
        at: e.occurredAt,
      });
    });

  [...cvVariants]
    .filter((v) => typeof v.atsScore === "number")
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 2)
    .forEach((v) => {
      items.push({ id: `cv-${v.id}`, category: "CV feedback", text: `Your CV scored ${v.atsScore}% ATS match`, at: v.createdAt });
    });

  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12);
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const user = useSessionUser();
  const applications = useGotcha((s) => s.applications);
  const careerEvents = useGotcha((s) => s.careerEvents);
  const cvVariants = useGotcha((s) => s.cvVariants);
  const setView = useGotcha((s) => s.setView);
  const items = useMemo(
    () => buildNotifications(user, applications, careerEvents, cvVariants),
    [user, applications, careerEvents, cvVariants],
  );

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  const categoryView: Record<NotificationItem["category"], ViewId> = {
    "New job": "search",
    "CV feedback": "cv",
    Employer: "applications",
    Interview: "applications",
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-border p-2 text-muted hover:text-fg"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Bell className="size-4" />
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-fg">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-2xl"
        >
          <div className="border-b border-border px-3 py-2.5 text-sm font-semibold">Notifications</div>
          {items.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted">You're all caught up — no updates yet.</p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  setView(categoryView[n.category]);
                }}
                className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left hover:bg-surface"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-primary-3">{n.category}</span>
                <span className="text-xs text-fg">{n.text}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AccountMenu({ user }: { user: { name: string; email: string } }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const logout = useGotcha((s) => s.logout);
  const initial = (user.name?.trim()?.[0] ?? user.email?.trim()?.[0] ?? "?").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  async function handleSignOut() {
    setSignOutError(false);
    setSigningOut(true);
    try {
      await brokerSignOut();
      // On success this navigates away; clear the persisted local
      // view state right before that happens.
      logout();
    } catch {
      // Deployed sessions ride an HttpOnly cookie only the server can
      // clear — a failed/timed-out request means it's still live, so
      // don't clear the local view and claim signed-out falsely.
      // Surface it so the visitor knows to retry instead of assuming
      // the button is broken.
      setSigningOut(false);
      setSignOutError(true);
    }
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 text-left hover:border-primary/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/30 text-xs font-semibold text-primary-3">
          {initial}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block max-w-[120px] truncate text-xs font-medium">{user.name}</span>
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-2xl"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-subtle">{user.email}</p>
          </div>
          <button
            type="button"
            disabled={signingOut}
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-fg hover:bg-surface disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut className="size-4" /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
          {signOutError && (
            <p className="px-3 pb-2 text-[11px] text-danger">Couldn't sign out — check your connection and try again.</p>
          )}
        </div>
      )}
    </div>
  );
}

function JobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const applyTo = useGotcha((s) => s.applyTo);
  const applied = useGotcha((s) => s.applications.some((a) => a.jobId === job.id));
  const companyJobs = JOBS.filter((j) => j.company === job.company);
  const profile = deriveCompanyProfile(job.company, companyJobs);
  const health = companyHealth(profile);
  const healthLabel = { strong: "Strong hiring signal", stable: "Stable", watch: "Worth a closer look" }[health];
  const healthTone = { strong: "text-success", stable: "text-muted", watch: "text-warn" }[health];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-4 md:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{job.title}</h2>
            <p className="text-sm text-muted">
              {job.company} · {job.location} · {job.work}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">{job.description}</p>
        <p className="mt-3 text-sm">
          {job.salary} · {job.posted} · {job.source}
        </p>
        <p className="mt-2 text-sm font-semibold text-success">{job.match}% match</p>

        <div className="mt-4 rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">Company snapshot</p>
            <span className={cn("text-xs font-medium", healthTone)}>{healthLabel}</span>
          </div>
          <div className="space-y-1.5">
            {profile.signals.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted">{s.label}</span>
                <span
                  className={cn(
                    "font-medium",
                    s.severity === "positive" ? "text-success" : s.severity === "warning" ? "text-warn" : "text-fg",
                  )}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={applied}
          onClick={() => applyTo(job.id)}
          className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {applied ? "Already applied" : "Apply with profile"}
        </button>
      </div>
    </div>
  );
}

function DemoModal() {
  const open = useGotcha((s) => s.demoOpen);
  const setDemoOpen = useGotcha((s) => s.setDemoOpen);
  const setView = useGotcha((s) => s.setView);
  const [step, setStep] = useState(0);
  const steps = [
    { t: "Search like a human", d: "Describe the role in plain language. Gotcha turns it into Boolean, X-ray, and live matches." },
    { t: "See where you fit", d: "Every role is scored against your profile — skills, seniority, industry, and location." },
    { t: "Track the hunt", d: "Applications, interviews, and offers live in one pipeline so nothing slips." },
  ];
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/75 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary-3">90-second demo</p>
        <h2 className="mt-2 text-xl font-semibold">{steps[step].t}</h2>
        <p className="mt-2 text-sm text-muted">{steps[step].d}</p>
        <div className="mt-4 flex gap-1">
          {steps.map((_, i) => (
            <span key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
        <div className="mt-5 flex justify-between">
          <button type="button" className="text-sm text-muted" onClick={() => setDemoOpen(false)}>
            Skip
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium"
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else {
                setDemoOpen(false);
                setView("search");
                setStep(0);
              }
            }}
          >
            {step < steps.length - 1 ? "Next" : "Start hunting"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.73-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

/**
 * One button per upstream in `GROK_PROVIDERS`, signing in through the shared
 * Grok auth broker (`@/lib/auth/client`'s `signIn`) — the path that's actually
 * pre-wired with real credentials in live preview AND when deployed, unlike
 * a native `socialProviders` entry which needs this app's own client id/secret
 * set as env vars. See `providers.ts` to add an upstream once the broker
 * supports it.
 */
function SocialSignInButtons({ callbackURL }: { callbackURL: string }) {
  const [pending, setPending] = useState<string | null>(null);
  const [err, setErr] = useState("");
  return (
    <div className="space-y-2">
      {GROK_PROVIDERS.map((p) => (
        <button
          key={p.providerId}
          type="button"
          disabled={pending !== null}
          onClick={async () => {
            setErr("");
            setPending(p.providerId);
            try {
              await brokerSignIn(p.providerId, { callbackURL });
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Sign-in failed");
            } finally {
              setPending(null);
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-input py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {p.idp === "google" ? <GoogleGlyph /> : <Twitter className="size-4" />}
          {pending === p.providerId ? "Redirecting…" : `Continue with ${p.label}`}
        </button>
      ))}
      {err && <p className="mt-1 text-[11px] text-danger">{err}</p>}
    </div>
  );
}

function AdminGate() {
  const open = useGotcha((s) => s.adminPrompt);
  const setAdminPrompt = useGotcha((s) => s.setAdminPrompt);
  const setView = useGotcha((s) => s.setView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [setupMsg, setSetupMsg] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/75 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Administrator Access</h2>
          <button type="button" onClick={() => setAdminPrompt(false)} aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <SocialSignInButtons callbackURL="/?authIntent=admin" />
        <div className="my-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr("");
            setBusy(true);
            try {
              const { data, error } = await authClient.signIn.email({ email, password });
              if (error || !data) {
                setErr(error?.message ?? "Sign-in failed");
                return;
              }
              const isAdmin = Boolean(
                (data.user as unknown as { isAdmin?: boolean } | undefined)?.isAdmin,
              );
              if (!isAdmin) {
                setErr("This account is not an administrator");
                return;
              }
              setAdminPrompt(false);
              setView("admin");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
          />
          {err && <p className="text-xs text-danger">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Enter"}
          </button>
        </form>
        <div className="mt-3 border-t border-border pt-3">
          <button
            type="button"
            className="w-full text-[11px] text-subtle underline decoration-dotted"
            onClick={async () => {
              setSetupMsg("Setting up…");
              try {
                const res = await provisionAdmin();
                setSetupMsg(res.ok ? `Admin account ready: ${res.email}` : res.error);
              } catch (e) {
                setSetupMsg(e instanceof Error ? `Error: ${e.message}` : "Unexpected error during setup");
              }
            }}
          >
            First-time setup: provision admin account
          </button>
          {setupMsg && <p className="mt-1 text-[11px] text-subtle">{setupMsg}</p>}
        </div>
      </div>
    </div>
  );
}
