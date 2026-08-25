export type Job = {
  id: string;
  title: string;
  company: string;
  logo: string;
  logoBg: string;
  location: string;
  work: "Remote" | "Hybrid" | "On-site";
  match: number;
  salary: string;
  posted: string;
  function: string;
  industry: string;
  tags: string[];
  description: string;
  source: string;
};

export type Application = {
  id: string;
  jobId: string;
  status: "applied" | "interview" | "assessment" | "offer" | "rejected";
  appliedAt: string;
};

export type SavedSearch = {
  id: string;
  query: string;
  role: string;
  function: string;
  industry: string;
  location: string;
  createdAt: string;
};

export const ROLES = [
  "Product Manager",
  "Senior Product Manager",
  "Data Analyst",
  "UX Designer",
  "DevOps Engineer",
  "Sales Manager",
  "Marketing Lead",
  "Software Engineer",
  "Talent Acquisition Lead",
  "Engineering Manager",
];

export const FUNCTIONS = [
  "Technology",
  "Product",
  "Design",
  "Data",
  "Sales",
  "Marketing",
  "People / TA",
  "Operations",
];

export const INDUSTRIES = [
  "FinTech",
  "E-commerce",
  "SaaS",
  "Healthcare",
  "Consumer",
  "Logistics",
  "AI / ML",
  "Payments",
];

export const LOCATIONS = [
  "India / Remote",
  "Bangalore, India",
  "Mumbai, India",
  "Hyderabad, India",
  "Gurugram, India",
  "Singapore / Remote",
  "Europe / Remote",
  "US / Remote",
  "Dubai, UAE",
];

export const JOBS: Job[] = [
  {
    id: "j1",
    title: "Product Manager",
    company: "Razorpay",
    logo: "R",
    logoBg: "#0b5fff",
    location: "Bangalore, India",
    work: "Hybrid",
    match: 95,
    salary: "₹45–65 LPA",
    posted: "2 hours ago",
    function: "Product",
    industry: "FinTech",
    tags: ["Product Strategy", "Payments", "0–1"],
    description:
      "Own the merchant checkout experience across India. Partner with engineering and design to ship high-impact payments products used by millions of businesses.",
    source: "Company site",
  },
  {
    id: "j2",
    title: "Senior Product Manager",
    company: "Flipkart",
    logo: "F",
    logoBg: "#fbbf24",
    location: "Bangalore, India",
    work: "On-site",
    match: 92,
    salary: "₹50–72 LPA",
    posted: "5 hours ago",
    function: "Product",
    industry: "E-commerce",
    tags: ["Marketplace", "Growth", "Analytics"],
    description:
      "Lead a category growth pod. Define roadmap, run experiments, and scale conversion across the Flipkart marketplace.",
    source: "LinkedIn",
  },
  {
    id: "j3",
    title: "Product Manager II",
    company: "Swiggy",
    logo: "S",
    logoBg: "#f97316",
    location: "Bangalore, India",
    work: "Hybrid",
    match: 90,
    salary: "₹38–55 LPA",
    posted: "1 day ago",
    function: "Product",
    industry: "Consumer",
    tags: ["Delivery", "Ops", "Mobile"],
    description:
      "Shape the next generation of food delivery reliability. Work with ops, data science, and design on SLA, ETA, and rider experience.",
    source: "Naukri",
  },
  {
    id: "j4",
    title: "Staff Product Manager",
    company: "Stripe",
    logo: "S",
    logoBg: "#635bff",
    location: "Singapore / Remote",
    work: "Remote",
    match: 88,
    salary: "$180–230K",
    posted: "1 day ago",
    function: "Product",
    industry: "Payments",
    tags: ["APAC", "Platform", "B2B"],
    description:
      "Build billing and invoicing products for APAC. High-autonomy role with global stakeholders.",
    source: "Company site",
  },
  {
    id: "j5",
    title: "Data Analyst",
    company: "PhonePe",
    logo: "P",
    logoBg: "#5b21b6",
    location: "Bangalore, India",
    work: "Hybrid",
    match: 84,
    salary: "₹22–35 LPA",
    posted: "3 hours ago",
    function: "Data",
    industry: "FinTech",
    tags: ["SQL", "Python", "Dashboards"],
    description:
      "Partner with product to measure funnel health and surface insights that move GMV.",
    source: "Indeed",
  },
  {
    id: "j6",
    title: "UX Designer",
    company: "CRED",
    logo: "C",
    logoBg: "#111111",
    location: "Bangalore, India",
    work: "Hybrid",
    match: 81,
    salary: "₹28–42 LPA",
    posted: "6 hours ago",
    function: "Design",
    industry: "FinTech",
    tags: ["Mobile", "Systems", "Research"],
    description:
      "Design credit and rewards experiences with obsessive craft. Strong visual and interaction skills required.",
    source: "Wellfound",
  },
  {
    id: "j7",
    title: "DevOps Engineer",
    company: "Freshworks",
    logo: "Fw",
    logoBg: "#22c55e",
    location: "Chennai / Remote",
    work: "Remote",
    match: 79,
    salary: "₹24–40 LPA",
    posted: "8 hours ago",
    function: "Technology",
    industry: "SaaS",
    tags: ["K8s", "AWS", "CI/CD"],
    description:
      "Own platform reliability for a global SaaS footprint. Automate everything that hurts twice.",
    source: "Company site",
  },
  {
    id: "j8",
    title: "Sales Manager",
    company: "HubSpot",
    logo: "H",
    logoBg: "#ff5c35",
    location: "Mumbai, India",
    work: "Hybrid",
    match: 76,
    salary: "₹30–48 LPA + variable",
    posted: "2 days ago",
    function: "Sales",
    industry: "SaaS",
    tags: ["Enterprise", "SaaS", "Pipeline"],
    description:
      "Build and coach a mid-market team selling the HubSpot platform across India.",
    source: "LinkedIn",
  },
  {
    id: "j9",
    title: "Marketing Lead",
    company: "Meesho",
    logo: "M",
    logoBg: "#ec4899",
    location: "Bangalore, India",
    work: "On-site",
    match: 74,
    salary: "₹32–50 LPA",
    posted: "2 days ago",
    function: "Marketing",
    industry: "E-commerce",
    tags: ["Performance", "Brand", "Growth"],
    description:
      "Lead performance + brand for a high-velocity consumer marketplace.",
    source: "Naukri",
  },
  {
    id: "j10",
    title: "Engineering Manager",
    company: "Atlassian",
    logo: "A",
    logoBg: "#2684ff",
    location: "Bengaluru / Remote",
    work: "Hybrid",
    match: 86,
    salary: "₹70–95 LPA",
    posted: "4 hours ago",
    function: "Technology",
    industry: "SaaS",
    tags: ["Leadership", "Jira", "Platform"],
    description:
      "Lead a platform team shipping developer tools used by millions. People-first, high bar.",
    source: "Company site",
  },
  {
    id: "j11",
    title: "Talent Acquisition Lead",
    company: "Google",
    logo: "G",
    logoBg: "#4285f4",
    location: "Hyderabad, India",
    work: "Hybrid",
    match: 83,
    salary: "₹45–70 LPA",
    posted: "1 day ago",
    function: "People / TA",
    industry: "AI / ML",
    tags: ["Leadership hiring", "TA ops", "DEI"],
    description:
      "Build hiring engines for AI and Cloud orgs. Partner with hiring managers on senior talent.",
    source: "LinkedIn",
  },
  {
    id: "j12",
    title: "Software Engineer",
    company: "Microsoft",
    logo: "M",
    logoBg: "#00a4ef",
    location: "Hyderabad, India",
    work: "Hybrid",
    match: 80,
    salary: "₹28–48 LPA",
    posted: "3 hours ago",
    function: "Technology",
    industry: "SaaS",
    tags: ["TypeScript", "Cloud", "Azure"],
    description:
      "Ship product features on a high-scale cloud platform. Strong CS fundamentals.",
    source: "Company site",
  },
];

