"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  onCheckedChange?: (checked: boolean) => void;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => (
    <span className={cn("relative inline-grid size-4.5 shrink-0 place-items-center", className)}>
      <input
        ref={ref}
        type="checkbox"
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className="peer absolute inset-0 size-4.5 cursor-pointer appearance-none rounded-[5px] border border-[var(--border)] bg-[var(--surface-1)] shadow-[inset_0_1px_1px_rgb(0_0_0_/_4%)] transition-colors checked:border-[var(--accent)] checked:bg-[var(--accent)] hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)] disabled:cursor-not-allowed disabled:opacity-45"
        {...props}
      />
      <Check aria-hidden="true" className="pointer-events-none size-2.5 scale-75 stroke-[3.2] text-[var(--accent-foreground)] opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100" />
    </span>
  ),
);
Checkbox.displayName = "Checkbox";
