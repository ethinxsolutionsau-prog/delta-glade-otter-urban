import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { classify, typeLabel } from "@/lib/osint/classify";
import { runInvestigation } from "@/lib/osint/run";
import { cn } from "@/lib/utils";

export function CommandBar({ initialQuery, compact }: { initialQuery?: string; compact?: boolean }) {
  const [value, setValue] = useState(initialQuery ?? "");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const classified = classify(value);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (initialQuery) setValue(initialQuery);
  }, [initialQuery]);

  async function submit() {
    if (!value.trim() || busy) return;
    if (classified.type === "unknown") {
      toast.error("Could not classify that input. Try a username, email, domain, IP, URL, phone, hash, or wallet.");
      return;
    }
    setBusy(true);
    try {
      await runInvestigation(value);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Investigation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Username, email, domain, IP, URL, phone, hash…"
            className="pl-10 pr-24 font-mono"
            autoComplete="off"
            spellCheck={false}
            aria-label="Investigate"
          />
          {value && classified.type !== "unknown" ? (
            <Badge
              variant="accent"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {typeLabel(classified.type)}
            </Badge>
          ) : null}
        </div>
        <Button type="submit" disabled={busy || !value.trim()} className="min-w-20">
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Run"}
        </Button>
      </div>
      {compact ? null : (
      <p className={cn("px-1 font-mono text-xs text-subtle", classified.type === "unknown" && value && "text-warn")}>
        {value
          ? classified.type === "unknown"
            ? "Unrecognized. Paste a public identifier."
            : `Will collect ${typeLabel(classified.type).toLowerCase()} intelligence for ${classified.normalized}`
          : "Press / to focus. Public sources only."}
      </p>
      )}
    </form>
  );
}
