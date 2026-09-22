import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/desk";

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>) => ({
    q: typeof raw.q === "string" ? raw.q : undefined,
  }),
  component: Home,
});

function Home() {
  const { q } = Route.useSearch();
  return <Desk initialQuery={q} />;
}
