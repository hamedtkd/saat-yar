"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { jalali } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { buildGreeting } from "@/lib/greeting";
import { ManualEntryForm } from "./manual-entry-form";
import { TodayMetrics } from "./today-metrics";
import { TodaySmartSummary } from "./today-smart-summary";
import { TodayTimeline } from "./today-timeline";
import { RecordHealthBanner } from "./record-health-banner";
import { CompletedDayEditor } from "./completed-day-editor";
import type { TodayPageProps } from "./types.ts";
import { cn } from "@/lib/cn";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";

export function TodayPage(props: TodayPageProps) {
  const { requestNavigation } = useUnsavedNavigation();
  const holiday = getHolidayInfo(props.selectedDate, {
    mode: props.data.settings.mode,
    manualHoliday: props.record.holiday,
    includeOfficialHolidays: props.data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: props.data.settings.autoWeeklyHoliday,
    overrides: props.data.holidayOverrides,
  });

  return (
    <>
      <AlertDialog open={Boolean(props.pendingPreviousRecord)} onOpenChange={(open) => { if (!open) props.dismissPreviousRecord(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>خروج روز قبل ثبت نشده است</AlertDialogTitle>
            <AlertDialogDescription>
              برای جلوگیری از محاسبه اشتباه ساعت و اضافه‌کاری، قبل از شروع امروز باید رکورد {props.pendingPreviousRecord ? jalali(props.pendingPreviousRecord.date, { weekday: "long", day: "numeric", month: "long" }) : "روز قبل"} تعیین تکلیف شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">
            با «ثبت خروج و شروع امروز»، ساعت پایان برنامه کاری همان روز ثبت می‌شود و رکورد برای بازبینی علامت می‌خورد.
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={props.closePreviousAndStart}>ثبت خروج و شروع امروز</AlertDialogAction>
            <AlertDialogCancel onClick={props.reviewPreviousRecord}>بررسی و اصلاح روز قبل</AlertDialogCancel>
            <AlertDialogCancel>فعلاً شروع نکن</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PageHeading
        title={`${buildGreeting(props.data.settings.name)}؛ امروز روی چه چیزی کار می‌کنی؟`}
        description={jalali(props.selectedDate, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      >
        <div>
          <JalaliDatePicker
            value={props.selectedDate}
            onChange={(date) => requestNavigation(() => props.setSelectedDate(date))}
            recordedDates={Object.keys(props.data.records)}
            mode={props.data.settings.mode}
            includeOfficialHolidays={props.data.settings.autoOfficialHolidays}
            includeWeeklyHoliday={props.data.settings.autoWeeklyHoliday}
            holidayOverrides={props.data.holidayOverrides}
          />
        </div>
      </PageHeading>
      {holiday.isHoliday && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--card-radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-500">
          <div className="grid gap-0.5">
            <strong className="text-xs font-extrabold">روز تعطیل</strong>
            <span className="text-[10px]">{holiday.title}</span>
          </div>
          <span className="rounded-full border border-red-500/20 bg-[var(--surface-1)] px-2.5 py-1 text-[9px] font-bold">هدف روز: صفر</span>
        </div>
      )}
      <RecordHealthBanner record={props.record} onReset={props.resetRecord} />
      <TodaySmartSummary
        started={Boolean(props.record.start)}
        finished={Boolean(props.record.end)}
        workedMinutes={props.todayCalc.worked}
        creditedMinutes={props.todayCalc.credited}
        dailyTarget={props.dailyTarget}
        suggestedExit={props.suggestedExit}
        openBreak={Boolean(props.activeBreak)}
        lunchRunning={props.lunchRunning}
      />
      <CompletedDayEditor key={props.selectedDate} {...props} />
      {props.editingEntry === "manual" &&
        props.data.settings.mode !== "employee" && (
          <ManualEntryForm {...props} />
        )}
      <TodayMetrics
        data={props.data}
        record={props.record}
        selectedDate={props.selectedDate}
        result={props.todayCalc}
        dailyTarget={props.dailyTarget}
        financialsHidden={props.financialsHidden}
      />
      {props.data.settings.mode !== "employee" && (
        <TodayTimeline {...props} />
      )}
      {props.record.start &&
        !props.record.end &&
        props.todayCalc.worked > 4 * 60 && (
          <div
            className={cn(
              "mt-5 flex items-center gap-3 rounded-[var(--card-radius)] border border-amber-500/25 bg-amber-500/10 px-5 py-4 text-amber-500 [&>svg]:size-7 [&>div]:grid [&>div]:flex-1 [&_span]:text-[10px] [&_span]:text-[var(--text-muted)] print:hidden",
            )}
          >
            <AlertTriangle />
            <div>
              <strong>بیش از ۴ ساعت از شروع روز گذشته است.</strong>
              <span>
                برای حفظ دقت ثبت زمان، یک استراحت کوتاه یا بررسی تایمر پیشنهاد
                می‌شود.
              </span>
            </div>
            <Button variant="outline" onClick={props.startBreak}>
              شروع وقفه
            </Button>
          </div>
        )}
    </>
  );
}
