"use client";

import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { buildGreeting } from "@/lib/greeting";
import { jalali, localDateKey, shiftDateKey } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import type { AppData } from "@/lib/types";
import { isScheduledDayOff } from "@/lib/work-schedule";

export function TodayHero({
  data,
  selectedDate,
  onDateChange,
}: {
  data: AppData;
  selectedDate: string;
  onDateChange: (date: string) => void;
}) {
  const today = localDateKey();
  const isToday = selectedDate === today;
  const holiday = getHolidayInfo(selectedDate, {
    mode: data.settings.mode,
    manualHoliday: data.records[selectedDate]?.holiday,
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
    overrides: data.holidayOverrides,
  });
  const scheduledDayOff = !holiday.isHoliday && isScheduledDayOff(selectedDate, data.settings);
  const fullDate = jalali(selectedDate, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const title = isToday
    ? holiday.isHoliday
      ? `${buildGreeting(data.settings.name)}؛ امروز تعطیل است`
      : scheduledDayOff
        ? `${buildGreeting(data.settings.name)}؛ امروز طبق برنامه کاری تعطیل است`
        : `${buildGreeting(data.settings.name)}؛ امروز روی چه چیزی کار می‌کنی؟`
    : holiday.isHoliday
      ? "مرور روز تعطیل"
      : scheduledDayOff
        ? "این روز طبق برنامه کاری تعطیل است"
        : "مرور روز کاری";

  return (
    <section className="dashboard-card mb-4 grid min-h-[124px] grid-cols-[minmax(250px,.85fr)_minmax(0,1.55fr)_minmax(180px,.65fr)] items-center gap-5 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[linear-gradient(135deg,var(--surface-1),var(--surface-raised))] px-5 py-4 shadow-[0_5px_18px_rgba(0,0,0,.035)] max-[980px]:grid-cols-[minmax(0,1fr)_auto] max-[980px]:gap-4 max-[720px]:grid-cols-1 max-[720px]:px-4 max-[720px]:text-center">
      <div className="max-[980px]:order-2 max-[720px]:order-2">
        <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-stretch gap-2" dir="rtl">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-full min-h-[52px] w-[42px] rounded-xl border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none"
            aria-label="روز قبل"
            title="روز قبل"
            onClick={() => onDateChange(shiftDateKey(selectedDate, -1))}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </Button>
          <JalaliDatePicker
            value={selectedDate}
            onChange={onDateChange}
            recordedDates={Object.keys(data.records)}
            mode={data.settings.mode}
            includeOfficialHolidays={data.settings.autoOfficialHolidays}
            includeWeeklyHoliday={data.settings.autoWeeklyHoliday}
            holidayOverrides={data.holidayOverrides}
            weeklySchedule={data.settings.weeklySchedule}
            placeholder="انتخاب تاریخ"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-full min-h-[52px] w-[42px] rounded-xl border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none"
            aria-label="روز بعد"
            title="روز بعد"
            onClick={() => onDateChange(shiftDateKey(selectedDate, 1))}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </div>

      <div className="min-w-0 text-center max-[980px]:order-1 max-[980px]:col-span-2 max-[720px]:col-span-1">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--accent-strong)]">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          {isToday ? "امروز" : "روز انتخاب‌شده"}
        </div>
        <h1 className="text-[clamp(1.35rem,2.35vw,2.2rem)] font-black leading-[1.35] tracking-[-.035em] text-[var(--text)]">
          {title}
        </h1>
        <p className="mt-1.5 text-[11px] font-semibold text-[var(--text-muted)]">{fullDate}</p>
      </div>

      <div className="flex justify-end max-[980px]:order-3 max-[720px]:justify-center">
        {!isToday ? (
          <Button type="button" variant="secondary" size="sm" onClick={() => onDateChange(today)}>
            <RotateCcw aria-hidden="true" />
            برگشت به امروز
          </Button>
        ) : (
          <div className="hidden min-w-[150px] rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-2 text-right xl:block">
            <span className="block text-[9px] font-bold text-[var(--text-muted)]">ناوبری سریع</span>
            <strong className="mt-0.5 block text-[11px] text-[var(--text)]">با فلش‌ها روز را عوض کن</strong>
          </div>
        )}
      </div>
    </section>
  );
}
