import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Application, SavedSearch } from "./data";

export type ViewId =
  | "dashboard"
  | "search"
  | "opportunities"
  | "applications"
  | "coach"
  | "cv"
  | "market"
  | "learn"
  | "saved"
  | "profile"
  | "admin";

export type User = {
  name: string;
  email: string;
  password: string;
  title: string;
  location: string;
  about: string;
  skills: string[];
  isAdmin?: boolean;
};

type Filters = {
  role: string;
  function: string;
  industry: string;
  location: string;
};

type State = {
  users: User[];
  sessionEmail: string | null;
  view: ViewId;
  filters: Filters;
  applications: Application[];
  savedJobIds: string[];
  savedSearches: SavedSearch[];
  demoOpen: boolean;
  adminPrompt: boolean;
  cvText: string;
  register: (u: Omit<User, "isAdmin">) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  setView: (v: ViewId) => void;
  setFilters: (f: Partial<Filters>) => void;
  applyTo: (jobId: string) => void;
  setStatus: (id: string, status: Application["status"]) => void;
  toggleSaveJob: (jobId: string) => void;
  saveCurrentSearch: () => void;
  removeSavedSearch: (id: string) => void;
  updateProfile: (p: Partial<User>) => void;
  setDemoOpen: (v: boolean) => void;
  setAdminPrompt: (v: boolean) => void;
  setCvText: (v: string) => void;
};

const SEED_USERS: User[] = [
  {
    name: "Alex Rivera",
    email: "demo@gotecha.com",
    password: "huntends",
    title: "Product Manager",
    location: "Bangalore, India",
    about:
      "Product leader focused on payments, marketplace growth, and AI-assisted workflows. 8 years shipping 0–1 and scale products.",
    skills: ["Product Strategy", "Analytics", "Stakeholder Mgmt", "Payments"],
  },
  {
    name: "Gotcha Admin",
    email: "admin@gotecha.com",
    password: "adminhunt",
    title: "Platform Administrator",
    location: "Global",
    about: "Administrator access for Gotcha operations.",
    skills: ["Operations"],
    isAdmin: true,
  },
];

export const useGotcha = create<State>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      sessionEmail: null,
      view: "dashboard",
      filters: {
        role: "Product Manager",
        function: "Technology",
        industry: "FinTech",
        location: "India / Remote",
      },
      applications: [
        { id: "a1", jobId: "j1", status: "applied", appliedAt: "2026-08-12" },
        { id: "a2", jobId: "j2", status: "interview", appliedAt: "2026-08-08" },
        { id: "a3", jobId: "j4", status: "assessment", appliedAt: "2026-08-04" },
        { id: "a4", jobId: "j10", status: "offer", appliedAt: "2026-07-28" },
        { id: "a5", jobId: "j8", status: "rejected", appliedAt: "2026-07-20" },
        { id: "a6", jobId: "j5", status: "applied", appliedAt: "2026-08-18" },
        { id: "a7", jobId: "j6", status: "interview", appliedAt: "2026-08-15" },
        { id: "a8", jobId: "j3", status: "applied", appliedAt: "2026-08-21" },
        { id: "a9", jobId: "j7", status: "applied", appliedAt: "2026-08-10" },
        { id: "a10", jobId: "j11", status: "interview", appliedAt: "2026-08-06" },
        { id: "a11", jobId: "j12", status: "applied", appliedAt: "2026-08-02" },
        { id: "a12", jobId: "j9", status: "applied", appliedAt: "2026-07-30" },
      ],
      savedJobIds: ["j1", "j2", "j3"],
      savedSearches: [
        {
          id: "s1",
          query: "Product Manager FinTech India",
          role: "Product Manager",
          function: "Product",
          industry: "FinTech",
          location: "India / Remote",
          createdAt: "2026-08-20",
        },
      ],
      demoOpen: false,
      adminPrompt: false,
      cvText: "",
      register: (u) => {
        const email = u.email.trim().toLowerCase();
        if (!email || !u.password || !u.name) return { ok: false, error: "All fields are required" };
        if (get().users.some((x) => x.email === email)) return { ok: false, error: "Email already registered" };
        const user: User = { ...u, email };
        set({ users: [...get().users, user], sessionEmail: email, view: "dashboard" });
        return { ok: true };
      },
      login: (email, password) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user || user.password !== password) return { ok: false, error: "Invalid email or password" };
        set({ sessionEmail: user.email, view: "dashboard" });
        return { ok: true };
      },
      logout: () => set({ sessionEmail: null, view: "dashboard" }),
      setView: (view) => set({ view }),
      setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
      applyTo: (jobId) => {
        if (get().applications.some((a) => a.jobId === jobId)) return;
        set({
          applications: [
            {
              id: `a-${Date.now()}`,
              jobId,
              status: "applied",
              appliedAt: new Date().toISOString().slice(0, 10),
            },
            ...get().applications,
          ],
        });
      },
      setStatus: (id, status) =>
        set({
          applications: get().applications.map((a) => (a.id === id ? { ...a, status } : a)),
        }),
      toggleSaveJob: (jobId) => {
        const ids = get().savedJobIds;
        set({
          savedJobIds: ids.includes(jobId) ? ids.filter((x) => x !== jobId) : [...ids, jobId],
        });
      },
      saveCurrentSearch: () => {
        const f = get().filters;
        set({
          savedSearches: [
            {
              id: `ss-${Date.now()}`,
              query: [f.role, f.industry, f.location].filter(Boolean).join(" · "),
              ...f,
              createdAt: new Date().toISOString().slice(0, 10),
            },
            ...get().savedSearches,
          ],
        });
      },
      removeSavedSearch: (id) =>
        set({ savedSearches: get().savedSearches.filter((s) => s.id !== id) }),
      updateProfile: (p) => {
        const email = get().sessionEmail;
        if (!email) return;
        set({
          users: get().users.map((u) => (u.email === email ? { ...u, ...p } : u)),
        });
      },
      setDemoOpen: (demoOpen) => set({ demoOpen }),
      setAdminPrompt: (adminPrompt) => set({ adminPrompt }),
      setCvText: (cvText) => set({ cvText }),
    }),
    { name: "gotecha-v1" },
  ),
);

export function useSessionUser() {
  return useGotcha((s) => s.users.find((u) => u.email === s.sessionEmail) ?? null);
}
