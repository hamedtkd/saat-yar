
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
        "rounded-xl border border-[#e7efed]",
        "bg-[#f8fbfa] px-3 py-3",
        className,
      )}
    >
      <div className="min-w-0">
        <span className="block text-[10px] font-medium text-[#6c7d89]">
          {label}
        </span>

        {hint && (
          <small className="mt-1 block text-[9px] leading-5 text-[#91a0a7]">
            {hint}
          </small>
        )}
      </div>

      <strong
        className={cn(
          "shrink-0 text-sm font-extrabold text-[#102a3a]",
          valueClassName,
        )}
      >
        {value}
      </strong>
    </div>
  );
}