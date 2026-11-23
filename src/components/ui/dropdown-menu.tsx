import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-48 rounded-md border border-border bg-surface p-1 shadow-lg outline-none",
          "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
          "origin-[var(--radix-dropdown-menu-content-transform-origin)]",
          "transition-[opacity,transform] duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "flex min-h-10 cursor-pointer items-center gap-2 rounded-sm px-2.5 text-sm text-fg outline-none",
        "data-[highlighted]:bg-elevated",
        className,
      )}
      {...props}
    />
  );
}
