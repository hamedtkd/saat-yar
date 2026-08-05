import { SummaryRow } from "@/components/common/summary-row";
import { duration } from "@/lib/format";
import type { WeeklyChartItem } from "./types";

type WeeklySummaryProps = {
  totalMinutes: number;
  averageMinutes: number;
  bestDay: WeeklyChartItem | null;
};

export function WeeklySummary({
  totalMinutes,
  averageMinutes,
  bestDay,
}: WeeklySummaryProps) {
  return (
    <div className="mt-3 grid gap-2">
      <SummaryRow
        label="مجموع هفته"
        value={duration(totalMinutes)}
        valueClassName="tabular-nums"
      />
      <SummaryRow
        label="میانگین روزانه"
        value={duration(averageMinutes)}
        valueClassName="tabular-nums"
      />
      <SummaryRow
        label="بیشترین کارکرد"
        hint={bestDay?.dayFull}
        value={bestDay ? duration(bestDay.minutes) : "—"}
        valueClassName="tabular-nums"
      />
    </div>
  );
}
