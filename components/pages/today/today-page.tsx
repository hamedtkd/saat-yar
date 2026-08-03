"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { jalali } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { ManualEntryForm } from "./manual-entry-form";
import { TodayFocusCard } from "./today-focus-card";
import { TodayMetrics } from "./today-metrics";
import { TodaySmartSummary } from "./today-smart-summary";
import { TodayTimeStrip } from "./today-time-strip";
import { TodayTimeline } from "./today-timeline";
import { RecordHealthBanner } from "./record-health-banner";
import type { TodayPageProps } from "./types.ts";
import { cn } from "@/lib/cn";

export function TodayPage(props: TodayPageProps) {
  const holiday = getHolidayInfo(props.selectedDate, {
    mode: props.data.settings.mode,
    manualHoliday: props.record.holiday,
    includeOfficialHolidays: props.data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: props.data.settings.autoWeeklyHoliday,
    overrides: props.data.holidayOverrides,
  });

  return (
    <>
      <PageHeading
        title="امروز روی چه چیزی کار می‌کنی؟"
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
            onChange={props.setSelectedDate}
            recordedDates={Object.keys(props.data.records)}
            mode={props.data.settings.mode}
            includeOfficialHolidays={props.data.settings.autoOfficialHolidays}
            includeWeeklyHoliday={props.data.settings.autoWeeklyHoliday}
            holidayOverrides={props.data.holidayOverrides}
          />
        </div>
      </PageHeading>
      {holiday.isHoliday && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <div className="grid gap-0.5">
            <strong className="text-xs font-extrabold">روز تعطیل</strong>
            <span className="text-[10px]">{holiday.title}</span>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold">هدف روز: صفر</span>
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
      <TodayFocusCard {...props} />
      <TodayTimeStrip {...props} />
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
              "mt-[14px] flex items-center gap-[13px] rounded-[14px] border border-[#f1c36c] bg-[#fff9eb] px-[19px] py-[14px] text-[#8b5a05] [&>svg]:h-[27px] [&>svg]:w-[27px] [&>div]:grid [&>div]:flex-1 [&_span]:text-[10px] [&_span]:text-[#78694c] print:hidden",
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
