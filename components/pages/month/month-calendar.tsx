"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { calc } from "@/lib/time-engine";
import { calendarMonthCells, localDateKey } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import type { AppData } from "@/lib/types";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";
import { buildCalendarDayAgenda } from "@/lib/calendar-integration/intelligence";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import { cn } from "@/lib/cn";

const weekdayKeys = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;

export function MonthCalendar({ data, selectedDate, setSelectedDate, monthRecordCount, moveMonth, externalEvents = [], onOpenDayActions }: {
  data: AppData;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  monthRecordCount: number;
  moveMonth: (amount: number) => void;
  externalEvents?: ExternalCalendarEvent[];
  onOpenDayActions?: (dateKey: string, point: { x: number; y: number }) => void;
}) {
  const { t, date, duration, number, locale, direction, calendar } = useLocaleUi();
  const cells = calendarMonthCells(selectedDate, calendar);
  const monthLabel = date(selectedDate, { year: "numeric", month: "long" });
  const PreviousIcon = direction === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = direction === "rtl" ? ChevronLeft : ChevronRight;
  return (
    <SurfaceCard as="article" className="overflow-hidden p-[18px] max-[620px]:p-[12px] sm:p-[22px]">
      <div className={cn("mb-[18px] grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-2.5 [&>div]:text-center [&_h2]:m-0 [&_h2]:text-[19px] [&_span]:mt-1 [&_span]:block [&_span]:text-[11px] [&_span]:text-[var(--text-muted)]")}>
        <Button variant="outline" size="icon" onClick={() => moveMonth(-1)} aria-label={t("month.calendar.previous")}><PreviousIcon /></Button>
        <div><h2>{monthLabel}</h2><span>{t("month.calendar.withRecords", { count: number(monthRecordCount) })}</span></div>
        <Button variant="outline" size="icon" onClick={() => moveMonth(1)} aria-label={t("month.calendar.next")}><NextIcon /></Button>
      </div>
      <div className={cn("mb-[7px] grid grid-cols-7 gap-[7px] [&_span]:text-center [&_span]:text-[11px] [&_span]:font-bold [&_span]:text-[var(--text-muted)] max-[620px]:gap-1")}>
        {weekdayKeys.map((day) => <span key={day}>{t(`weekday.${day}.short`)}</span>)}
      </div>
      <div className={cn("grid grid-cols-7 gap-[7px] [&_button]:relative [&_button]:flex [&_button]:min-h-[68px] [&_button]:flex-col [&_button]:items-start [&_button]:justify-between [&_button]:rounded-[14px] [&_button]:border [&_button]:border-[var(--dashboard-border)] [&_button]:bg-[var(--surface-2)] [&_button]:p-2 [&_button]:text-[var(--text)] [&_button:hover]:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] [&_button:hover]:bg-[var(--accent-soft)] [&_button[aria-pressed=true]]:border-[color-mix(in_srgb,var(--accent)_55%,var(--dashboard-border))] [&_button[aria-pressed=true]]:bg-[var(--surface-accent)] [&_button.outside]:opacity-30 [&_button.today]:shadow-[inset_0_0_0_2px_var(--accent)] [&_button_small]:text-[9px] [&_button_small]:text-[var(--text-muted)] [&_button>i]:absolute [&_button>i]:end-2 [&_button>i]:top-[9px] [&_button>i]:h-[7px] [&_button>i]:w-[7px] [&_button>i]:rounded-full max-[620px]:gap-1 max-[620px]:[&_button]:min-h-[52px] max-[620px]:[&_button]:p-1.5 max-[620px]:[&_button_small]:hidden")}>
        {cells.map((cell) => {
          const item = data.records[cell.key];
          const hasLeave = data.leaves.some((entry) => entry.startDate <= cell.key && entry.endDate >= cell.key);
          const holiday = getHolidayInfo(cell.key, {
            mode: data.settings.mode,
            manualHoliday: item?.holiday,
            includeOfficialHolidays: data.settings.autoOfficialHolidays,
            includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
            overrides: data.holidayOverrides,
          });
          const effectiveItem = item ? { ...item, holiday: holiday.isHoliday } : item;
          const result = effectiveItem ? calc(effectiveItem, getDailyTargetMinutes(cell.key, data.settings)) : null;
          const statusClass = hasLeave
            ? "border-[color-mix(in_srgb,var(--info)_30%,var(--border))] bg-[var(--info-soft)] [&>i]:bg-[var(--info)]"
            : holiday.isHoliday
              ? "border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[var(--danger-soft)] text-[var(--danger)] [&>i]:bg-[var(--danger)]"
              : effectiveItem?.end
                ? result && result.balance >= 0
                  ? "border-[color-mix(in_srgb,var(--success)_30%,var(--border))] bg-[var(--success-soft)] [&>i]:bg-[var(--success)]"
                  : "border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] [&>i]:bg-[var(--warning)]"
                : effectiveItem?.start
                  ? "border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] [&>i]:bg-[var(--warning)]"
                  : "";
          const holidayLabel = holiday.isHoliday ? (locale === "fa-IR" && holiday.title ? holiday.title : t("common.holiday")) : "";
          const dayLabel = number(cell.day);
          const externalEventCount = buildCalendarDayAgenda(externalEvents, cell.key).length;
          const externalLabel = externalEventCount ? t("calendar.google.eventsCount", { count: number(externalEventCount) }) : "";
          const ariaLabel = [dayLabel, holidayLabel, externalLabel].filter(Boolean).join(", ");
          return <button key={cell.key} type="button" title={holidayLabel || undefined} aria-label={ariaLabel} aria-haspopup={onOpenDayActions ? "menu" : undefined} className={cn(!cell.inMonth && "opacity-30", cell.key === localDateKey() && "shadow-[inset_0_0_0_2px_var(--accent)]", cell.key === selectedDate && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface-1)]", statusClass)} aria-pressed={cell.key === selectedDate} onClick={() => setSelectedDate(cell.key)} onContextMenu={(event) => { if (!onOpenDayActions) return; event.preventDefault(); setSelectedDate(cell.key); onOpenDayActions(cell.key, { x: event.clientX, y: event.clientY }); }} onKeyDown={(event) => { if (!onOpenDayActions || !(event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))) return; event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); setSelectedDate(cell.key); onOpenDayActions(cell.key, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }); }}><span>{dayLabel}</span>{item && <small>{duration(result?.worked ?? 0)}</small>}{externalEventCount > 0 && <span data-external-calendar-count className="absolute bottom-1.5 end-1.5 rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[8px] font-extrabold text-[var(--accent-strong)]">{number(externalEventCount)}</span>}{statusClass && <i aria-hidden="true" />}</button>;
        })}
      </div>
      <div className={cn("mt-[15px] flex flex-wrap gap-[15px] text-[10px] text-[var(--text-muted)] [&_span]:flex [&_span]:items-center [&_span]:gap-1.5 [&_i]:h-2 [&_i]:w-2 [&_i]:rounded-full max-[620px]:gap-[9px]")}>
        <span><i className="bg-[var(--success)]" /> {t("month.calendar.legendComplete")}</span>
        <span><i className="bg-[var(--warning)]" /> {t("month.calendar.legendDeficit")}</span>
        <span><i className="bg-[var(--info)]" /> {t("month.calendar.legendLeave")}</span>
        <span><i className="bg-[var(--danger)]" /> {t("month.calendar.legendHoliday")}</span>
        {externalEvents.length > 0 && <span data-external-calendar-legend><i className="bg-[var(--accent)]" /> {t("calendar.google.title")}</span>}
      </div>
    </SurfaceCard>
  );
}
