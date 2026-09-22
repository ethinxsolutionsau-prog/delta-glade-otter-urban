import { CommandBar } from "@/components/command-bar";
import { FathomMark } from "@/components/fathom-mark";
import { Button } from "@/components/ui/button";
import { runInvestigation } from "@/lib/osint/run";

const SAMPLES = [
  { label: "torvalds", hint: "username" },
  { label: "cloudflare.com", hint: "domain" },
  { label: "1.1.1.1", hint: "IP" },
  { label: "https://github.com", hint: "URL" },
];

export function EmptyDesk() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <FathomMark className="mb-6 size-12" />
      <h1 className="font-sans text-4xl font-medium tracking-tight text-fg sm:text-5xl">Fathom</h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
        Public-source intelligence desk. Classify an identifier, collect DNS, RDAP, certificates, profiles, and
        infrastructure, then brief the dossier.
      </p>
      <div className="mt-8 w-full text-left">
        <CommandBar />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SAMPLES.map((s) => (
          <Button
            key={s.label}
            variant="outline"
            size="sm"
            className="font-mono"
            onClick={() => void runInvestigation(s.label)}
          >
            {s.label}
            <span className="text-subtle">{s.hint}</span>
          </Button>
        ))}
      </div>
      <p className="mt-10 max-w-sm text-xs leading-relaxed text-subtle">
        Queries public registries and profile URLs only. No port scans, no credential stuffing, no paid breach dumps.
        Cases stay in this browser. Drop a photo to read EXIF locally.
      </p>
      <label htmlFor="exif-file" className="mt-4 cursor-pointer text-sm text-accent hover:underline">
        Read image EXIF
      </label>
    </div>
  );
}
