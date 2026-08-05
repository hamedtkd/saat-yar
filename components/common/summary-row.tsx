
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SummaryRowProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
  valueClassName?: string;
};

export function SummaryRow({
  label,
  value,
  hint,
  className,
  valueClassName,
}: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center justify-between gap-4",
        "rounded-xl border border-[var(--border)]",
        "bg-[var(--surface-2)] px-3 py-3",
        className,
      )}
    >
      <div className="min-w-0">
        <span className="block text-[10px] font-medium text-[var(--text-muted)]">
          {label}
        </span>

        {hint && (
          <small className="mt-1 block text-[9px] leading-5 text-[var(--text-muted)]/75">
            {hint}
          </small>
        )}
      </div>

      <strong
        className={cn(
          "shrink-0 text-sm font-extrabold text-[var(--text)]",
          valueClassName,
        )}
      >
        {value}
      </strong>
    </div>
  );
}