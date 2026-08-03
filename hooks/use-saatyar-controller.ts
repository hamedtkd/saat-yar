"use client";

import { useMemo, useState } from "react";
import { isValidAppData, parseBackup } from "@/lib/backup-schema";
import { colors, createLeaveDraft, defaultSettings } from "@/lib/constants";
import { exportCsv, exportExcel } from "@/lib/exporters";
import { normaliseData } from "@/lib/data/normalise";
import { APP_DATA_SCHEMA_VERSION } from "@/lib/data/version";
import { emptyRecord, entryMinutes, localDateKey, nowTime } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import { calc, minutesToTime, spanMinutes } from "@/lib/time-engine";
import { getDailyTargetMinutes, getWorkScheduleDay } from "@/lib/work-schedule";
import type { AppData, ClientDraft, LeaveEntry, Mode, ProjectDraft, ReportFilter, TimerDraft, WorkRecord } from "@/lib/types";
import { usePersistedAppData } from "./use-persisted-app-data.ts";

const initialTimerDraft: TimerDraft = { projectId: "", task: "", note: "", billable: true };
const initialClientDraft: ClientDraft = { name: "", email: "", note: "" };
const initialProjectDraft: ProjectDraft = { name: "", clientId: "", rate: 850_000, budgetHours: 60, note: "" };
const initialFilters: ReportFilter = { clientId: "all", projectId: "all", billable: "all", query: "" };

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

  const selectedSchedule = getWorkScheduleDay(selectedDate, data.settings);
  const dailyTarget = getDailyTargetMinutes(selectedDate, data.settings);
  const storedRecord = data.records[selectedDate] ?? {
    ...emptyRecord(selectedDate, data.settings),
    lunchMinutes: selectedSchedule.lunchMinutes,
  };
  const selectedHoliday = getHolidayInfo(selectedDate, {
    mode: data.settings.mode,
    manualHoliday: storedRecord.holiday,
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
    overrides: data.holidayOverrides,
  });
  const record = { ...storedRecord, holiday: selectedHoliday.isHoliday };
  const todayCalc = calc(record, dailyTarget);
  const suggestedExit = minutesToTime(calc({ ...record, start: record.start || selectedSchedule.start }, dailyTarget).plannedExit);
  const selectedMonth = selectedDate.slice(0, 7);
  const monthRecords = useMemo(
    () => Object.values(data.records)
      .filter((item) => item.date.startsWith(selectedMonth))
      .map((item) => ({
        ...item,
        holiday: getHolidayInfo(item.date, {
          mode: data.settings.mode,
          manualHoliday: item.holiday,
          includeOfficialHolidays: data.settings.autoOfficialHolidays,
          includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
          overrides: data.holidayOverrides,
        }).isHoliday,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [data.records, data.holidayOverrides, data.settings.autoOfficialHolidays, data.settings.autoWeeklyHoliday, data.settings.mode, selectedMonth],
  );
  const monthStats = useMemo(() => monthRecords.reduce((acc, item) => {
    const itemTarget = getDailyTargetMinutes(item.date, data.settings);
    const result = calc(item, itemTarget);
    acc.worked += result.worked;
    acc.target += item.holiday ? 0 : itemTarget;
    acc.balance += result.balance;
    acc.breaks += result.breakMinutes + result.unpaidLunchMinutes;
    return acc;
  }, { worked: 0, target: 0, balance: 0, breaks: 0 }), [monthRecords, data.settings]);
  const activeEntry = data.timeEntries.find((entry) => !entry.endedAt);
  const activeBreak = record.breaks.find((item) => item.start && !item.end);
  const lunchRunning = Boolean(record.lunchStart && !record.lunchEnd);
  const usedLeave = data.leaves.reduce((sum, entry) => sum + (entry.type === "full" ? dailyTarget : entry.type === "half" ? dailyTarget / 2 : entry.minutes), 0);
  const leaveAvailable = data.settings.leaveBalanceMinutes + data.settings.monthlyLeaveMinutes - usedLeave;
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId);

  function saveRecord(next: WorkRecord) {
    setData((previous) => ({ ...previous, records: { ...previous.records, [selectedDate]: next } }));
  }

  function updateRecord(patch: Partial<WorkRecord>) {
    saveRecord({ ...record, ...patch });
  }

  function startWork() {
    updateRecord({ start: nowTime(), end: "", startedAt: new Date().toISOString(), endedAt: undefined });
    setToast("شروع روز ثبت شد");
  }

  function finishWork() {
    if (activeBreak || lunchRunning) return setToast("ابتدا تایمر ناهار یا وقفه را پایان دهید");
    updateRecord({ end: nowTime(), endedAt: new Date().toISOString() });
    setToast("ساعت خروج ثبت شد");
  }

  function startLunch() {
    if (activeBreak) return setToast("ابتدا وقفه در حال اجرا را پایان دهید");
    updateRecord({ lunchStart: nowTime(), lunchEnd: "", lunchStartedAt: new Date().toISOString(), lunchEndedAt: undefined });
    setToast("تایمر ناهار شروع شد");
  }

  function finishLunch() {
    const end = nowTime();
    updateRecord({ lunchEnd: end, lunchEndedAt: new Date().toISOString(), lunchMinutes: spanMinutes(record.lunchStart ?? end, end) });
    setToast("ناهار ثبت شد");
  }

  function startBreak() {
    if (activeBreak || lunchRunning) return setToast("یک تایمر دیگر در حال اجراست");
    updateRecord({ breaks: [...record.breaks, { id: crypto.randomUUID(), start: nowTime(), end: "", startedAt: new Date().toISOString(), title: "وقفه شخصی", paid: false }] });
    setToast("تایمر وقفه شروع شد");
  }

  function finishBreak(minutes?: number) {
    if (!activeBreak) return;
    const end = minutes ? minutesToTime(timeToMinutes(activeBreak.start) + minutes) : nowTime();
    updateRecord({
      breaks: record.breaks.map((item) => item.id === activeBreak.id ? {
        ...item,
        end,
        endedAt: minutes && item.startedAt ? new Date(new Date(item.startedAt).getTime() + minutes * 60_000).toISOString() : new Date().toISOString(),
      } : item),
    });
    setToast(minutes ? `وقفه ${minutes.toLocaleString("fa-IR")} دقیقه‌ای ثبت شد` : "وقفه پایان یافت");
  }

  function toggleProjectTimer(projectId?: string) {
    if (activeEntry) {
      setData((previous) => ({ ...previous, timeEntries: previous.timeEntries.map((entry) => entry.id === activeEntry.id ? { ...entry, endedAt: new Date().toISOString() } : entry) }));
      setToast("تایمر پروژه متوقف و ذخیره شد");
      return;
    }
    const project = data.projects.find((item) => item.id === (projectId || timerDraft.projectId));
    if (!project) return setToast("ابتدا یک پروژه انتخاب کنید");
    setData((previous) => ({
      ...previous,
      timeEntries: [{ id: crypto.randomUUID(), clientId: project.clientId, projectId: project.id, task: timerDraft.task, startedAt: new Date().toISOString(), endedAt: null, note: timerDraft.note, billable: timerDraft.billable, effectiveRate: project.rate }, ...previous.timeEntries],
    }));
    setToast("تایمر پروژه شروع شد");
  }

  function addClient() {
    if (!clientDraft.name.trim()) return setToast("نام مشتری را وارد کنید");
    const id = crypto.randomUUID();
    setData((previous) => ({ ...previous, clients: [...previous.clients, { id, name: clientDraft.name.trim(), email: clientDraft.email.trim(), note: clientDraft.note.trim(), color: colors[previous.clients.length % colors.length], archived: false }] }));
    setClientDraft(initialClientDraft);
    setProjectDraft((previous) => ({ ...previous, clientId: previous.clientId || id }));
    setShowClientForm(false);
    setToast("مشتری جدید ذخیره شد");
  }

  function addProject() {
    if (!projectDraft.name.trim() || !projectDraft.clientId) return setToast("نام پروژه و مشتری الزامی است");
    const id = crypto.randomUUID();
    setData((previous) => ({ ...previous, projects: [...previous.projects, { id, clientId: projectDraft.clientId, name: projectDraft.name.trim(), rate: projectDraft.rate, budgetHours: projectDraft.budgetHours, note: projectDraft.note, color: colors[previous.projects.length % colors.length], status: "active", billable: true }] }));
    setSelectedProjectId(id);
    setTimerDraft((previous) => ({ ...previous, projectId: id }));
    setProjectDraft({ ...initialProjectDraft, clientId: projectDraft.clientId });
    setShowProjectForm(false);
    setToast("پروژه ساخته شد");
  }

  function saveLeave() {
    if (leaveDraft.endDate < leaveDraft.startDate) return setToast("بازه تاریخ معتبر نیست");
    const overlap = data.leaves.some((item) => item.id !== leaveDraft.id && item.startDate <= leaveDraft.endDate && item.endDate >= leaveDraft.startDate);
    if (overlap) return setToast("این بازه با مرخصی دیگری هم‌پوشانی دارد");
    const entry = { ...leaveDraft, id: leaveDraft.id || crypto.randomUUID(), createdAt: leaveDraft.createdAt || new Date().toISOString() };
    setData((previous) => ({ ...previous, leaves: leaveDraft.id ? previous.leaves.map((item) => item.id === leaveDraft.id ? entry : item) : [entry, ...previous.leaves] }));
    setLeaveDraft(createLeaveDraft());
    setToast(leaveDraft.id ? "مرخصی ویرایش شد" : "مرخصی ثبت شد");
  }

  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function backupBlob(source = data) {
    return new Blob([JSON.stringify({ appName: "ساعت‌یار", schemaVersion: APP_DATA_SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: source }, null, 2)], { type: "application/json" });
  }

  function exportBackup() {
    downloadBlob(backupBlob(), `saatyar-backup-${localDateKey()}.json`);
    setToast("فایل پشتیبان دانلود شد");
  }

  function previewImport(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackup(JSON.parse(String(reader.result)));
        if (!isValidAppData(parsed)) throw new Error("invalid");
        setImportPreview(normaliseData(parsed, defaultSettings));
        setToast("فایل معتبر است؛ روش بازیابی را انتخاب کنید");
      } catch {
        setImportPreview(null);
        setToast("ساختار فایل پشتیبان معتبر نیست");
      }
    };
    reader.readAsText(file);
  }

  async function applyImport(mode: "merge" | "replace") {
    if (!importPreview) return;
    if (mode === "replace") downloadBlob(backupBlob(), `saatyar-before-replace-${localDateKey()}.json`);
    const next = mode === "replace" ? importPreview : {
      settings: { ...data.settings, ...importPreview.settings },
      records: { ...data.records, ...importPreview.records },
      leaves: [...data.leaves, ...importPreview.leaves.filter((item) => !data.leaves.some((current) => current.id === item.id))],
      clients: [...data.clients, ...importPreview.clients.filter((item) => !data.clients.some((current) => current.id === item.id))],
      projects: [...data.projects, ...importPreview.projects.filter((item) => !data.projects.some((current) => current.id === item.id))],
      timeEntries: [...data.timeEntries, ...importPreview.timeEntries.filter((item) => !data.timeEntries.some((current) => current.id === item.id))],
    };
    await storage.save(next);
    setData(next);
    setImportPreview(null);
    setToast(mode === "replace" ? "داده‌ها با موفقیت جایگزین شدند" : "داده‌ها با موفقیت ادغام شدند");
  }

  const filteredEntries = data.timeEntries.filter((entry) => {
    const project = data.projects.find((item) => item.id === entry.projectId);
    const query = reportFilter.query.trim().toLocaleLowerCase("fa");
    return (reportFilter.clientId === "all" || entry.clientId === reportFilter.clientId) &&
      (reportFilter.projectId === "all" || entry.projectId === reportFilter.projectId) &&
      (reportFilter.billable === "all" || String(entry.billable) === reportFilter.billable) &&
      (!query || entry.note.toLocaleLowerCase("fa").includes(query) || project?.name.toLocaleLowerCase("fa").includes(query));
  });
  const reportBillable = filteredEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const reportIncome = filteredEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
  const reportHeaders = ["تاریخ", "مشتری", "پروژه", "شرح", "مدت (دقیقه)", "نرخ مؤثر", "مبلغ", "قابل صورتحساب"];

  function reportRows() {
    return filteredEntries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      return [new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(new Date(entry.startedAt)), client?.name ?? "", project?.name ?? "", entry.note, minutes, entry.effectiveRate, entry.billable ? Math.round(minutes / 60 * entry.effectiveRate) : 0, entry.billable ? "بله" : "خیر"];
    });
  }

  function exportReport(kind: "excel" | "csv") {
    if (kind === "excel") exportExcel(`گزارش-صورتحساب-${localDateKey()}.xls`, "گزارش صورتحساب", reportHeaders, reportRows());
    else exportCsv(`گزارش-صورتحساب-${localDateKey()}.csv`, reportHeaders, reportRows());
    setToast(`گزارش ${kind === "excel" ? "Excel" : "CSV"} دانلود شد`);
  }

  function changeMode(mode: Mode) {
    setData((previous) => ({ ...previous, settings: { ...previous.settings, mode } }));
    setToast(`فضای کاری روی «${{ employee: "کارمند", freelancer: "فریلنسر", hybrid: "ترکیبی" }[mode]}» قرار گرفت`);
  }

  async function requestPersistence() {
    const persistedValue = await storage.requestPersistence();
    persisted.setStorageInfo(await storage.estimate());
    setToast(persistedValue ? "ذخیره پایدار فعال شد" : "مرورگر ذخیره پایدار را فعال نکرد؛ پشتیبان‌گیری را ادامه دهید");
  }

  return {
    ...persisted,
    selectedDate, setSelectedDate, selectedProjectId, setSelectedProjectId,
    onboardingStep, setOnboardingStep, showClientForm, setShowClientForm, showProjectForm, setShowProjectForm,
    clientDraft, setClientDraft, projectDraft, setProjectDraft, timerDraft, setTimerDraft,
    editingEntry, setEditingEntry, reportFilter, setReportFilter, leaveDraft, setLeaveDraft, importPreview,
    dailyTarget, record, todayCalc, suggestedExit, monthRecords, monthStats, activeEntry, activeBreak,
    lunchRunning, usedLeave, leaveAvailable, selectedProject, selectedHoliday, filteredEntries, reportBillable, reportIncome,
    updateRecord, startWork, finishWork, startLunch, finishLunch, startBreak, finishBreak, toggleProjectTimer,
    addClient, addProject, saveLeave, exportBackup, previewImport, applyImport, exportReport, changeMode, requestPersistence,
  };
}
