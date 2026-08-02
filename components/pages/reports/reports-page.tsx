import { CheckCircle2, Clock3, Download, FileSpreadsheet, Pause, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa, money } from "@/lib/format";
import type { AppData, ReportFilter, TimeEntry, WorkRecord } from "@/lib/types";
import { ReportCharts } from "./report-charts";
import { ReportFilters } from "./report-filters";
import { ReportTable } from "./report-table";
import { cn } from "@/lib/cn";

export function ReportsPage({ data, monthRecords, monthStats, filters, setFilters, entries, reportBillable, reportIncome, exportReport }: {
  data: AppData;
  monthRecords: WorkRecord[];
  monthStats: { worked: number; target: number; balance: number; breaks: number };
  filters: ReportFilter;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilter>>;
  entries: TimeEntry[];
  reportBillable: number;
  reportIncome: number;
  exportReport: (kind: "excel" | "csv") => void;
}) {
  const totalProjectTime = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  return <>
    <PageHeading title="گزارش کار و درآمد" description="جمع‌بندی شفاف زمان، صورتحساب و عملکرد این ماه."><div className={cn("flex items-center gap-[9px] max-[620px]:flex-wrap")}><Button variant="outline" onClick={() => exportReport("csv")}><Download /> خروجی CSV</Button><Button onClick={() => exportReport("excel")}><FileSpreadsheet /> خروجی Excel</Button></div></PageHeading>
    <ReportFilters data={data} filters={filters} setFilters={setFilters} />
    <section className={cn("mb-[18px] grid gap-3", "grid-cols-4 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1")}><MetricCard icon={<Clock3 />} label="کل زمان" value={duration(monthStats.worked + totalProjectTime)} suffix="ساعت" tone="blue" /><MetricCard icon={<CheckCircle2 />} label="قابل صورتحساب" value={duration(reportBillable)} suffix="ساعت" /><MetricCard icon={<Pause />} label="غیرقابل صورتحساب" value={duration(Math.max(0, totalProjectTime - reportBillable))} suffix="ساعت" tone="amber" /><MetricCard icon={<TrendingUp />} label="درآمد تخمینی" value={money(reportIncome)} suffix="تومان" /></section>
    <ReportCharts entries={entries} reportBillable={reportBillable} />
    <ReportTable data={data} entries={entries} />
    <section className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "mt-[14px] flex items-center justify-between [&>div]:grid [&_span]:text-[10px] [&_span]:text-[#6c7d89] [&>span]:text-lg [&>span]:font-extrabold")}><div><strong>گزارش کارمندی این ماه</strong><span>{fa.format(monthRecords.length)} روز ثبت‌شده · هدف {duration(monthStats.target)} · کارکرد {duration(monthStats.worked)} · تراز {duration(monthStats.balance, true)}</span></div><span className={cn(monthStats.balance >= 0 ? "text-[#079b60]" : "text-[#e54845]")}>{duration(monthStats.balance, true)}</span></section>
  </>;
}
