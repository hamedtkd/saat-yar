import { BarChart3, CalendarRange, CheckCircle2, Clock3, Coffee, Download, ListChecks, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeading } from "@/components/common/page-heading";
import { SectionHeading } from "@/components/common/section-heading";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { exportCsv } from "@/lib/exporters";
import { calc } from "@/lib/time-engine";
import { duration, jalali, shiftJalaliMonth } from "@/lib/format";
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
  const weekValues = Array.from({ length: 7 }, (_, weekday) => monthRecords
    .filter((item) => (new Date(`${item.date}T12:00:00`).getDay() + 1) % 7 === weekday)
    .reduce((sum, item) => sum + calc(item, getDailyTargetMinutes(item.date, data.settings)).worked, 0));

  function exportMonth() {
    exportCsv(`گزارش-ماه-${selectedDate.slice(0, 7)}.csv`, ["تاریخ شمسی", "ورود", "خروج", "کارکرد خالص", "وقفه", "تراز", "یادداشت"], monthRecords.map((item) => {
      const result = calc(item, getDailyTargetMinutes(item.date, data.settings));
      return [jalali(item.date), item.start || "—", item.end || "—", result.worked, result.breakMinutes + item.lunchMinutes, result.balance, item.note];
    }));
  }

  return <>
    <PageHeading title="ماه من" description="تقویم شمسی، روند کارکرد و تراز روزانه در یک نمای یکپارچه.">
      <Button variant="outline" onClick={exportMonth}><Download /> خروجی CSV</Button>
      <JalaliDatePicker value={selectedDate} onChange={setSelectedDate} recordedDates={Object.keys(data.records)} mode={data.settings.mode} includeOfficialHolidays={data.settings.autoOfficialHolidays} includeWeeklyHoliday={data.settings.autoWeeklyHoliday} />
    </PageHeading>

    <section className="mb-5 grid grid-cols-4 gap-3.5 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      <MetricCard icon={<Clock3 />} label="ساعت موظفی" value={duration(monthStats.target)} suffix="ساعت" tone="blue" />
      <MetricCard icon={<CheckCircle2 />} label="کارکرد واقعی" value={duration(monthStats.worked)} suffix="ساعت" />
      <MetricCard icon={<TrendingUp />} label={monthStats.balance >= 0 ? "اضافه‌کاری" : "کسری کار"} value={duration(monthStats.balance, true)} suffix="ساعت" tone={monthStats.balance >= 0 ? "green" : "amber"} />
      <MetricCard icon={<Coffee />} label="ناهار و وقفه" value={duration(monthStats.breaks)} suffix="ساعت" tone="purple" />
    </section>

    <section className="mb-5">
      <SectionHeading icon={<CalendarRange />} eyebrow="نمای ماه" title="تقویم و روند هفتگی" description="هر روز را انتخاب کن تا جزئیات و وضعیت همان روز را ببینی." trailing={<span className="rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-1.5 text-[9px] font-bold text-[var(--text-muted)]">{monthRecords.length.toLocaleString("fa-IR")} روز ثبت‌شده</span>} />
      <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(300px,.45fr)] gap-4 max-[980px]:grid-cols-1">
        <MonthCalendar data={data} selectedDate={selectedDate} setSelectedDate={setSelectedDate} monthRecordCount={monthRecords.length} moveMonth={(amount) => setSelectedDate(shiftJalaliMonth(selectedDate, amount))} />
        <WeeklyChart values={weekValues} />
      </div>
    </section>

    <section className="mb-5">
      <SectionHeading icon={<ListChecks />} eyebrow="روز انتخاب‌شده" title="جزئیات روز" description="خلاصه حضور، وقفه و تراز روز انتخاب‌شده." />
      <MonthDayDetails data={data} selectedDate={selectedDate} />
    </section>

    <section className="mb-5">
      <SectionHeading icon={<BarChart3 />} eyebrow="رکوردهای ماه" title="جدول کارکرد" description="مرور سریع همه روزهای ثبت‌شده و ورود مستقیم به ویرایش." />
      <MonthTable records={monthRecords} settings={data.settings} onEdit={setSelectedDate} />
    </section>
  </>;
}
