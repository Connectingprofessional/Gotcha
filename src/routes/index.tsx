import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/App";
import { GotchaCommandCenter } from "@/components/GotchaCommandCenter";
import { GlobalCareerModules } from "@/components/GlobalCareerModules";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [open, setOpen] = useState(false);
  return <>
    <App />
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card px-4 py-3 text-sm font-semibold text-fg shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-card-2" aria-label="Open Gotcha 2.0 Career Command Center"><Sparkles className="size-4 text-primary-3" /> Gotcha 2.0</button>
    {open && <div className="fixed inset-0 z-50 overflow-auto bg-bg"><button type="button" onClick={() => setOpen(false)} className="fixed right-4 top-4 z-[60] inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted shadow-lg hover:text-fg" aria-label="Close Gotcha 2.0"><X className="size-5" /></button><div className="pb-12"><GotchaCommandCenter /><div className="mx-auto max-w-7xl px-4 md:px-8"><GlobalCareerModules /></div></div></div>}
  </>;
}
