import { cn } from "@/lib/utils";

export function FathomMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("text-fg", className)} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.15" fill="currentColor" className="text-accent" />
    </svg>
  );
}
