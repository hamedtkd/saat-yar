import { useEffect, useRef, useState } from "react";
import { minutesToTime, spanMinutes, timeToMinutes } from "@/lib/time-engine";
import { nowTime } from "@/lib/format";
import { closePreviousRecordForNewDay, findPreviousOpenRecord } from "@/lib/previous-day-session";
import type { Dispatch, SetStateAction } from "react";
import type { AppData, WorkRecord, WorkRecordPatch } from "@/lib/types";
import { createDeletedWorkRecord } from "@/lib/record-recycle-bin";

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
  const [resetUndo, setResetUndo] = useState<{ id: string; date: string; record: WorkRecord }>();
  const resetUndoTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    if (resetUndoTimerRef.current) window.clearTimeout(resetUndoTimerRef.current);
  }, []);

  function updateRecord(patch: WorkRecordPatch) {
    setData((previous) => {
      const current = previous.records[selectedDate] ?? record;
      const resolvedPatch = typeof patch === "function" ? patch(current) : patch;
      return {
        ...previous,
        records: {
          ...previous.records,
          [selectedDate]: {
            ...current,
            ...resolvedPatch,
            manuallyEdited: true,
            needsReview: false,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }
  function dismissResetUndo() {
    if (resetUndoTimerRef.current) window.clearTimeout(resetUndoTimerRef.current);
    resetUndoTimerRef.current = undefined;
    setResetUndo(undefined);
  }
  function resetRecord() {
    const deleted = createDeletedWorkRecord(selectedDate, record);
    setResetUndo({ id: deleted.id, date: selectedDate, record: deleted.record });
    if (resetUndoTimerRef.current) window.clearTimeout(resetUndoTimerRef.current);
    resetUndoTimerRef.current = window.setTimeout(() => setResetUndo(undefined), 10_000);
    setData((previous) => {
      const records = { ...previous.records };
      delete records[selectedDate];
      return { ...previous, records, deletedRecords: [deleted, ...previous.deletedRecords] };
    });
    setToast("رکورد این روز به سطل بازیابی منتقل شد؛ بازگردانی سریع فعال است");
  }
  function undoResetRecord() {
    if (!resetUndo) return;
    const restored = { ...resetUndo.record, updatedAt: new Date().toISOString() };
    setData((previous) => ({
      ...previous,
      records: { ...previous.records, [resetUndo.date]: restored },
      deletedRecords: previous.deletedRecords.filter((item) => item.id !== resetUndo.id),
    }));
    setSelectedDate(resetUndo.date);
    dismissResetUndo();
    setToast("رکورد حذف‌شده بازگردانی شد");
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
    updateRecord((current) => ({ breaks: [...current.breaks, { id: crypto.randomUUID(), start: nowTime(), end: "", startedAt: new Date().toISOString(), title: "وقفه شخصی", paid: false }] }));
    setToast("تایمر وقفه شروع شد");
  }
  function finishBreak(minutes?: number) {
    if (!ensureLiveTimerOwnership()) return setToast("کنترل تایمر در تب دیگری فعال است");
    if (!activeBreak) return;
    const end = minutes ? minutesToTime(timeToMinutes(activeBreak.start) + minutes) : nowTime();
    updateRecord((current) => ({ breaks: current.breaks.map((item) => item.id === activeBreak.id ? { ...item, end,
      endedAt: minutes && item.startedAt ? new Date(new Date(item.startedAt).getTime() + minutes * 60_000).toISOString() : new Date().toISOString() } : item) }));
    setToast(minutes ? `وقفه ${minutes.toLocaleString("fa-IR")} دقیقه‌ای ثبت شد` : "وقفه پایان یافت");
  }
  return { updateRecord, resetRecord, undoResetRecord, dismissResetUndo, resetUndoDate: resetUndo?.date, startWork, finishWork, startLunch, finishLunch, startBreak, finishBreak,
    pendingPreviousRecord, closePreviousAndStart, reviewPreviousRecord, dismissPreviousRecord: () => setPendingPreviousRecord(undefined) };
}
