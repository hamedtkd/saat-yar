"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { jalali } from "@/lib/format";
import { ManualEntryForm } from "./manual-entry-form";
import { TodayFocusCard } from "./today-focus-card";
import { TodayMetrics } from "./today-metrics";
import { TodayTimeStrip } from "./today-time-strip";
import { TodayTimeline } from "./today-timeline";
import type { TodayPageProps } from "./types";
import { cn } from "@/lib/cn";

export function TodayPage(props: TodayPageProps) {
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
          />
        </div>
      </PageHeading>
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
      />
      <TodayTimeline {...props} />
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
