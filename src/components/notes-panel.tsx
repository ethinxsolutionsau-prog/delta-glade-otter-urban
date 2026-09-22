import { Download, FileText, Loader2, Printer, ScanText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCaseStore } from "@/lib/cases/store";
import { runBrief } from "@/lib/osint/run";
import { toMarkdown } from "@/lib/osint/report";
import type { CaseRecord } from "@/lib/osint/types";

export function NotesPanel({ record }: { record: CaseRecord }) {
  const setNotes = useCaseStore((s) => s.setNotes);

  function exportMd() {
    const blob = new Blob([toMarkdown(record)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={exportMd}>
            <FileText className="size-3.5" />
            MD
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <Download className="size-3.5" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5" />
            Print
          </Button>
        </div>
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
