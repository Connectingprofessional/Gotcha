import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Application, SavedSearch } from "./data";
import { createCareerEvent, type CareerEvent, type CareerEventType } from "./careerEvents";
import type { GlobalOpportunityContext } from "./global-opportunity-intelligence";

export type ViewId = "dashboard" | "search" | "opportunities" | "applications" | "coach" | "cv" | "hunt" | "network" | "market" | "learn" | "saved" | "profile" | "admin";
export type User = { name: string; email: string; password: string; title: string; location: string; about: string; skills: string[]; isAdmin?: boolean; targetRoles?: string[]; targetCountries?: string[]; salaryGoal?: string; remotePreference?: "Remote" | "Hybrid" | "On-site" | "Any"; careerGoal?: string; visaStatus?: string; languages?: string[]; certifications?: string[]; achievements?: string[]; blockedCompanies?: string[]; recruiterVisibility?: "visible" | "anonymous" | "hidden"; stealthMode?: boolean; gradeLevel?: string; experienceYears?: number; functionArea?: string; geography?: string; region?: string; country?: string; currency?: "INR" | "USD"; compMin?: number; compMax?: number; globalProfile?: GlobalOpportunityContext };
type Filters = { role: string; function: string; industry: string; location: string };
type CareerSignal = { id: string; title: string; description: string; priority: "high" | "medium" | "low"; createdAt: string };
type HuntAction = { id: string; title: string; description: string; view: ViewId; completed: boolean };
export type Referral = { id: string; jobId: string; note: string; status: "requested" | "offered" | "connected"; createdAt: string };
export type MentorRequest = { id: string; goal: string; status: "open" | "matched" | "closed"; createdAt: string };
export type CareerCircle = { id: string; name: string; focus: string; members: number };
export type CvVariant = { id: string; name: string; cvText: string; targetRole?: string; targetCompany?: string; atsScore?: number; matchedKeywords?: string[]; missingKeywords?: string[]; suggestions?: string[]; createdAt: string; updatedAt: string };
export type CoverLetter = { id: string; variantId?: string; jobTitle?: string; company?: string; content: string; createdAt: string };
type State = { users: User[]; sessionEmail: string | null; view: ViewId; filters: Filters; applications: Application[]; savedJobIds: string[]; savedSearches: SavedSearch[]; demoOpen: boolean; adminPrompt: boolean; cvText: string; cvVariants: CvVariant[]; coverLetters: CoverLetter[]; huntMode: boolean; careerSignals: CareerSignal[]; huntActions: HuntAction[]; careerGoalDraft: string; referrals: Referral[]; mentorRequests: MentorRequest[]; careerCircles: CareerCircle[]; careerEvents: CareerEvent[]; lastAgentRunAt: string | null; register: (u: Omit<User, "isAdmin">) => { ok: boolean; error?: string }; login: (email: string, password: string) => { ok: boolean; error?: string }; hydrateFromAuth: (email: string, name: string) => void; logout: () => void; setView: (v: ViewId) => void; setFilters: (f: Partial<Filters>) => void; applyTo: (jobId: string) => void; setStatus: (id: string, status: Application["status"]) => void; toggleSaveJob: (jobId: string) => void; saveCurrentSearch: () => void; removeSavedSearch: (id: string) => void; updateProfile: (p: Partial<User>) => void; setDemoOpen: (v: boolean) => void; setAdminPrompt: (v: boolean) => void; setCvText: (v: string) => void; saveCvVariant: (v: Omit<CvVariant, "id" | "createdAt" | "updatedAt"> & { id?: string }) => string; deleteCvVariant: (id: string) => void; activateCvVariant: (id: string) => void; saveCoverLetter: (c: Omit<CoverLetter, "id" | "createdAt">) => string; deleteCoverLetter: (id: string) => void; setHuntMode: (v: boolean) => void; completeHuntAction: (id: string) => void; addCareerSignal: (s: Omit<CareerSignal, "id" | "createdAt">) => void; setCareerGoalDraft: (v: string) => void; requestReferral: (jobId: string, note: string) => void; requestMentor: (goal: string) => void; recordCareerEvent: (type: CareerEventType, metadata: CareerEvent["metadata"], entityId?: string) => void; setAgentRun: () => void };

