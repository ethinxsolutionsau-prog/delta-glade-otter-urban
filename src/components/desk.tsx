import { useEffect, useRef, useState } from "react";
import exifr from "exifr";
import { FolderOpen, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { CaseRail } from "@/components/case-rail";
import { CommandBar } from "@/components/command-bar";
import { Dossier } from "@/components/dossier";
import { EmptyDesk } from "@/components/empty-desk";
import { FathomMark } from "@/components/fathom-mark";
import { NotesPanel } from "@/components/notes-panel";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useActiveCase, useCaseStore } from "@/lib/cases/store";
import { runInvestigation } from "@/lib/osint/run";
import type { ImageIntel } from "@/lib/osint/types";

async function readExif(file: File): Promise<ImageIntel> {
  const parsed = (await exifr.parse(file, { gps: true })) as Record<string, unknown> | undefined;
  const gps =
    typeof parsed?.latitude === "number" && typeof parsed?.longitude === "number"
      ? { lat: parsed.latitude, lon: parsed.longitude }
      : undefined;
  let width: number | undefined;
  let height: number | undefined;
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file);
      width = bmp.width;
      height = bmp.height;
      bmp.close();
    } catch {
      /* ignore */
    }
  }
  return {
    fileName: file.name,
    mime: file.type,
    width,
    height,
    make: typeof parsed?.Make === "string" ? parsed.Make : undefined,
    model: typeof parsed?.Model === "string" ? parsed.Model : undefined,
    software: typeof parsed?.Software === "string" ? parsed.Software : undefined,
    dateOriginal:
      parsed?.DateTimeOriginal instanceof Date
        ? parsed.DateTimeOriginal.toISOString()
        : typeof parsed?.DateTimeOriginal === "string"
          ? parsed.DateTimeOriginal
          : undefined,
    lens: typeof parsed?.LensModel === "string" ? parsed.LensModel : undefined,
    gps,
    localOnly: true,
  };
}

export function Desk({ initialQuery }: { initialQuery?: string }) {
  const hydrated = useCaseStore((s) => s.hasHydrated);
  const active = useActiveCase();
  const [casesOpen, setCasesOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const ranQuery = useRef(false);

  useEffect(() => {
    if (hydrated) return;
    const t = window.setTimeout(() => {
      if (!useCaseStore.getState().hasHydrated) useCaseStore.getState().setHasHydrated(true);
    }, 80);
    return () => window.clearTimeout(t);
  }, [hydrated]);

  useEffect(() => {
    if (!initialQuery || !hydrated || ranQuery.current) return;
    ranQuery.current = true;
    void runInvestigation(initialQuery).catch((e) => {
      toast.error(e instanceof Error ? e.message : "Investigation failed");
    });
  }, [hydrated, initialQuery]);

  async function onDrop(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const intel = await readExif(file);
      await runInvestigation(file.name.replace(/\.[^.]+$/, ""), { image: intel });
      toast.success("EXIF extracted locally");
    } catch {
      toast.error("Could not read that image");
    }
  }

  return (
    <div
      className="flex min-h-dvh flex-col bg-bg text-fg"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        void onDrop(e.dataTransfer.files);
      }}
    >
      <header className="no-print sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open cases"
            onClick={() => setCasesOpen(true)}
          >
            <FolderOpen className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <FathomMark className="size-6" />
            <span className="hidden font-medium tracking-tight sm:inline">Fathom</span>
          </div>
          <div className="min-w-0 flex-1">
            {active ? <CommandBar compact /> : null}
          </div>
          {active ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="xl:hidden"
              aria-label="Open notes"
              onClick={() => setNotesOpen(true)}
            >
              <StickyNote className="size-4" />
            </Button>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="no-print hidden w-64 shrink-0 border-r border-border p-4 lg:block">
          <CaseRail />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
          {!hydrated ? (
            <div className="px-6 py-16 text-sm text-muted">Restoring cases…</div>
          ) : active ? (
            <Dossier record={active} />
          ) : (
            <EmptyDesk />
          )}
        </main>
        {active ? (
          <aside className="no-print hidden w-80 shrink-0 border-l border-border p-4 xl:block">
            <NotesPanel record={active} />
          </aside>
        ) : null}
      </div>

      <Sheet open={casesOpen} onOpenChange={setCasesOpen} title="Cases" side="left">
        <CaseRail />
      </Sheet>
      {active ? (
        <Sheet open={notesOpen} onOpenChange={setNotesOpen} title="Notes" side="right">
          <NotesPanel record={active} />
        </Sheet>
      ) : null}

      <input
        type="file"
        accept="image/*"
        className="sr-only"
        id="exif-file"
        onChange={(e) => {
          void onDrop(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
