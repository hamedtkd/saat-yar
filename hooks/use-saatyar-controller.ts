"use client";

import { useState } from "react";
import { createLeaveDraft } from "@/lib/constants";
import { localDateKey } from "@/lib/format";
import { getBrowserLocale, type CalendarSystem } from "@/lib/i18n";
import { translateSystem } from "@/lib/i18n/system";
import type { AppData, ClientDraft, LeaveEntry, ProjectDraft, ReportFilter, TimerDraft } from "@/lib/types";
import { usePersistedAppData } from "./use-persisted-app-data.ts";
import { initialClientDraft, initialFilters, initialProjectDraft, initialTimerDraft } from "./controller/defaults";
import { useAttendanceActions } from "./controller/use-attendance-actions";
import { useBackupActions } from "./controller/use-backup-actions";
import { useBusinessActions } from "./controller/use-business-actions";
import { useControllerDerived } from "./controller/use-controller-derived";
import { useNotificationReminders } from "./controller/use-notification-reminders";
import { useLiveTimerOwnership } from "./use-live-timer-ownership";
import { useReportActions } from "./controller/use-report-actions";
import { useOnboardingSession } from "./use-onboarding-session";

export function useSaatyarController(calendar: CalendarSystem = "persian") {
  const persisted = usePersistedAppData();
  const { data, setData, setToast, storage } = persisted;
  const [selectedDate, setSelectedDateState] = useState(localDateKey());
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const onboarding = useOnboardingSession(persisted.ready);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [clientDraft, setClientDraft] = useState<ClientDraft>(initialClientDraft);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(initialProjectDraft);
  const [timerDraft, setTimerDraft] = useState<TimerDraft>(initialTimerDraft);
  const [editingEntry, setEditingEntry] = useState("");
  const [reportFilter, setReportFilter] = useState<ReportFilter>(initialFilters);
  const [leaveDraft, setLeaveDraft] = useState<LeaveEntry>(createLeaveDraft());
  const [importPreview, setImportPreview] = useState<AppData | null>(null);
  const [financialsHidden, setFinancialsHidden] = useState(false);

  function setSelectedDate(date: string) {
    setSelectedDateState(date);
    setTimerDraft({ ...initialTimerDraft, note: data.records[date]?.note ?? "" });
    setEditingEntry("");
  }

  const derived = useControllerDerived(data, selectedDate, selectedProjectId, reportFilter, calendar);
  const liveTimerActive = Boolean(derived.activeEntry || Object.values(data.records).some((item) =>
    (item.start && !item.end) || (item.lunchStart && !item.lunchEnd) || item.breaks.some((entry) => !entry.end) || (item.activitySegments ?? []).some((entry) => !entry.end),
  ));
  const liveTimerOwnership = useLiveTimerOwnership(liveTimerActive);
  const attendance = useAttendanceActions({
    data, record: derived.record, selectedDate, activeBreak: derived.activeBreak,
    lunchRunning: derived.lunchRunning, setData, setSelectedDate, setToast,
    ensureLiveTimerOwnership: liveTimerOwnership.ensureOwnership,
  });
  const business = useBusinessActions({
    data, setData, setToast, clientDraft, setClientDraft, projectDraft, setProjectDraft,
    timerDraft, setTimerDraft, leaveDraft, setLeaveDraft, setSelectedProjectId,
    setShowClientForm, setShowProjectForm, activeEntry: derived.activeEntry,
    ensureLiveTimerOwnership: liveTimerOwnership.ensureOwnership,
  });
  const backup = useBackupActions({ data, setData, setToast, importPreview, setImportPreview, storage });
  const reports = useReportActions({
    data, filteredEntries: derived.filteredEntries,
    filteredMonthRecords: derived.filteredMonthRecords, calendar, setToast,
  });
  const notifications = useNotificationReminders({
    settings: data.settings.notificationSettings, selectedDate, record: derived.record,
    dailyTarget: derived.dailyTarget, worked: derived.todayCalc.worked,
    credited: derived.todayCalc.credited, suggestedExit: derived.suggestedExit, setToast,
  });

  async function requestPersistence() {
    const persistedValue = await storage.requestPersistence();
    persisted.setStorageInfo(await storage.estimate());
    setToast(persistedValue ? translateSystem(getBrowserLocale(), "Persistent storage was enabled.") : translateSystem(getBrowserLocale(), "Browser did not enable persistent storage; keep making backups."));
  }

  return {
    ...persisted,
    selectedDate, setSelectedDate, selectedProjectId, setSelectedProjectId,
    ...onboarding, showClientForm, setShowClientForm,
    showProjectForm, setShowProjectForm, clientDraft, setClientDraft,
    projectDraft, setProjectDraft, timerDraft, setTimerDraft,
    editingEntry, setEditingEntry, reportFilter, setReportFilter,
    leaveDraft, setLeaveDraft, importPreview, financialsHidden, setFinancialsHidden,
    ...derived, ...attendance, ...business, ...backup, ...reports, ...notifications,
    requestPersistence, liveTimerOwnership,
  };
}
