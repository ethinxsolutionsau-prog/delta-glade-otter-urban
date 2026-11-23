import { ChevronDown, Copy, Download, FileCode, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportHtml, exportJson, exportMarkdown, toMarkdown } from "@/lib/osint/report";
import { copyText } from "@/lib/utils";
import type { CaseRecord } from "@/lib/osint/types";

export function ExportMenu({ record }: { record: CaseRecord }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Export dossier">
          <Download className="size-3.5" />
          Export
          <ChevronDown className="size-3.5 text-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => {
            exportMarkdown(record);
            toast.success("Markdown report downloaded");
          }}
        >
          <FileText className="size-3.5 text-muted" />
          Markdown report
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            exportHtml(record);
            toast.success("HTML report downloaded");
          }}
        >
          <FileCode className="size-3.5 text-muted" />
          HTML report
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            exportJson(record);
            toast.success("JSON case file downloaded");
          }}
        >
          <Download className="size-3.5 text-muted" />
          JSON case file
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            void copyText(toMarkdown(record)).then(
              () => toast.success("Report copied"),
              () => toast.error("Could not copy"),
            );
          }}
        >
          <Copy className="size-3.5 text-muted" />
          Copy markdown
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => window.print()}>
          <Printer className="size-3.5 text-muted" />
          Print / save PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
