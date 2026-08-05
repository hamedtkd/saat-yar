import { SurfaceCard } from "@/components/common/surface-card";
import { cn } from "@/lib/cn";
import { duration, fa } from "@/lib/format";

import type { MonthStats } from "./types";

type MonthSummaryProps = {
  isEmployee: boolean;
  recordCount: number;
  stats: MonthStats;
};

export function MonthSummary({ isEmployee, recordCount, stats }: MonthSummaryProps) {
  return (
    <SurfaceCard as="section" className="mt-4 flex items-center justify-between gap-4 p-4 max-[620px]:items-start">
      <div className="grid gap-1">
        <strong className="text-sm font-extrabold text-[#173747]">
          {isEmployee ? "جمع‌بندی کارمندی این ماه" : "جمع‌بندی عملکرد این ماه"}
        </strong>
        <span className="text-[10px] leading-6 text-[#6c7d89]">
          {fa.format(recordCount)} روز ثبت‌شده · هدف {duration(stats.target)} · کارکرد {duration(stats.worked)} · تراز {duration(stats.balance, true)}
        </span>
      </div>
      <span
        dir="ltr"
        className={cn("shrink-0 text-lg font-black", stats.balance >= 0 ? "text-[#079b60]" : "text-[#e54845]")}
      >
        {duration(stats.balance, true)}
      </span>
    </SurfaceCard>
  );
}
