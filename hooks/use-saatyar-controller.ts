"use client";

import { useState } from "react";
import { createLeaveDraft } from "@/lib/constants";
import { localDateKey } from "@/lib/format";
import type { AppData, ClientDraft, LeaveEntry, ProjectDraft, ReportFilter, TimerDraft } from "@/lib/types";
import { usePersistedAppData } from "./use-persisted-app-data.ts";
import { initialClientDraft, initialFilters, initialProjectDraft, initialTimerDraft } from "./controller/defaults";
import { useAttendanceActions } from "./controller/use-attendance-actions";
import { useBackupActions } from "./controller/use-backup-actions";
import { useBusinessActions } from "./controller/use-business-actions";
import { useControllerDerived } from "./controller/use-controller-derived";
import { useNotificationReminders } from "./controller/use-notification-reminders";
import { useReportActions } from "./controller/use-report-actions";

export function useSaatyarController() {
  const persisted = usePersistedAppData();
  const { data, setData, setToast, storage } = persisted;
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(2);
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

  const derived = useControllerDerived(data, selectedDate, selectedProjectId, reportFilter);
  const attendance = useAttendanceActions({
    data, record: derived.record, selectedDate, activeBreak: derived.activeBreak,
    lunchRunning: derived.lunchRunning, setData, setSelectedDate, setToast,
  });
  const business = useBusinessActions({
    data, setData, setToast, clientDraft, setClientDraft, projectDraft, setProjectDraft,
    timerDraft, setTimerDraft, leaveDraft, setLeaveDraft, setSelectedProjectId,
    setShowClientForm, setShowProjectForm, activeEntry: derived.activeEntry,
  });
  const backup = useBackupActions({ data, setData, setToast, importPreview, setImportPreview, storage });
  const reports = useReportActions({
    data, filteredEntries: derived.filteredEntries,
    filteredMonthRecords: derived.filteredMonthRecords, setToast,
  });
  const notifications = useNotificationReminders({
    settings: data.settings.notificationSettings, selectedDate, record: derived.record,
    dailyTarget: derived.dailyTarget, worked: derived.todayCalc.worked,
    credited: derived.todayCalc.credited, suggestedExit: derived.suggestedExit, setToast,
  });

  async function requestPersistence() {
    const persistedValue = await storage.requestPersistence();
    persisted.setStorageInfo(await storage.estimate());
    setToast(persistedValue ? "ذخیره پایدار فعال شد" : "مرورگر ذخیره پایدار را فعال نکرد؛ پشتیبان‌گیری را ادامه دهید");
  }

  return {
    ...persisted,
    selectedDate, setSelectedDate, selectedProjectId, setSelectedProjectId,
    onboardingStep, setOnboardingStep, showClientForm, setShowClientForm,
    showProjectForm, setShowProjectForm, clientDraft, setClientDraft,
    projectDraft, setProjectDraft, timerDraft, setTimerDraft,
    editingEntry, setEditingEntry, reportFilter, setReportFilter,
    leaveDraft, setLeaveDraft, importPreview, financialsHidden, setFinancialsHidden,
    ...derived, ...attendance, ...business, ...backup, ...reports, ...notifications,
    requestPersistence,
  };
}