export const LEARNING = [
  {
    id: "l1",
    title: "Product Strategy for High-Growth Markets",
    source: "Gotcha Academy",
    minutes: 42,
    tag: "Product",
  },
  {
    id: "l2",
    title: "ATS-proof CVs: keyword architecture",
    source: "CV Intelligence",
    minutes: 18,
    tag: "Career",
  },
  {
    id: "l3",
    title: "FinTech hiring signals in 2026",
    source: "Market Insights",
    minutes: 24,
    tag: "Market",
  },
  {
    id: "l4",
    title: "Stakeholder management for PMs",
    source: "AI Career Coach",
    minutes: 31,
    tag: "Skills",
  },
];

export const MARKET = [
  { label: "Product Manager", demand: 92, change: 8 },
  { label: "Data Analyst", demand: 88, change: 12 },
  { label: "DevOps Engineer", demand: 85, change: 6 },
  { label: "UX Designer", demand: 74, change: -2 },
  { label: "Sales Manager", demand: 79, change: 4 },
  { label: "TA Leadership", demand: 81, change: 9 },
];

export function scoreMatch(job: Job, skills: string[], title: string, industry: string) {
  let s = job.match;
  const t = title.toLowerCase();
  if (t && job.title.toLowerCase().includes(t.split(" ")[0] ?? "")) s += 2;
  if (industry && job.industry === industry) s += 3;
  const hits = skills.filter((sk) =>
    [...job.tags, job.title, job.description].join(" ").toLowerCase().includes(sk.toLowerCase()),
  ).length;
  s += Math.min(6, hits * 2);
  return Math.min(99, s);
}
