import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  Pause,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { duration, entryMinutes, fa, money } from "@/lib/format";
import type { AppData, ReportFilter, TimeEntry, WorkRecord } from "@/lib/types";

import { ReportCharts } from "./report-charts";
import { ReportFilters } from "./report-filters";
import { ReportTable } from "./report-table";

type MonthStats = {
  worked: number;
  target: number;
  balance: number;
  breaks: number;
};

type ReportsPageProps = {
  data: AppData;
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  filters: ReportFilter;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilter>>;
  entries: TimeEntry[];
  reportBillable: number;
  reportIncome: number;
  exportReport: (kind: "excel" | "csv") => void;
};

export function ReportsPage({
  data,
  monthRecords,
  monthStats,
  filters,
  setFilters,
  entries,
  reportBillable,
  reportIncome,
  exportReport,
}: ReportsPageProps) {
  const mode = data.settings.mode;
  const isEmployee = mode === "employee";

  const totalProjectTime = entries.reduce(
    (sum, entry) => sum + entryMinutes(entry),
    0,
  );

  const nonBillableMinutes = Math.max(0, totalProjectTime - reportBillable);

  const overtimeMinutes = Math.max(0, monthStats.balance);

  const deficitMinutes = Math.max(0, -monthStats.balance);

  return (
    <>
      <PageHeading
        title={isEmployee ? "گزارش کارکرد و حقوق" : "گزارش کار و درآمد"}
        description={
          isEmployee
            ? "جمع‌بندی حضور، کارکرد، اضافه‌کاری، کسری و وضعیت این ماه."
            : "جمع‌بندی شفاف زمان، صورتحساب و عملکرد این ماه."
        }
      >
        <div className="flex items-center gap-2.5 max-[620px]:flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => exportReport("csv")}
          >
            <Download className="size-4" />
            خروجی CSV
          </Button>

          <Button type="button" onClick={() => exportReport("excel")}>
            <FileSpreadsheet className="size-4" />
            خروجی Excel
          </Button>
        </div>
      </PageHeading>

      <ReportFilters
        mode={mode}
        data={data}
        filters={filters}
        setFilters={setFilters}
      />

      {isEmployee ? (
        <>
          <section
            className={cn(
              "mb-4 grid grid-cols-4 gap-3",
              "max-[1180px]:grid-cols-2",
              "max-[620px]:grid-cols-1",
            )}
          >
            <MetricCard
              icon={<Clock3 />}
              label="کارکرد این ماه"
              value={duration(monthStats.worked)}
              suffix="ساعت"
              tone="blue"
            />

            <MetricCard
              icon={<BriefcaseBusiness />}
              label="ساعت موظفی"
              value={duration(monthStats.target)}
              suffix="ساعت"
            />

            <MetricCard
              icon={<CheckCircle2 />}
              label="اضافه‌کاری"
              value={duration(overtimeMinutes)}
              suffix="ساعت"
            />

            <MetricCard
              icon={<AlertTriangle />}
              label="کسری کار"
              value={duration(deficitMinutes)}
              suffix="ساعت"
              tone="amber"
            />
          </section>

          <section
            className={cn(
              "mb-4 grid grid-cols-3 gap-3",
              "max-[900px]:grid-cols-1",
            )}
          >
            <MetricCard
              icon={<Pause />}
              label="وقفه و استراحت"
              value={duration(monthStats.breaks)}
              suffix="ساعت"
              tone="amber"
            />

            <MetricCard
              icon={<TrendingUp />}
              label="تراز کارکرد"
              value={duration(monthStats.balance, true)}
              suffix="ساعت"
            />

            <MetricCard
              icon={<WalletCards />}
              label="روزهای ثبت‌شده"
              value={fa.format(monthRecords.length)}
              suffix="روز"
            />
          </section>
        </>
      ) : (
        <section
          className={cn(
            "mb-4 grid grid-cols-4 gap-3",
            "max-[1180px]:grid-cols-2",
            "max-[620px]:grid-cols-1",
          )}
        >
          <MetricCard
            icon={<Clock3 />}
            label="کل زمان"
            value={duration(monthStats.worked + totalProjectTime)}
            suffix="ساعت"
            tone="blue"
          />

          <MetricCard
            icon={<CheckCircle2 />}
            label="قابل صورتحساب"
            value={duration(reportBillable)}
            suffix="ساعت"
          />

          <MetricCard
            icon={<Pause />}
            label="غیرقابل صورتحساب"
            value={duration(nonBillableMinutes)}
            suffix="ساعت"
            tone="amber"
          />

          <MetricCard
            icon={<TrendingUp />}
            label="درآمد تخمینی"
            value={money(reportIncome)}
            suffix="تومان"
          />
        </section>
      )}

      <ReportCharts
        mode={mode}
        entries={entries}
        reportBillable={reportBillable}
        monthRecords={monthRecords}
        monthStats={monthStats}
        settings={data.settings}
      />

      <ReportTable
        mode={mode}
        data={data}
        entries={entries}
        monthRecords={monthRecords}
      />

      <section
        className={cn(
          "mt-4 flex items-center justify-between gap-4",
          "rounded-2xl border border-[#dfe7e9]",
          "bg-white/95 p-4",
          "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
          "max-[620px]:items-start",
        )}
      >
        <div className="grid gap-1">
          <strong className="text-sm font-extrabold text-[#173747]">
            {isEmployee
              ? "جمع‌بندی کارمندی این ماه"
              : "جمع‌بندی عملکرد این ماه"}
          </strong>

          <span className="text-[10px] leading-6 text-[#6c7d89]">
            {fa.format(monthRecords.length)} روز ثبت‌شده
            {" · "}
            هدف {duration(monthStats.target)}
            {" · "}
            کارکرد {duration(monthStats.worked)}
            {" · "}
            تراز {duration(monthStats.balance, true)}
          </span>
        </div>

        <span
          dir="ltr"
          className={cn(
            "shrink-0 text-lg font-black",
            monthStats.balance >= 0 ? "text-[#079b60]" : "text-[#e54845]",
          )}
        >
          {duration(monthStats.balance, true)}
        </span>
      </section>
    </>
  );
}
