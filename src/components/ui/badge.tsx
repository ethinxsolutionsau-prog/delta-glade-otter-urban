import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-border text-muted bg-elevated",
        accent: "border-accent/30 text-accent bg-accent/10",
        ok: "border-ok/30 text-ok bg-ok/10",
        warn: "border-warn/30 text-warn bg-warn/10",
        danger: "border-danger/30 text-danger bg-danger/10",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
