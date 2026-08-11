"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";

type MonthBalanceBadgeProps = { balance: number; compact?: boolean };

export function MonthBalanceBadge({ balance, compact = false }: MonthBalanceBadgeProps) {
  const { duration } = useLocaleUi();
  return (
    <span
      dir="ltr"
      className={cn(
        "font-extrabold",
        compact ? "text-sm" : "inline-flex min-w-20 items-center justify-center rounded-full px-2.5 py-1.5 text-[10px]",
        balance >= 0
          ? compact ? "text-[var(--success)]" : "bg-[var(--success-soft)] text-[var(--success)]"
          : compact ? "text-[var(--danger)]" : "bg-[var(--danger-soft)] text-[var(--danger)]",
      )}
    >
      {duration(balance, true)}
    </span>
  );
}
