import { useEffect, useRef, useState } from "react";
import { minutesToTime, spanMinutes, timeToMinutes } from "@/lib/time-engine";
import { localDateKey, nowTime } from "@/lib/format";
import { getBrowserLocale } from "@/lib/i18n";
import { formatLocaleNumber } from "@/lib/i18n/formatters";
import { translateSystem } from "@/lib/i18n/system";
import { closePreviousRecordForNewDay, findPreviousOpenRecord } from "@/lib/previous-day-session";
import type { Dispatch, SetStateAction } from "react";
import type { ActivityKind, ActivityProjectContext, AppData, WorkRecord, WorkRecordPatch } from "@/lib/types";
import { createDeletedWorkRecord } from "@/lib/record-recycle-bin";
import { resumeAutoClosedRecord } from "@/lib/session-close";
import { closeActiveActivitySegments, createActivitySegment, removeCompletedActivitySegment, updateCompletedActivitySegmentDuration } from "@/lib/activity-segments";
import { trackProductAnalytics } from "@/lib/product-analytics";
import { createWorkProject as buildWorkProject, isDuplicateWorkProjectName } from "@/lib/work-projects";

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
  function updateActivitySegments(resolve: (segments: WorkRecord["activitySegments"]) => WorkRecord["activitySegments"]) {
    setData((previous) => {
      const current = previous.records[selectedDate] ?? record;
      return {
        ...previous,
        records: {
          ...previous.records,
          [selectedDate]: { ...current, activitySegments: resolve(current.activitySegments), updatedAt: new Date().toISOString() },
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
    setToast(translateSystem(getBrowserLocale(), "Today's record was moved to the recycle bin; quick restore is available."));
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
    setToast(translateSystem(getBrowserLocale(), "Deleted record was restored."));
  }
  function beginCurrentDay() {
    updateRecord({ start: nowTime(), end: "", startedAt: new Date().toISOString(), endedAt: undefined });
    trackProductAnalytics({ name: "work_started", properties: { mode: data.settings.mode, timing: data.settings.workTimingMode } });
    setToast(translateSystem(getBrowserLocale(), "Workday started."));
  }
  function startWork() {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
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
    setToast(translateSystem(getBrowserLocale(), data.settings.workTimingMode === "flexible" ? "Previous-day clock-out was estimated from the last saved activity; please review it." : "Previous-day clock-out was recorded from the schedule; please review it."));
  }
  function reviewPreviousRecord() {
    if (!pendingPreviousRecord) return;
    const date = pendingPreviousRecord.date;
    setPendingPreviousRecord(undefined);
    setSelectedDate(date);
  }
  function resumeAutoClosedWork() {
    if (selectedDate !== localDateKey()) return setToast(translateSystem(getBrowserLocale(), "Resume is available only for the current day."));
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    setData((previous) => {
      const current = previous.records[selectedDate] ?? record;
      const resumed = resumeAutoClosedRecord(current);
      if (resumed === current) return previous;
      return {
        ...previous,
        records: {
          ...previous.records,
          [selectedDate]: resumed,
        },
      };
    });
    setToast(translateSystem(getBrowserLocale(), "The day is active again; any disconnect gap was recorded as an unpaid break."));
  }

  function finishWork() {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    if (activeBreak || lunchRunning) return setToast(translateSystem(getBrowserLocale(), "Finish the lunch or break timer first."));
    const end = nowTime();
    const endedAt = new Date().toISOString();
    updateRecord((current) => ({ end, endedAt, activitySegments: closeActiveActivitySegments(current.activitySegments, end, endedAt) }));
    trackProductAnalytics({ name: "work_completed", properties: { mode: data.settings.mode, timing: data.settings.workTimingMode } });
    setToast(translateSystem(getBrowserLocale(), "Clock-out was recorded."));
  }
  function startLunch() {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    if (activeBreak) return setToast(translateSystem(getBrowserLocale(), "Finish the active break first."));
    const start = nowTime();
    const startedAt = new Date().toISOString();
    updateRecord((current) => ({ lunchStart: start, lunchEnd: "", lunchStartedAt: startedAt, lunchEndedAt: undefined, activitySegments: closeActiveActivitySegments(current.activitySegments, start, startedAt) }));
    setToast(translateSystem(getBrowserLocale(), "Lunch timer started."));
  }
  function finishLunch() {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    const end = nowTime();
    updateRecord({ lunchEnd: end, lunchEndedAt: new Date().toISOString(), lunchMinutes: spanMinutes(record.lunchStart ?? end, end) });
    setToast(translateSystem(getBrowserLocale(), "Lunch was recorded."));
  }
  function startBreak() {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    if (activeBreak || lunchRunning) return setToast(translateSystem(getBrowserLocale(), "Another timer is already running."));
    const start = nowTime();
    const startedAt = new Date().toISOString();
    updateRecord((current) => ({
      breaks: [...current.breaks, { id: crypto.randomUUID(), start, end: "", startedAt, title: translateSystem(getBrowserLocale(), "Personal break"), paid: false }],
      activitySegments: closeActiveActivitySegments(current.activitySegments, start, startedAt),
    }));
    setToast(translateSystem(getBrowserLocale(), "Break timer started."));
  }
  function finishBreak(minutes?: number) {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    if (!activeBreak) return;
    const end = minutes ? minutesToTime(timeToMinutes(activeBreak.start) + minutes) : nowTime();
    updateRecord((current) => ({ breaks: current.breaks.map((item) => item.id === activeBreak.id ? { ...item, end,
      endedAt: minutes && item.startedAt ? new Date(new Date(item.startedAt).getTime() + minutes * 60_000).toISOString() : new Date().toISOString() } : item) }));
    setToast(minutes ? translateSystem(getBrowserLocale(), "{minutes}-minute break was recorded.", { minutes: formatLocaleNumber(getBrowserLocale(), minutes) }) : translateSystem(getBrowserLocale(), "Break ended."));
  }

  function createWorkProject(name: string) {
    if (isDuplicateWorkProjectName(data.workProjects, name)) return undefined;
    const project = buildWorkProject({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() });
    if (!project) return undefined;
    setData((previous) => isDuplicateWorkProjectName(previous.workProjects, project.name)
      ? previous
      : { ...previous, workProjects: [...previous.workProjects, project] });
    return project.id;
  }

  function startActivitySegment(kind: ActivityKind, projectContext?: ActivityProjectContext, title?: string) {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    if (!record.start || record.end) return setToast(translateSystem(getBrowserLocale(), "Start the workday before tracking an activity."));
    if (activeBreak || lunchRunning) return setToast(translateSystem(getBrowserLocale(), "Finish the active pause before starting an activity."));
    const start = nowTime();
    const startedAt = new Date().toISOString();
    updateActivitySegments((segments) => [
      ...closeActiveActivitySegments(segments, start, startedAt),
      createActivitySegment({
        id: crypto.randomUUID(),
        kind,
        title,
        projectId: projectContext?.source === "freelance" ? projectContext.id : undefined,
        workProjectId: projectContext?.source === "work" ? projectContext.id : undefined,
        start,
        startedAt,
      }),
    ]);
    trackProductAnalytics({ name: "feature_used", properties: { feature: "activity-segments" } });
    setToast(translateSystem(getBrowserLocale(), "Activity segment started."));
  }
  function stopActivitySegment() {
    if (!ensureLiveTimerOwnership()) return setToast(translateSystem(getBrowserLocale(), "Timer control is active in another tab."));
    const end = nowTime();
    const endedAt = new Date().toISOString();
    updateActivitySegments((segments) => closeActiveActivitySegments(segments, end, endedAt));
    setToast(translateSystem(getBrowserLocale(), "Activity segment stopped."));
  }
  function updateActivitySegmentDuration(segmentId: string, minutes: number) {
    updateActivitySegments((segments) => updateCompletedActivitySegmentDuration(segments, segmentId, minutes));
    setToast(translateSystem(getBrowserLocale(), "Activity duration updated."));
  }
  function deleteActivitySegment(segmentId: string) {
    updateActivitySegments((segments) => removeCompletedActivitySegment(segments, segmentId));
    setToast(translateSystem(getBrowserLocale(), "Activity deleted."));
  }
  return { updateRecord, resetRecord, undoResetRecord, dismissResetUndo, resetUndoDate: resetUndo?.date, startWork, resumeAutoClosedWork, finishWork, startLunch, finishLunch, startBreak, finishBreak, createWorkProject, startActivitySegment, stopActivitySegment, updateActivitySegmentDuration, deleteActivitySegment,
    pendingPreviousRecord, closePreviousAndStart, reviewPreviousRecord, dismissPreviousRecord: () => setPendingPreviousRecord(undefined) };
}
