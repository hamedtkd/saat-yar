"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { jalali } from "@/lib/format";
import { tw } from "@/lib/tw";
import { ManualEntryForm } from "./manual-entry-form";
import { TodayFocusCard } from "./today-focus-card";
import { TodayMetrics } from "./today-metrics";
import { TodayTimeStrip } from "./today-time-strip";
import { TodayTimeline } from "./today-timeline";
import type { TodayPageProps } from "./types";

export function TodayPage(props: TodayPageProps) {
  return (
    <>
      <PageHeading title="امروز روی چه چیزی کار می‌کنی؟" description={jalali(props.selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}>
        <JalaliDatePicker value={props.selectedDate} onChange={props.setSelectedDate} recordedDates={Object.keys(props.data.records)} />
      </PageHeading>
      <TodayFocusCard {...props} />
      <TodayTimeStrip {...props} />
      {props.editingEntry === "manual" && props.data.settings.mode !== "employee" && <ManualEntryForm {...props} />}
      <TodayMetrics result={props.todayCalc} dailyTarget={props.dailyTarget} />
      <TodayTimeline {...props} />
      {props.record.start && !props.record.end && props.todayCalc.worked > 4 * 60 && <div className={tw("long-timer-warning")}><AlertTriangle /><div><strong>بیش از ۴ ساعت از شروع روز گذشته است.</strong><span>برای حفظ دقت ثبت زمان، یک استراحت کوتاه یا بررسی تایمر پیشنهاد می‌شود.</span></div><Button variant="outline" onClick={props.startBreak}>شروع وقفه</Button></div>}
    </>
  );
}
