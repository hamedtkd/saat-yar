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
import { calculateMonthlyPayroll } from "@/lib/payroll";
import { calc } from "@/lib/time-engine";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
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
  financialsHidden: boolean;
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
  financialsHidden,
}: ReportsPageProps) {
  const mode = data.settings.mode;
  const isEmployee = mode === "employee";
  const visibleMonthStats = monthRecords.reduce((totals, record) => {
    const target = getDailyTargetMinutes(record.date, data.settings);
    const result = calc(record, target);
    totals.worked += result.worked;
    totals.target += record.holiday ? 0 : target;
    totals.balance += result.balance;
    totals.breaks += result.breakMinutes + result.unpaidLunchMinutes;
    return totals;
  }, { worked: 0, target: 0, balance: 0, breaks: 0 });
  const effectiveMonthStats = isEmployee ? visibleMonthStats : monthStats;

  const totalProjectTime = entries.reduce(
    (sum, entry) => sum + entryMinutes(entry),
    0,
  );

  const nonBillableMinutes = Math.max(0, totalProjectTime - reportBillable);

  const rawPositiveBalance = Math.max(0, effectiveMonthStats.balance);

  const deficitMinutes = Math.max(0, -effectiveMonthStats.balance);
  const holidayMinutes = monthRecords.reduce((sum, item) => {
    if (!item.holiday) return sum;
    return sum + calc(item, getDailyTargetMinutes(item.date, data.settings)).worked;
  }, 0);
  const overtimeMinutes = Math.max(0, rawPositiveBalance - holidayMinutes);
  const payroll = calculateMonthlyPayroll({
    monthlySalary: data.settings.salary,
    workedMinutes: effectiveMonthStats.worked,
    targetMinutes: effectiveMonthStats.target,
    overtimeMinutes,
    deficitMinutes,
    holidayMinutes,
    overtimeMultiplier: data.settings.overtimeMultiplier,
    holidayMultiplier: data.settings.holidayMultiplier,
    components: data.settings.payrollComponents,
  });
  const financialValue = (value: number) => financialsHidden ? "••••••" : money(value);

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
              value={duration(effectiveMonthStats.worked)}
              suffix="ساعت"
              tone="blue"
            />

            <MetricCard
              icon={<BriefcaseBusiness />}
              label="ساعت موظفی"
              value={duration(effectiveMonthStats.target)}
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
              value={duration(effectiveMonthStats.breaks)}
              suffix="ساعت"
              tone="amber"
            />

            <MetricCard
              icon={<TrendingUp />}
              label="تراز کارکرد"
              value={duration(effectiveMonthStats.balance, true)}
              suffix="ساعت"
            />

            <MetricCard
              icon={<WalletCards />}
              label="روزهای ثبت‌شده"
              value={fa.format(monthRecords.length)}
              suffix="روز"
            />
          </section>

          <section className="mb-4 rounded-2xl border border-[#dfe7e9] bg-white/95 p-5 shadow-[0_10px_35px_rgba(17,45,55,0.055)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="block text-sm font-extrabold text-[#173747]">فیش حقوقی تخمینی ماه</strong>
                <small className="text-[10px] leading-6 text-[#6c7d89]">مبالغ بر اساس کارکرد ثبت‌شده، ضرایب و آیتم‌های تنظیمات محاسبه می‌شوند.</small>
              </div>
              <span className="rounded-full bg-[#edf9f4] px-3 py-1.5 text-xs font-black text-[#079b60]">خالص: {financialValue(payroll.net)} تومان</span>
            </div>
            <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
              <div className="rounded-xl bg-[#f8fbfa] p-3"><span className="block text-[10px] text-[#6c7d89]">حقوق کارکرد</span><strong>{financialValue(payroll.regularPay)} تومان</strong></div>
              <div className="rounded-xl bg-[#f8fbfa] p-3"><span className="block text-[10px] text-[#6c7d89]">اضافه‌کاری</span><strong>{financialValue(payroll.overtimePay)} تومان</strong></div>
              <div className="rounded-xl bg-[#f8fbfa] p-3"><span className="block text-[10px] text-[#6c7d89]">تعطیل‌کاری</span><strong>{financialValue(payroll.holidayPay)} تومان</strong></div>
              <div className="rounded-xl bg-[#fff8ed] p-3"><span className="block text-[10px] text-[#8b6b31]">کسری کار</span><strong>{financialValue(payroll.deficitDeduction)} تومان</strong></div>
              <div className="rounded-xl bg-[#edf9f4] p-3"><span className="block text-[10px] text-[#527268]">مزایا</span><strong>{financialValue(payroll.earnings)} تومان</strong></div>
              <div className="rounded-xl bg-[#fff2f1] p-3"><span className="block text-[10px] text-[#8b5d59]">کسورات ثابت</span><strong>{financialValue(payroll.deductions)} تومان</strong></div>
              <div className="rounded-xl bg-[#f8fbfa] p-3"><span className="block text-[10px] text-[#6c7d89]">ناخالص</span><strong>{financialValue(payroll.gross)} تومان</strong></div>
              <div className="rounded-xl bg-[#102a3a] p-3 text-white"><span className="block text-[10px] text-white/70">خالص پرداختی</span><strong>{financialValue(payroll.net)} تومان</strong></div>
            </div>
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
            value={duration(effectiveMonthStats.worked + totalProjectTime)}
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
            value={financialValue(reportIncome)}
            suffix="تومان"
          />
        </section>
      )}

      <ReportCharts
        mode={mode}
        entries={entries}
        reportBillable={reportBillable}
        monthRecords={monthRecords}
        monthStats={effectiveMonthStats}
        settings={data.settings}
      />

      <ReportTable
        mode={mode}
        data={data}
        entries={entries}
        monthRecords={monthRecords}
        financialsHidden={financialsHidden}
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
            هدف {duration(effectiveMonthStats.target)}
            {" · "}
            کارکرد {duration(effectiveMonthStats.worked)}
            {" · "}
            تراز {duration(effectiveMonthStats.balance, true)}
          </span>
        </div>

        <span
          dir="ltr"
          className={cn(
            "shrink-0 text-lg font-black",
            effectiveMonthStats.balance >= 0 ? "text-[#079b60]" : "text-[#e54845]",
          )}
        >
          {duration(effectiveMonthStats.balance, true)}
        </span>
      </section>
    </>
  );
}
