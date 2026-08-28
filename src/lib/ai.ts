import { createServerFn } from "@tanstack/react-start";

const SYSTEM = "You are Gotcha AI Career Agent, a concise global career operating system. Convert a professional's goal into concrete next actions. Use the supplied profile and opportunity context. Never invent job facts. Explain match, gaps, preparation, application priority, and follow-up. Be practical and direct.";

export const askGotcha = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; system?: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };
    const res = await fetch("https://api.x.ai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "grok-4.5", max_tokens: 700, messages: [{ role: "system", content: data.system ?? SYSTEM }, { role: "user", content: data.prompt.slice(0, 6000) }] }) });
    if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });

export const careerAgent = createServerFn({ method: "POST" })
  .validator((input: { goal: string; profile: { name: string; title: string; location: string; skills: string[]; targetRoles?: string[]; targetCountries?: string[]; salaryGoal?: string; careerGoal?: string }; opportunities?: { title: string; company: string; location: string; match: number; salary: string }[] }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };
    const context = JSON.stringify({ profile: data.profile, opportunities: data.opportunities ?? [] });
    const prompt = `Career objective: ${data.goal}\n\nCurrent context:\n${context}\n\nReturn: 1) recommendation, 2) top priorities, 3) gaps, 4) application/interview action plan, 5) follow-up timing. Keep it under 500 words.`;
    const res = await fetch("https://api.x.ai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "grok-4.5", max_tokens: 800, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }] }) });
    if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });

const CV_SYSTEM =
  "You are Gotcha CV Intelligence. Analyze a CV against a job description and respond ONLY in this exact structured format, nothing before or after it:\nSCORE: <integer 0-100>\nMATCHED: <comma-separated keywords found in both, max 8>\nMISSING: <comma-separated important JD keywords absent from the CV, max 8>\nSUGGESTIONS:\n- <rewritten bullet 1, specific and quantified>\n- <rewritten bullet 2>\n- <rewritten bullet 3>";

export const cvAnalyze = createServerFn({ method: "POST" })
  .validator((input: { cvText: string; jobText: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };
    const prompt = `CV:\n${data.cvText.slice(0, 4000)}\n\nJob description:\n${data.jobText.slice(0, 3000)}`;
    const res = await fetch("https://api.x.ai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "grok-4.5", max_tokens: 500, messages: [{ role: "system", content: CV_SYSTEM }, { role: "user", content: prompt }] }) });
    if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .validator((input: { cvText: string; jobText: string; jobTitle?: string; company?: string; tone?: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };
    const system = "You are Gotcha Cover Letter Writer. Write a concise, specific, non-generic cover letter (under 300 words) that connects the candidate's real CV experience to the job description. No placeholders like [Company Name] — use the details given. Plain prose, no markdown headers.";
    const prompt = `CV:\n${data.cvText.slice(0, 4000)}\n\nJob (${data.jobTitle ?? "role"} at ${data.company ?? "the company"}):\n${data.jobText.slice(0, 3000)}\n\nTone: ${data.tone ?? "professional and confident"}`;
    const res = await fetch("https://api.x.ai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "grok-4.5", max_tokens: 500, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }) });
    if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });
