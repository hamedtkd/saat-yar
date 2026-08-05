import { cn } from "@/lib/cn";
import { duration } from "@/lib/format";

type MonthBalanceBadgeProps = {
  balance: number;
  compact?: boolean;
};

export function MonthBalanceBadge({
  balance,
  compact = false,
}: MonthBalanceBadgeProps) {
  return (
    <span
      dir="ltr"
      className={cn(
        "font-extrabold",
        compact
          ? "text-sm"
          : "inline-flex min-w-20 items-center justify-center rounded-full px-2.5 py-1.5 text-[10px]",
        balance >= 0
          ? compact
            ? "text-[#079b60]"
            : "bg-[#edf9f4] text-[#079b60]"
          : compact
            ? "text-[#e54845]"
            : "bg-[#fff1f0] text-[#e54845]",
      )}
    >
      {duration(balance, true)}
    </span>
  );
}
