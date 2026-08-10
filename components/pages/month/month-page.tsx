"use client";

import { BarChart3, CalendarRange, CheckCircle2, Clock3, Coffee, Download, ListChecks, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { exportCsv } from "@/lib/exporters";
import { calc } from "@/lib/time-engine";
import { shiftJalaliMonth } from "@/lib/format";
import type { AppData, WorkRecord } from "@/lib/types";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import { MonthCalendar } from "./month-calendar";
import { MonthDayDetails } from "./month-day-details";
import { MonthTable } from "./month-table";
import { WeeklyChart } from "./weekly-chart";

export function MonthPage({ data, selectedDate, setSelectedDate, monthRecords, monthStats }: {
  data: AppData;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  monthRecords: WorkRecord[];
  monthStats: { worked: number; target: number; balance: number; breaks: number };
}) {
  const { t, duration, date, number } = useLocaleUi();
  const weekValues = Array.from({ length: 7 }, (_, weekday) => monthRecords
    .filter((item) => (new Date(`${item.date}T12:00:00`).getDay() + 1) % 7 === weekday)
    .reduce((sum, item) => sum + calc(item, getDailyTargetMinutes(item.date, data.settings)).worked, 0));

  function exportMonth() {
    exportCsv(
      t("month.exportFilename", { month: selectedDate.slice(0, 7) }),
      [t("month.csv.date"), t("common.clockIn"), t("common.clockOut"), t("common.netWorked"), t("common.break"), t("common.balance"), t("common.note")],
      monthRecords.map((item) => {
        const result = calc(item, getDailyTargetMinutes(item.date, data.settings));
        return [date(item.date), item.start || "—", item.end || "—", result.worked, result.breakMinutes + item.lunchMinutes, result.balance, item.note];
      }),
    );
  }

  return <>
    <PageHeading title={t("month.title")} description={t("month.description")}>
      <Button variant="outline" onClick={exportMonth}><Download /> {t("common.exportCsv")}</Button>
      <JalaliDatePicker value={selectedDate} onChange={setSelectedDate} recordedDates={Object.keys(data.records)} mode={data.settings.mode} includeOfficialHolidays={data.settings.autoOfficialHolidays} includeWeeklyHoliday={data.settings.autoWeeklyHoliday} />
    </PageHeading>

    <section className="mb-5 grid grid-cols-4 gap-3.5 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      <MetricCard icon={<Clock3 />} label={t("common.targetHours")} value={duration(monthStats.target)} suffix={t("common.hour")} tone="blue" />
      <MetricCard icon={<CheckCircle2 />} label={t("month.metrics.actual")} value={duration(monthStats.worked)} suffix={t("common.hour")} />
      <MetricCard icon={<TrendingUp />} label={monthStats.balance >= 0 ? t("common.overtime") : t("common.deficit")} value={duration(monthStats.balance, true)} suffix={t("common.hour")} tone={monthStats.balance >= 0 ? "green" : "amber"} />
      <MetricCard icon={<Coffee />} label={t("month.details.rest")} value={duration(monthStats.breaks)} suffix={t("common.hour")} tone="purple" />
    </section>

    <section className="mb-5">
      <SectionHeading icon={<CalendarRange />} eyebrow={t("month.section.overviewEyebrow")} title={t("month.section.overviewTitle")} description={t("month.section.overviewDescription")} trailing={<span className="rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-1.5 text-[9px] font-bold text-[var(--text-muted)]">{t("month.calendar.withRecords", { count: number(monthRecords.length) })}</span>} />
      <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(300px,.45fr)] gap-4 max-[980px]:grid-cols-1">
        <MonthCalendar data={data} selectedDate={selectedDate} setSelectedDate={setSelectedDate} monthRecordCount={monthRecords.length} moveMonth={(amount) => setSelectedDate(shiftJalaliMonth(selectedDate, amount))} />
        <WeeklyChart values={weekValues} />
      </div>
    </section>

    <section className="mb-5">
      <SectionHeading icon={<ListChecks />} eyebrow={t("month.section.selectedEyebrow")} title={t("month.section.selectedTitle")} description={t("month.section.selectedDescription")} />
      <MonthDayDetails data={data} selectedDate={selectedDate} />
    </section>

    <section className="mb-5">
      <SectionHeading icon={<BarChart3 />} eyebrow={t("month.section.recordsEyebrow")} title={t("month.section.recordsTitle")} description={t("month.section.recordsDescription")} />
      <MonthTable records={monthRecords} settings={data.settings} onEdit={setSelectedDate} />
    </section>
  </>;
}
