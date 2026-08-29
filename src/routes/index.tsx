import { createFileRoute } from "@tanstack/react-router";
import { ExperienceGate } from "@/components/ExperienceGate";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ExperienceGate />;
}
