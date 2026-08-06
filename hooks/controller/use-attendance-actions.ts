import { useState } from "react";
import { minutesToTime, spanMinutes, timeToMinutes } from "@/lib/time-engine";
import { nowTime } from "@/lib/format";
import { closePreviousRecordForNewDay, findPreviousOpenRecord } from "@/lib/previous-day-session";
import type { Dispatch, SetStateAction } from "react";
import type { AppData, WorkRecord } from "@/lib/types";

type Args = {
  data: AppData;
  record: WorkRecord;
  selectedDate: string;
  activeBreak?: WorkRecord["breaks"][number];
  lunchRunning: boolean;
  setData: Dispatch<SetStateAction<AppData>>;
  setSelectedDate: (date: string) => void;
  setToast: (message: string) => void;
  ensureLiveTimerOwnership: () => boolean;
};

export function useAttendanceActions({ data, record, selectedDate, activeBreak, lunchRunning, setData, setSelectedDate, setToast, ensureLiveTimerOwnership }: Args) {
  const [pendingPreviousRecord, setPendingPreviousRecord] = useState<WorkRecord>();

  function saveRecord(next: WorkRecord) {
    setData((previous) => ({ ...previous, records: { ...previous.records, [selectedDate]: { ...next, updatedAt: new Date().toISOString() } } }));
  }
  function updateRecord(patch: Partial<WorkRecord>) { saveRecord({ ...record, ...patch, manuallyEdited: true, needsReview: false }); }
  function resetRecord() {
    setData((previous) => { const records = { ...previous.records }; delete records[selectedDate]; return { ...previous, records }; });
    setToast("رکورد این روز پاک شد");
  }
  function beginCurrentDay() {
    updateRecord({ start: nowTime(), end: "", startedAt: new Date().toISOString(), endedAt: undefined });
    setToast("شروع روز ثبت شد");
  }
  function startWork() {
    if (!ensureLiveTimerOwnership()) return setToast("کنترل تایمر در تب دیگری فعال است");
    const previousOpen = findPreviousOpenRecord(data.records, selectedDate);
    if (previousOpen) return setPendingPreviousRecord(previousOpen);
    beginCurrentDay();
  }
  function closePreviousAndStart() {
    if (!pendingPreviousRecord) return;
    const closed = closePreviousRecordForNewDay(pendingPreviousRecord, data.settings);
    setData((previous) => ({
      ...previous,
      records: { ...previous.records, [closed.date]: closed },
    }));
    setPendingPreviousRecord(undefined);
    beginCurrentDay();
    setToast("خروج روز قبل با ساعت برنامه ثبت شد؛ لطفاً آن را بررسی کنید");
  }
  function reviewPreviousRecord() {
    if (!pendingPreviousRecord) return;
    const date = pendingPreviousRecord.date;
    setPendingPreviousRecord(undefined);
    setSelectedDate(date);
  }
  function finishWork() {
    if (!ensureLiveTimerOwnership()) return setToast("کنترل تایمر در تب دیگری فعال است");
    if (activeBreak || lunchRunning) return setToast("ابتدا تایمر ناهار یا وقفه را پایان دهید");
    updateRecord({ end: nowTime(), endedAt: new Date().toISOString() }); setToast("ساعت خروج ثبت شد");
  }
  function startLunch() {
    if (!ensureLiveTimerOwnership()) return setToast("کنترل تایمر در تب دیگری فعال است");
    if (activeBreak) return setToast("ابتدا وقفه در حال اجرا را پایان دهید");
    updateRecord({ lunchStart: nowTime(), lunchEnd: "", lunchStartedAt: new Date().toISOString(), lunchEndedAt: undefined }); setToast("تایمر ناهار شروع شد");
  }
  function finishLunch() {
    if (!ensureLiveTimerOwnership()) return setToast("کنترل تایمر در تب دیگری فعال است");
    const end = nowTime();
    updateRecord({ lunchEnd: end, lunchEndedAt: new Date().toISOString(), lunchMinutes: spanMinutes(record.lunchStart ?? end, end) });
    setToast("ناهار ثبت شد");
  }
  function startBreak() {
    if (!ensureLiveTimerOwnership()) return setToast("کنترل تایمر در تب دیگری فعال است");
    if (activeBreak || lunchRunning) return setToast("یک تایمر دیگر در حال اجراست");
    updateRecord({ breaks: [...record.breaks, { id: crypto.randomUUID(), start: nowTime(), end: "", startedAt: new Date().toISOString(), title: "وقفه شخصی", paid: false }] });
    setToast("تایمر وقفه شروع شد");
  }
  function finishBreak(minutes?: number) {
    if (!ensureLiveTimerOwnership()) return setToast("کنترل تایمر در تب دیگری فعال است");
    if (!activeBreak) return;
    const end = minutes ? minutesToTime(timeToMinutes(activeBreak.start) + minutes) : nowTime();
    updateRecord({ breaks: record.breaks.map((item) => item.id === activeBreak.id ? { ...item, end,
      endedAt: minutes && item.startedAt ? new Date(new Date(item.startedAt).getTime() + minutes * 60_000).toISOString() : new Date().toISOString() } : item) });
    setToast(minutes ? `وقفه ${minutes.toLocaleString("fa-IR")} دقیقه‌ای ثبت شد` : "وقفه پایان یافت");
  }
  return { updateRecord, resetRecord, startWork, finishWork, startLunch, finishLunch, startBreak, finishBreak,
    pendingPreviousRecord, closePreviousAndStart, reviewPreviousRecord, dismissPreviousRecord: () => setPendingPreviousRecord(undefined) };
}
