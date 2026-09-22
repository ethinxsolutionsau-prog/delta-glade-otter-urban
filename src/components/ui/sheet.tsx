import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  side = "left",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-[var(--motion-fast)]" />
        <Dialog.Content
          className={cn(
            "fixed z-50 top-0 flex h-dvh w-[min(100%,20rem)] flex-col bg-surface border-border p-4 shadow-xl",
            "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)]",
            side === "left" ? "left-0 border-r" : "right-0 border-l",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-sm font-medium tracking-wide text-fg">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
