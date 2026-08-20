"use client";

import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { localDateKey, shiftDateKey } from "@/lib/format";
import { buildLocalizedGreeting } from "@/lib/greeting";
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
  const { date, direction, locale, t } = useLocaleUi();
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
  const fullDate = date(selectedDate, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const greeting = buildLocalizedGreeting(data.settings.name, locale);
  const title = isToday
    ? holiday.isHoliday
      ? t("today.hero.holidayToday", { greeting })
      : scheduledDayOff
        ? t("today.hero.scheduledOffToday", { greeting })
        : t("today.hero.workQuestion", { greeting })
    : holiday.isHoliday
      ? t("today.hero.reviewHoliday")
      : scheduledDayOff
        ? t("today.hero.reviewScheduledOff")
        : t("today.hero.reviewWorkday");

  return (
    <section className="dashboard-card mb-4 grid min-h-[124px] grid-cols-[minmax(250px,.85fr)_minmax(0,1.55fr)_minmax(180px,.65fr)] items-center gap-5 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[linear-gradient(135deg,var(--surface-1),var(--surface-raised))] px-5 py-4 shadow-[0_5px_18px_rgba(0,0,0,.035)] max-[980px]:grid-cols-[minmax(0,1fr)_auto] max-[980px]:gap-4 max-[720px]:grid-cols-1 max-[720px]:px-4 max-[720px]:text-center max-[359px]:min-h-0 max-[359px]:gap-3 max-[359px]:px-3 max-[359px]:py-3">
      <div className="max-[980px]:order-2 max-[720px]:order-2">
        <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-stretch gap-2 max-[359px]:grid-cols-[36px_minmax(0,1fr)_36px] max-[359px]:gap-1.5" dir={direction}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-full min-h-[52px] w-[42px] rounded-xl border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none max-[359px]:min-h-11 max-[359px]:w-9 max-[359px]:rounded-[10px]"
            aria-label={t("today.hero.previousDay")}
            title={t("today.hero.previousDay")}
            onClick={() => onDateChange(shiftDateKey(selectedDate, -1))}
          >
            {direction === "rtl" ? <ChevronRight aria-hidden="true" className="size-5" /> : <ChevronLeft aria-hidden="true" className="size-5" />}
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
            placeholder={t("today.hero.chooseDate")}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-full min-h-[52px] w-[42px] rounded-xl border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none max-[359px]:min-h-11 max-[359px]:w-9 max-[359px]:rounded-[10px]"
            aria-label={t("today.hero.nextDay")}
            title={t("today.hero.nextDay")}
            onClick={() => onDateChange(shiftDateKey(selectedDate, 1))}
          >
            {direction === "rtl" ? <ChevronLeft aria-hidden="true" className="size-5" /> : <ChevronRight aria-hidden="true" className="size-5" />}
          </Button>
        </div>
      </div>

      <div className="min-w-0 text-center max-[980px]:order-1 max-[980px]:col-span-2 max-[720px]:col-span-1">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--accent-strong)]">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          {isToday ? t("today.hero.today") : t("today.hero.selectedDay")}
        </div>
        <h1 className="text-[clamp(1.35rem,2.35vw,2.2rem)] font-black leading-[1.35] tracking-[-.035em] text-[var(--text)] max-[359px]:text-[1.15rem] max-[359px]:leading-[1.45]">
          {title}
        </h1>
        <p className="mt-1.5 text-[11px] font-semibold text-[var(--text-muted)] max-[359px]:text-[10px]">{fullDate}</p>
      </div>

      <div className="flex justify-end max-[980px]:order-3 max-[720px]:justify-center">
        {!isToday ? (
          <Button type="button" variant="secondary" size="sm" onClick={() => onDateChange(today)}>
            <RotateCcw aria-hidden="true" />
            {t("today.hero.backToday")}
          </Button>
        ) : (
          <div className="hidden min-w-[150px] rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-2 text-start xl:block">
            <span className="block text-[9px] font-bold text-[var(--text-muted)]">{t("today.hero.quickNav")}</span>
            <strong className="mt-0.5 block text-[11px] text-[var(--text)]">{t("today.hero.quickNavHint")}</strong>
          </div>
        )}
      </div>
    </section>
  );
}
