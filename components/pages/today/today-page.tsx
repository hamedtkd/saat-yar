"use client";

import { AlertTriangle, CalendarOff } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { localDateKey } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { isScheduledDayOff } from "@/lib/work-schedule";
import { CompletedDayEditor } from "./completed-day-editor";
import { ManualEntryForm } from "./manual-entry-form";
import { RecordHealthBanner } from "./record-health-banner";
import { RecordResetUndo } from "./record-reset-undo";
import { TodayAttendanceLog } from "./today-attendance-log";
import { TodayHero } from "./today-hero";
import { TodayMetrics } from "./today-metrics";
import { TodaySmartSummary } from "./today-smart-summary";
import { TodayTimeline } from "./today-timeline";
import type { TodayPageProps } from "./types.ts";

export function TodayPage(props: TodayPageProps) {
  const { date, locale, t } = useLocaleUi();
  const { requestNavigation } = useUnsavedNavigation();
  const isToday = props.selectedDate === localDateKey();
  const holiday = getHolidayInfo(props.selectedDate, {
    mode: props.data.settings.mode,
    manualHoliday: props.record.holiday,
    includeOfficialHolidays: props.data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: props.data.settings.autoWeeklyHoliday,
    overrides: props.data.holidayOverrides,
  });
  const scheduledDayOff = !holiday.isHoliday && isScheduledDayOff(props.selectedDate, props.data.settings);
  const pendingDate = props.pendingPreviousRecord
    ? date(props.pendingPreviousRecord.date, { weekday: "long", day: "numeric", month: "long" })
    : t("today.previous.fallback");

  return (
    <>
      <AlertDialog open={Boolean(props.pendingPreviousRecord)} onOpenChange={(open: boolean) => { if (!open) props.dismissPreviousRecord(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("today.previous.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("today.previous.description", { date: pendingDate })}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">
            {t("today.previous.note")}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={props.closePreviousAndStart}>{t("today.previous.closeAndStart")}</AlertDialogAction>
            <AlertDialogCancel onClick={props.reviewPreviousRecord}>{t("today.previous.review")}</AlertDialogCancel>
            <AlertDialogCancel>{t("today.previous.notNow")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <TodayHero
        data={props.data}
        selectedDate={props.selectedDate}
        onDateChange={(nextDate) => requestNavigation(() => props.setSelectedDate(nextDate))}
      />
      {holiday.isHoliday && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--card-radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-500">
          <div className="grid gap-0.5">
            <strong className="text-xs font-extrabold">{t("today.holiday.title")}</strong>
            <span className="text-[10px]">{locale === "fa-IR" ? holiday.title : t("today.holiday.title")}</span>
          </div>
          <span className="rounded-full border border-red-500/20 bg-[var(--surface-1)] px-2.5 py-1 text-[9px] font-bold">{t("today.holiday.zeroTarget")}</span>
        </div>
      )}
      {scheduledDayOff && !holiday.isHoliday && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] px-4 py-3 text-[var(--warning)]">
          <div className="flex items-start gap-3">
            <CalendarOff aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div className="grid gap-0.5">
              <strong className="text-xs font-extrabold">{isToday ? t("today.scheduleOff.today") : t("today.scheduleOff.selected")}</strong>
              <span className="text-[10px] text-[var(--text-muted)]">{t("today.scheduleOff.description")}</span>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--warning)_28%,var(--border))] bg-[var(--surface-1)] px-2.5 py-1 text-[9px] font-bold">{t("today.scheduleOff.zeroTarget")}</span>
        </div>
      )}
      <RecordHealthBanner record={props.record} onReset={props.resetRecord} />
      <RecordResetUndo date={props.resetUndoDate} onUndo={props.undoResetRecord} onDismiss={props.dismissResetUndo} />
      <TodaySmartSummary
        record={props.record}
        result={props.todayCalc}
        dailyTarget={props.dailyTarget}
        suggestedExit={props.suggestedExit}
        openBreak={Boolean(props.activeBreak)}
        lunchRunning={props.lunchRunning}
        scheduledDayOff={scheduledDayOff}
      />
      <CompletedDayEditor key={`${props.selectedDate}:${props.record.start && props.record.end ? "completed" : "active"}`} {...props} scheduledDayOff={scheduledDayOff} />
      {props.editingEntry === "manual" && props.data.settings.mode !== "employee" && <ManualEntryForm {...props} />}
      {props.data.settings.mode === "employee" ? <TodayAttendanceLog record={props.record} /> : <TodayTimeline {...props} />}
      <TodayMetrics
        data={props.data}
        record={props.record}
        selectedDate={props.selectedDate}
        result={props.todayCalc}
        dailyTarget={props.dailyTarget}
        financialsHidden={props.financialsHidden}
        scheduledDayOff={scheduledDayOff}
      />
      {props.record.start && !props.record.end && props.todayCalc.worked > 4 * 60 && (
        <div className={cn("mt-5 flex items-center gap-3 rounded-[var(--card-radius)] border border-amber-500/25 bg-amber-500/10 px-5 py-4 text-amber-500 [&>svg]:size-7 [&>div]:grid [&>div]:flex-1 [&_span]:text-[10px] [&_span]:text-[var(--text-muted)] print:hidden")}>
          <AlertTriangle />
          <div>
            <strong>{t("today.longSession.title")}</strong>
            <span>{t("today.longSession.description")}</span>
          </div>
          <Button variant="outline" onClick={props.startBreak}>{t("today.longSession.startBreak")}</Button>
        </div>
      )}
    </>
  );
}