const SEED_USERS: User[] = [{ name: "Alex Rivera", email: "demo@gotecha.com", password: "huntends", title: "Product Manager", location: "Bangalore, India", about: "Product leader focused on payments, marketplace growth, and AI-assisted workflows. 8 years shipping 0–1 and scale products.", skills: ["Product Strategy", "Analytics", "Stakeholder Mgmt", "Payments"], targetRoles: ["Senior Product Manager"], targetCountries: ["India", "Singapore"], salaryGoal: "₹50L+", remotePreference: "Hybrid", careerGoal: "Move into a global product leadership role.", visaStatus: "India work authorization", languages: ["English", "Hindi"], recruiterVisibility: "visible", stealthMode: false, blockedCompanies: [], gradeLevel: "IC5 / Senior", experienceYears: 8, functionArea: "Product", geography: "APAC", region: "South Asia", country: "India", currency: "INR", compMin: 42, compMax: 58 }, { name: "Gotcha Admin", email: "admin@gotecha.com", password: "adminhunt", title: "Platform Administrator", location: "Global", about: "Administrator access for Gotcha operations.", skills: ["Operations"], isAdmin: true }];
const DEFAULT_ACTIONS: HuntAction[] = [{ id: "discover", title: "Review top opportunities", description: "Review the highest-fit roles before they go stale.", view: "opportunities", completed: false }, { id: "apply", title: "Send one quality application", description: "Tailor your CV and apply to your strongest match.", view: "search", completed: false }, { id: "prepare", title: "Prepare for interviews", description: "Use AI Career Coach to rehearse your next conversation.", view: "coach", completed: false }, { id: "skill", title: "Close one skill gap", description: "Use Learning Center to improve market competitiveness.", view: "learn", completed: false }];

