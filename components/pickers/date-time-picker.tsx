"use client";

import { CalendarClock, Check, ChevronDown, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { CalendarGrid } from "@/components/pickers/jalali-date-picker/calendar-grid";
import { CalendarHeader } from "@/components/pickers/jalali-date-picker/calendar-header";
import { ResponsivePickerSurface } from "@/components/pickers/responsive-picker-surface";
import { TimeWheelField } from "@/components/pickers/time-picker/time-wheel-field";
import { HOURS, MINUTES, normalizeTime } from "@/components/pickers/time-picker/time-utils";
import { Button } from "@/components/ui/button";
import { useDialogAccessibility } from "@/hooks/accessibility/use-dialog-accessibility";
import { useResponsivePickerPresentation } from "@/hooks/use-responsive-picker-presentation";
import { calendarMonthCells, localDateKey, shiftCalendarMonth } from "@/lib/format";
import { formatLocaleDate, formatLocaleDigits } from "@/lib/i18n/formatters";
import { translate } from "@/lib/i18n/catalog";
import { isoToLocalDateTimeValue, localDateTimeValueToIso } from "@/lib/pickers/date-time";
import type { PickerPresentationPreference } from "@/lib/pickers/responsive-presentation";
import type { HolidayOverride, Mode, Settings } from "@/lib/types";

export type DateTimePickerProps = {
  value: string;
  onChange: (isoValue: string) => void;
  mode?: Mode;
  includeOfficialHolidays?: boolean;
  includeWeeklyHoliday?: boolean;
  holidayOverrides?: HolidayOverride[];
  weeklySchedule?: Settings["weeklySchedule"];
  disabled?: boolean;
  presentation?: PickerPresentationPreference;
};

export function DateTimePicker({
  value,
  onChange,
  mode = "freelancer",
  includeOfficialHolidays = true,
  includeWeeklyHoliday = true,
  holidayOverrides = [],
  weeklySchedule,
  disabled = false,
  presentation: presentationPreference = "auto",
}: DateTimePickerProps) {
  const { calendar, locale } = useLocaleUi();
  const presentation = useResponsivePickerPresentation(presentationPreference);
  const titleId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const initial = isoToLocalDateTimeValue(value);
  const [draftDate, setDraftDate] = useState(initial.date);
  const [draftTime, setDraftTime] = useState(initial.time);
  const [viewDate, setViewDate] = useState(initial.date);
  const closeLabel = translate(locale, "picker.datetime.close");
  const dialogRef = useDialogAccessibility(() => setOpen(false), { modal: presentation === "drawer" });
  const cells = useMemo(() => calendarMonthCells(viewDate, calendar), [calendar, viewDate]);
  const title = formatLocaleDate(locale, viewDate, { month: "long", year: "numeric" }, calendar);
  const [hour = "00", minute = "00"] = normalizeTime(draftTime).split(":");
  const formattedDate = formatLocaleDate(locale, initial.date, { day: "numeric", month: "short", year: "numeric" }, calendar);
  const formattedTime = formatLocaleDigits(locale, initial.time);

  const openPicker = () => {
    const next = isoToLocalDateTimeValue(value);
    setDraftDate(next.date);
    setDraftTime(next.time);
    setViewDate(next.date);
    setOpen(true);
  };

  const confirm = () => {
    onChange(localDateTimeValueToIso({ date: draftDate, time: draftTime }));
    setOpen(false);
  };

  return (
    <div ref={anchorRef} className="relative min-w-[190px] max-[359px]:min-w-[160px]">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPicker}
        className="h-11 w-full min-w-0 justify-start gap-2 rounded-xl px-2.5 text-start shadow-none max-[359px]:gap-1.5 max-[359px]:rounded-[10px] max-[359px]:px-2"
      >
        <CalendarClock aria-hidden="true" className="size-4 shrink-0 text-[var(--accent-strong)]" />
        <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-[var(--text)]">{formattedDate}</span>
        <b dir="ltr" className="shrink-0 text-[11px] tabular-nums text-[var(--accent-strong)]">{formattedTime}</b>
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-[var(--text-muted)]" />
      </Button>
      {open && (
        <ResponsivePickerSurface
          presentation={presentation}
          dialogRef={dialogRef}
          anchorRef={anchorRef}
          titleId={titleId}
          dir={locale === "fa-IR" ? "rtl" : "ltr"}
          closeLabel={closeLabel}
          onClose={() => setOpen(false)}
          widthClassName={presentation === "popover" ? "w-[660px] max-w-[calc(100vw-24px)]" : "w-auto"}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="grid gap-0.5">
              <h2 id={titleId} className="text-sm font-extrabold text-[var(--text)]">{translate(locale, "picker.datetime.title")}</h2>
              <p className="text-[10px] leading-5 text-[var(--text-muted)]">{translate(locale, "picker.datetime.hint")}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label={closeLabel} onClick={() => setOpen(false)}><X aria-hidden="true" /></Button>
          </div>
          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(220px,.7fr)] gap-4 max-[700px]:grid-cols-1 max-[359px]:gap-3">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-3 max-[359px]:rounded-[18px] max-[359px]:p-2">
              <CalendarHeader locale={locale} title={title} onPreviousMonth={() => setViewDate((current) => shiftCalendarMonth(current, -1, calendar))} onNextMonth={() => setViewDate((current) => shiftCalendarMonth(current, 1, calendar))} />
              <CalendarGrid
                locale={locale}
                calendar={calendar}
                cells={cells}
                value={draftDate}
                today={localDateKey()}
                recorded={new Set<string>()}
                holidayOptions={{ mode, includeOfficialHolidays, includeWeeklyHoliday, holidayOverrides, weeklySchedule }}
                onSelect={setDraftDate}
              />
            </div>
            <div className="grid content-start gap-2">
              <div dir="ltr" className="grid grid-cols-[1fr_auto_1fr] gap-2 text-center text-[10px] font-semibold text-[var(--text-muted)]"><span>{translate(locale, "picker.time.hour")}</span><span aria-hidden="true" className="invisible">:</span><span>{translate(locale, "picker.time.minute")}</span></div>
              <TimeWheelField
                locale={locale}
                hour={hour}
                minute={minute}
                hourLabel={translate(locale, "picker.time.chooseHour")}
                minuteLabel={translate(locale, "picker.time.chooseMinute")}
                hours={HOURS}
                minutes={MINUTES}
                onHourChange={(next) => setDraftTime(`${next}:${minute}`)}
                onMinuteChange={(next) => setDraftTime(`${hour}:${next}`)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2 max-[359px]:mt-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>{translate(locale, "common.cancel")}</Button>
            <Button type="button" className="flex-[1.4]" onClick={confirm}><Check aria-hidden="true" className="size-4" />{translate(locale, "picker.datetime.confirm")}</Button>
          </div>
        </ResponsivePickerSurface>
      )}
    </div>
  );
}
