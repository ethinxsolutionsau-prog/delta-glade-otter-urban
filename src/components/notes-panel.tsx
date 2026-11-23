import { Loader2, ScanText } from "lucide-react";
import { toast } from "sonner";
import { ExportMenu } from "@/components/export-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCaseStore } from "@/lib/cases/store";
import { runBrief } from "@/lib/osint/run";
import type { CaseRecord } from "@/lib/osint/types";

export function NotesPanel({ record }: { record: CaseRecord }) {
  const setNotes = useCaseStore((s) => s.setNotes);

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle">Notes</p>
        <Textarea
          value={record.notes}
          onChange={(e) => setNotes(record.id, e.target.value)}
          placeholder="Working notes stay on this device."
          className="min-h-36"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            void runBrief(record.id).then(() => {
              const latest = useCaseStore.getState().cases.find((c) => c.id === record.id);
              if (latest?.briefStatus === "error") toast.error(latest.briefError ?? "Brief failed");
            });
          }}
          disabled={record.briefStatus === "loading"}
        >
          {record.briefStatus === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ScanText className="size-4" />
          )}
          Analyst brief
        </Button>
        <ExportMenu record={record} />
      </div>
      {record.brief ? (
        <article className="rounded-lg border border-border bg-elevated p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle">Brief</p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-fg">{record.brief}</pre>
        </article>
      ) : record.briefStatus === "error" ? (
        <p className="text-sm text-danger">{record.briefError}</p>
      ) : null}
    </div>
  );
}
