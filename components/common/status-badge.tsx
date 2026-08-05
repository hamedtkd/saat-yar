import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatusBadge({ children, success = false }: { children: ReactNode; success?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-lg border px-[9px] py-1 text-[10px] font-semibold",
      "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]",
      success && "border-[color-mix(in_srgb,var(--success)_28%,var(--border))] bg-[var(--success-soft)] text-[var(--success)]",
    )}>
      {children}
    </span>
  );
}
