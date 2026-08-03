import { WalletCards } from "lucide-react";

import { duration } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";
import { ChartsGrid } from "./chart-shell";
import { DonutSummary } from "./donut-summary";
import { FreelancerWeeklyChart } from "./freelancer-weekly-chart";
import { useFreelancerChartData } from "./use-freelancer-chart-data";

export function FreelancerCharts({ entries, reportBillable }: { entries: TimeEntry[]; reportBillable: number }) {
  const { weekly, billing, allMinutes, ratio, hasWeeklyData } = useFreelancerChartData(entries, reportBillable);
  return (
    <ChartsGrid>
      <FreelancerWeeklyChart data={weekly} hasData={hasWeeklyData} />
      <DonutSummary
        icon={<WalletCards />}
        title="خلاصه صورتحساب"
        description="سهم زمان قابل‌صورتحساب از کل زمان پروژه‌ها"
        data={billing}
        ratio={ratio}
        ratioLabel="قابل صورتحساب"
        footerLabel="مجموع زمان پروژه‌ها"
        footerValue={duration(allMinutes)}
      />
    </ChartsGrid>
  );
}
