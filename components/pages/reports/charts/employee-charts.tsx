import { BriefcaseBusiness } from "lucide-react";

import { duration } from "@/lib/format";
import type { Settings, WorkRecord } from "@/lib/types";
import { ChartsGrid } from "./chart-shell";
import { DonutSummary } from "./donut-summary";
import { EmployeeDailyChart } from "./employee-daily-chart";
import type { MonthStats } from "./types";
import { useEmployeeChartData } from "./use-employee-chart-data";

export function EmployeeCharts({ monthRecords, monthStats, settings }: {
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  settings: Settings;
}) {
  const { daily, performance, ratio } = useEmployeeChartData(monthRecords, monthStats, settings);
  return (
    <ChartsGrid>
      <EmployeeDailyChart data={daily} />
      <DonutSummary
        icon={<BriefcaseBusiness />}
        title="وضعیت کارکرد ماه"
        description="نسبت کارکرد ثبت‌شده به ساعت موظفی ماه"
        data={performance}
        ratio={ratio}
        ratioLabel="تحقق موظفی"
        footerLabel="تراز نهایی ماه"
        footerValue={duration(monthStats.balance, true)}
        footerTone={monthStats.balance >= 0 ? "positive" : "negative"}
      />
    </ChartsGrid>
  );
}