export const useGotcha = create<State>()(persist((set, get) => ({
  users: SEED_USERS, sessionEmail: null, view: "dashboard", filters: { role: "Product Manager", function: "Technology", industry: "FinTech", location: "India / Remote" }, applications: [], savedJobIds: [], savedSearches: [], demoOpen: false, adminPrompt: false, cvText: "", cvVariants: [], coverLetters: [], huntMode: false, careerSignals: [], huntActions: DEFAULT_ACTIONS, careerGoalDraft: "", referrals: [], mentorRequests: [], careerCircles: [{ id: "fintech-leaders", name: "FinTech Leaders", focus: "Payments, financial technology and leadership", members: 128 }, { id: "global-pm", name: "Global Product Leaders", focus: "Product strategy and international careers", members: 214 }, { id: "global-hunters", name: "Global Job Hunters", focus: "International opportunity discovery", members: 96 }], careerEvents: [], lastAgentRunAt: null,
  register: u => { const email = u.email.trim().toLowerCase(); if (!email || !u.password || !u.name) return { ok: false, error: "All fields are required" }; if (get().users.some(x => x.email === email)) return { ok: false, error: "Email already registered" }; set({ users: [...get().users, { ...u, email }], sessionEmail: email, view: "dashboard" }); get().recordCareerEvent("profile.updated", { source: "registration" }); return { ok: true }; },
  login: (email, password) => { const user = get().users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()); if (!user || user.password !== password) return { ok: false, error: "Invalid email or password" }; set({ sessionEmail: user.email, view: "dashboard" }); return { ok: true }; }, logout: () => set({ sessionEmail: null, view: "dashboard" }),
  // Bridges a real backend-authenticated identity (e.g. Google sign-in) into
  // this app's local session model, auto-provisioning a profile on first
  // sign-in so the rest of the (still-local) app state keeps working.
  hydrateFromAuth: (email, name) => {
    const normalized = email.trim().toLowerCase();
    const existing = get().users.find(u => u.email.toLowerCase() === normalized);
    if (!existing) {
      // Every field the User type marks as required must be set here —
      // this is the ONLY place a brand-new real (Google/email) user gets
      // created, unlike seed users which always came fully populated.
      // Missing `skills`/`location` here previously crashed the app on a
      // real user's very first login: careerHuntScore() calls
      // `user.skills.length` with no guard, which throws on `undefined`.
      const newUser: User = {
        name: name || normalized,
        email: normalized,
        password: "",
        title: "",
        location: "",
        about: "",
        skills: [],
      };
      set({ users: [...get().users, newUser] });
    }
    set({ sessionEmail: normalized, view: "dashboard" });
  },
  setView: view => set({ view }), setFilters: f => set({ filters: { ...get().filters, ...f } }),
  applyTo: jobId => { if (get().applications.some(a => a.jobId === jobId)) return; set({ applications: [{ id: `a-${Date.now()}`, jobId, status: "applied", appliedAt: new Date().toISOString().slice(0, 10) }, ...get().applications] }); get().recordCareerEvent("application.created", { jobId, source: "gotcha" }, jobId); },
  setStatus: (id, status) => { const old = get().applications.find(a => a.id === id); set({ applications: get().applications.map(a => a.id === id ? { ...a, status } : a) }); if (old && old.status !== status) get().recordCareerEvent("application.status_changed", { from: old.status, to: status }, old.jobId); },
  toggleSaveJob: jobId => { const ids = get().savedJobIds; set({ savedJobIds: ids.includes(jobId) ? ids.filter(x => x !== jobId) : [...ids, jobId] }); if (!ids.includes(jobId)) get().recordCareerEvent("opportunity.saved", { source: "gotcha" }, jobId); },
  saveCurrentSearch: () => { const f = get().filters; set({ savedSearches: [{ id: `ss-${Date.now()}`, query: [f.role, f.industry, f.location].filter(Boolean).join(" · "), ...f, createdAt: new Date().toISOString().slice(0, 10) }, ...get().savedSearches] }); get().recordCareerEvent("search.performed", { role: f.role, industry: f.industry, location: f.location }); }, removeSavedSearch: id => set({ savedSearches: get().savedSearches.filter(s => s.id !== id) }),
  updateProfile: p => { const email = get().sessionEmail; if (!email) return; set({ users: get().users.map(u => u.email === email ? { ...u, ...p } : u) }); get().recordCareerEvent("profile.updated", { fields: Object.keys(p).join(",") }); }, setDemoOpen: demoOpen => set({ demoOpen }), setAdminPrompt: adminPrompt => set({ adminPrompt }), setCvText: cvText => set({ cvText }),
  saveCvVariant: v => {
    const now = new Date().toISOString();
    const existing = v.id ? get().cvVariants.find(x => x.id === v.id) : undefined;
    const id = existing?.id ?? `cv-${Date.now()}`;
    const record: CvVariant = { ...v, id, createdAt: existing?.createdAt ?? now, updatedAt: now };
    set({ cvVariants: existing ? get().cvVariants.map(x => x.id === id ? record : x) : [record, ...get().cvVariants] });
    get().recordCareerEvent("profile.updated", { fields: "cvVariant" }, id);
    return id;
  },
  deleteCvVariant: id => set({ cvVariants: get().cvVariants.filter(x => x.id !== id) }),
  activateCvVariant: id => { const v = get().cvVariants.find(x => x.id === id); if (v) set({ cvText: v.cvText }); },
  saveCoverLetter: c => {
    const id = `cl-${Date.now()}`;
    set({ coverLetters: [{ ...c, id, createdAt: new Date().toISOString() }, ...get().coverLetters] });
    return id;
  },
  deleteCoverLetter: id => set({ coverLetters: get().coverLetters.filter(x => x.id !== id) }),
  setHuntMode: huntMode => { set({ huntMode }); get().recordCareerEvent("goal.updated", { huntMode }); }, completeHuntAction: id => set({ huntActions: get().huntActions.map(a => a.id === id ? { ...a, completed: true } : a) }), addCareerSignal: s => set({ careerSignals: [{ ...s, id: `signal-${Date.now()}`, createdAt: new Date().toISOString() }, ...get().careerSignals] }), setCareerGoalDraft: careerGoalDraft => set({ careerGoalDraft }),
  requestReferral: (jobId, note) => { set({ referrals: [{ id: `ref-${Date.now()}`, jobId, note, status: "requested", createdAt: new Date().toISOString() }, ...get().referrals] }); get().recordCareerEvent("referral.requested", { jobId }, jobId); }, requestMentor: goal => { set({ mentorRequests: [{ id: `mentor-${Date.now()}`, goal, status: "open", createdAt: new Date().toISOString() }, ...get().mentorRequests] }); get().recordCareerEvent("mentor.requested", { goal }); }, recordCareerEvent: (type, metadata, entityId) => { const email = get().sessionEmail; if (!email) return; set({ careerEvents: [createCareerEvent(email, type, metadata, entityId), ...get().careerEvents].slice(0, 1000) }); }, setAgentRun: () => set({ lastAgentRunAt: new Date().toISOString() }),
}), { name: "gotecha-v2" }));
export function useSessionUser() { return useGotcha(s => s.users.find(u => u.email === s.sessionEmail) ?? null); }
