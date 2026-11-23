import { formatDistanceToNow } from "date-fns";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCaseStore } from "@/lib/cases/store";
import { typeLabel } from "@/lib/osint/classify";
import { exportAllCases } from "@/lib/osint/report";
import { cn } from "@/lib/utils";

export function CaseRail() {
  const cases = useCaseStore((s) => s.cases);
  const activeId = useCaseStore((s) => s.activeId);
  const setActive = useCaseStore((s) => s.setActive);
  const openNew = useCaseStore((s) => s.openNew);
  const remove = useCaseStore((s) => s.remove);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">Cases</p>
        <div className="flex items-center">
          {cases.length > 0 ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Export all cases"
              onClick={() => {
                exportAllCases(cases);
                toast.success("All cases downloaded");
              }}
            >
              <Download className="size-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon-sm" onClick={openNew} aria-label="New investigation">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
        {cases.length === 0 ? (
          <p className="text-sm text-muted">No saved cases yet. Run an investigation to start a dossier.</p>
        ) : (
          cases.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-start gap-2 rounded-md border px-3 py-2.5 transition-colors duration-[var(--motion-quick)]",
                c.id === activeId
                  ? "border-border bg-elevated"
                  : "border-transparent hover:bg-elevated/70",
              )}
            >
              <button
                type="button"
                className="min-h-11 min-w-0 flex-1 text-left"
                onClick={() => setActive(c.id)}
              >
                <p className="truncate font-mono text-sm text-fg">{c.query}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge>{typeLabel(c.type)}</Badge>
                  <span className="text-xs text-subtle tabular-nums">
                    {formatDistanceToNow(c.updatedAt, { addSuffix: true })}
                  </span>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100"
                aria-label={`Delete ${c.query}`}
                onClick={() => remove(c.id)}
              >
                <Trash2 className="size-3.5 text-muted" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
