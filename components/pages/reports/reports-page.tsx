import { CheckCircle2, Clock3, Download, FileSpreadsheet, Pause, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa, money } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData, ReportFilter, TimeEntry, WorkRecord } from "@/lib/types";
import { ReportCharts } from "./report-charts";
import { ReportFilters } from "./report-filters";
import { ReportTable } from "./report-table";

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
    <PageHeading title="گزارش کار و درآمد" description="جمع‌بندی شفاف زمان، صورتحساب و عملکرد این ماه."><div className={tw("row-actions")}><Button variant="outline" onClick={() => exportReport("csv")}><Download /> خروجی CSV</Button><Button onClick={() => exportReport("excel")}><FileSpreadsheet /> خروجی Excel</Button></div></PageHeading>
    <ReportFilters data={data} filters={filters} setFilters={setFilters} />
    <section className={tw("metric-grid", "four")}><MetricCard icon={<Clock3 />} label="کل زمان" value={duration(monthStats.worked + totalProjectTime)} suffix="ساعت" tone="blue" /><MetricCard icon={<CheckCircle2 />} label="قابل صورتحساب" value={duration(reportBillable)} suffix="ساعت" /><MetricCard icon={<Pause />} label="غیرقابل صورتحساب" value={duration(Math.max(0, totalProjectTime - reportBillable))} suffix="ساعت" tone="amber" /><MetricCard icon={<TrendingUp />} label="درآمد تخمینی" value={money(reportIncome)} suffix="تومان" /></section>
    <ReportCharts entries={entries} reportBillable={reportBillable} />
    <ReportTable data={data} entries={entries} />
    <section className={tw("panel", "employee-report")}><div><strong>گزارش کارمندی این ماه</strong><span>{fa.format(monthRecords.length)} روز ثبت‌شده · هدف {duration(monthStats.target)} · کارکرد {duration(monthStats.worked)} · تراز {duration(monthStats.balance, true)}</span></div><span className={tw(monthStats.balance >= 0 ? "positive" : "negative")}>{duration(monthStats.balance, true)}</span></section>
  </>;
}
