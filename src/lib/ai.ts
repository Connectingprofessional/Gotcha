import { createServerFn } from "@tanstack/react-start";

export const askGotcha = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; system?: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment" };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              data.system ??
              "You are the Gotcha AI Career Coach. Be concise, practical, and specific. Help with job search, Boolean strings, CV match, and career strategy. No fluff.",
          },
          { role: "user", content: data.prompt.slice(0, 4000) },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });
