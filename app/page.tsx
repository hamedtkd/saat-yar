"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Coffee,
  Database,
  Download,
  Edit3,
  FileSpreadsheet,
  Filter,
  Folder,
  HardDrive,
  Info,
  LayoutDashboard,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Printer,
  Save,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Square,
  Tag,
  Trash2,
  TrendingUp,
  Umbrella,
  Upload,
  UserRound,
  Users,
  WalletCards,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { JalaliDatePicker, TimePicker } from "./date-time-pickers";
import { isValidAppData, parseBackup } from "./backup-schema";
import { exportCsv, exportExcel } from "./exporters";
import { IndexedDbStorageAdapter, loadWithLegacyMigration } from "./storage";
import { calc, minutesToTime, spanMinutes, timeToMinutes } from "./time-engine";

type Mode = "employee" | "freelancer" | "hybrid";
type Tab = "today" | "month" | "clients" | "projects" | "reports" | "leave" | "settings";
type BreakItem = { id: string; start: string; end: string; title: string; paid?: boolean; startedAt?: string; endedAt?: string };
type WorkRecord = {
  date: string;
  start: string;
  end: string;
  startedAt?: string;
  endedAt?: string;
  lunchMinutes: number;
  lunchStart?: string;
  lunchEnd?: string;
  lunchStartedAt?: string;
  lunchEndedAt?: string;
  lunchPaid?: boolean;
  breaks: BreakItem[];
  leaveMinutes: number;
  leaveType: "none" | "hourly" | "full";
  note: string;
  holiday: boolean;
};
type Settings = {
  name: string;
  onboarded: boolean;
  weeklyMinutes: number;
  workDays: number;
  defaultStart: string;
  defaultEnd: string;
  lunchMinutes: number;
  leaveBalanceMinutes: number;
  monthlyLeaveMinutes: number;
  salary: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
  mode: Mode;
};
type LeaveEntry = {
  id: string;
  startDate: string;
  endDate: string;
  type: "full" | "half" | "hourly";
  minutes: number;
  note: string;
  createdAt: string;
};
type Client = {
  id: string;
  name: string;
  color: string;
  email?: string;
  note?: string;
  archived: boolean;
};
type Project = {
  id: string;
  clientId: string;
  name: string;
  rate: number;
  color: string;
  status: "active" | "paused" | "completed" | "archived";
  budgetHours?: number;
  note?: string;
  billable?: boolean;
};
type TimeEntry = {
  id: string;
  clientId: string;
  projectId: string;
  task?: string;
  startedAt: string;
  endedAt: string | null;
  note: string;
  billable: boolean;
  effectiveRate: number;
};
type AppData = {
  settings: Settings;
  records: Record<string, WorkRecord>;
  leaves: LeaveEntry[];
  clients: Client[];
  projects: Project[];
  timeEntries: TimeEntry[];
};

const defaultSettings: Settings = {
  name: "",
  onboarded: false,
  weeklyMinutes: 42 * 60 + 30,
  workDays: 5,
  defaultStart: "07:30",
  defaultEnd: "16:15",
  lunchMinutes: 45,
  leaveBalanceMinutes: 26 * 60,
  monthlyLeaveMinutes: 16 * 60,
  salary: 30_000_000,
  overtimeMultiplier: 1.4,
  holidayMultiplier: 1.4,
  mode: "employee",
};
const colors = ["#0969a9", "#f4a500", "#0a9d63", "#7d55b6", "#e76f1e", "#238d9a"];
const fa = new Intl.NumberFormat("fa-IR");
const faDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function nowTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
function emptyRecord(date: string, settings: Settings): WorkRecord {
  return {
    date,
    start: "",
    end: "",
    lunchMinutes: settings.lunchMinutes,
    breaks: [],
    leaveMinutes: 0,
    leaveType: "none",
    note: "",
    holiday: false,
  };
}
function duration(value: number, signed = false) {
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : "";
  const minutes = Math.abs(Math.round(value));
  return `${sign}${fa.format(Math.floor(minutes / 60))}:${faDigits(String(minutes % 60).padStart(2, "0"))}`;
}
function money(value: number) {
  return fa.format(Math.round(value));
}
function jalali(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", options ?? {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T12:00:00`));
}
function jalaliParts(date: Date) {
  const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: read("year"), month: read("month"), day: read("day") };
}
function jalaliMonthCells(value: string) {
  const pivot = new Date(`${value}T12:00:00`);
  const target = jalaliParts(pivot);
  const first = new Date(pivot);
  while (jalaliParts(first).day !== 1) first.setDate(first.getDate() - 1);
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 1) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(date.getDate() + index);
    const parts = jalaliParts(date);
    return {
      date,
      key: localDateKey(date),
      day: parts.day,
      inMonth: parts.year === target.year && parts.month === target.month,
    };
  });
}
function entryMinutes(entry: TimeEntry, now = Date.now()) {
  const end = entry.endedAt ? new Date(entry.endedAt).getTime() : now;
  return Math.max(0, Math.round((end - new Date(entry.startedAt).getTime()) / 60_000));
}
function isAppData(value: unknown): value is AppData {
  return isValidAppData(value);
}

function NumberField({
  value,
  onValueChange,
  min = 0,
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
}) {
  return (
    <Input
      type="number"
      min={min}
      value={Number.isFinite(value) ? value : 0}
      onChange={(event) => onValueChange(Math.max(min, Number(event.target.value) || 0))}
    />
  );
}

function LiveDuration({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const seconds = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  return <>{`${fa.format(Math.floor(seconds / 3600))}:${faDigits(String(Math.floor(seconds / 60) % 60).padStart(2, "0"))}:${faDigits(String(seconds % 60).padStart(2, "0"))}`}</>;
}

function MetricCard({
  icon,
  label,
  value,
  suffix,
  tone = "green",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  tone?: "green" | "blue" | "amber" | "purple";
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span className="metric-icon">{icon}</span>
      <div><small>{label}</small><strong>{value}</strong>{suffix && <span>{suffix}</span>}</div>
    </article>
  );
}

export default function Home() {
  const storage = useMemo(() => new IndexedDbStorageAdapter<AppData>(), []);
  const [data, setData] = useState<AppData>({
    settings: defaultSettings,
    records: {},
    leaves: [],
    clients: [],
    projects: [],
    timeEntries: [],
  });
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0, persisted: false });
  const [onboardingStep, setOnboardingStep] = useState(2);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [clientDraft, setClientDraft] = useState({ name: "", email: "", note: "" });
  const [projectDraft, setProjectDraft] = useState({
    name: "",
    clientId: "",
    rate: 850_000,
    budgetHours: 60,
    note: "",
  });
  const [timerDraft, setTimerDraft] = useState({ projectId: "", task: "", note: "", billable: true });
  const [editingEntry, setEditingEntry] = useState("");
  const [reportFilter, setReportFilter] = useState({ clientId: "all", projectId: "all", billable: "all", query: "" });
  const [leaveDraft, setLeaveDraft] = useState<LeaveEntry>({
    id: "",
    startDate: localDateKey(),
    endDate: localDateKey(),
    type: "full",
    minutes: 120,
    note: "",
    createdAt: "",
  });
  const [importPreview, setImportPreview] = useState<AppData | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { value, migrated } = await loadWithLegacyMigration(storage, isAppData);
        if (value) {
          setData({
            settings: { ...defaultSettings, ...(value.settings ?? {}) },
            records: value.records ?? {},
            leaves: value.leaves ?? [],
            clients: (value.clients ?? []).map((client) => ({ ...client, archived: Boolean(client.archived) })),
            projects: (value.projects ?? []).map((project) => ({
              ...project,
              status: project.status ?? "active",
              billable: project.billable ?? true,
            })),
            timeEntries: value.timeEntries ?? [],
          });
          if (migrated) setToast("اطلاعات نسخه قبلی با موفقیت منتقل شد");
        }
        setStorageInfo(await storage.estimate());
      } catch {
        setToast("خواندن اطلاعات قبلی ممکن نشد؛ از بخش تنظیمات فایل پشتیبان را بازیابی کنید");
      } finally {
        setReady(true);
      }
    })();
  }, [storage]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      void storage.save(data).then(async () => setStorageInfo(await storage.estimate()));
    }, 220);
    return () => window.clearTimeout(id);
  }, [data, ready, storage]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const dailyTarget = Math.max(
    1,
    timeToMinutes(data.settings.defaultEnd) -
      timeToMinutes(data.settings.defaultStart) -
      data.settings.lunchMinutes,
  );
  const record = data.records[selectedDate] ?? emptyRecord(selectedDate, data.settings);
  const calcRecord = { ...record, start: record.start || data.settings.defaultStart };
  const todayCalc = calc(calcRecord, dailyTarget);
  const suggestedExit = minutesToTime(todayCalc.plannedExit);
  const selectedMonth = selectedDate.slice(0, 7);
  const monthRecords = useMemo(
    () => Object.values(data.records).filter((item) => item.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date)),
    [data.records, selectedMonth],
  );
  const monthStats = useMemo(() => monthRecords.reduce((acc, item) => {
    const result = calc({ ...item, start: item.start || data.settings.defaultStart }, dailyTarget);
    acc.worked += result.worked;
    acc.target += item.holiday ? 0 : dailyTarget;
    acc.balance += result.balance;
    acc.breaks += result.breakMinutes + item.lunchMinutes;
    return acc;
  }, { worked: 0, target: 0, balance: 0, breaks: 0 }), [monthRecords, dailyTarget, data.settings.defaultStart]);
  const activeEntry = data.timeEntries.find((entry) => !entry.endedAt);
  const activeBreak = record.breaks.find((item) => item.start && !item.end);
  const lunchRunning = Boolean(record.lunchStart && !record.lunchEnd);
  const usedLeave = data.leaves.reduce((sum, entry) => (
    sum + (entry.type === "full" ? dailyTarget : entry.type === "half" ? dailyTarget / 2 : entry.minutes)
  ), 0);
  const leaveAvailable = data.settings.leaveBalanceMinutes + data.settings.monthlyLeaveMinutes - usedLeave;

  function saveRecord(next: WorkRecord) {
    setData((prev) => ({ ...prev, records: { ...prev.records, [selectedDate]: next } }));
  }
  function updateRecord(patch: Partial<WorkRecord>) {
    saveRecord({ ...record, ...patch });
  }
  function startWork() {
    updateRecord({ start: nowTime(), end: "", startedAt: new Date().toISOString(), endedAt: undefined });
    setToast("شروع روز ثبت شد");
  }
  function finishWork() {
    if (activeBreak || lunchRunning) {
      setToast("ابتدا تایمر ناهار یا وقفه را پایان دهید");
      return;
    }
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
    updateRecord({
      lunchEnd: end,
      lunchEndedAt: new Date().toISOString(),
      lunchMinutes: spanMinutes(record.lunchStart ?? end, end),
    });
    setToast("ناهار ثبت شد");
  }
  function startBreak() {
    if (activeBreak || lunchRunning) return setToast("یک تایمر دیگر در حال اجراست");
    updateRecord({
      breaks: [...record.breaks, {
        id: crypto.randomUUID(),
        start: nowTime(),
        end: "",
        startedAt: new Date().toISOString(),
        title: "وقفه شخصی",
        paid: false,
      }],
    });
    setToast("تایمر وقفه شروع شد");
  }
  function finishBreak(minutes?: number) {
    if (!activeBreak) return;
    const end = minutes
      ? minutesToTime(timeToMinutes(activeBreak.start) + minutes)
      : nowTime();
    updateRecord({
      breaks: record.breaks.map((item) => item.id === activeBreak.id ? {
        ...item,
        end,
        endedAt: minutes && item.startedAt
          ? new Date(new Date(item.startedAt).getTime() + minutes * 60_000).toISOString()
          : new Date().toISOString(),
      } : item),
    });
    setToast(minutes ? `وقفه ${fa.format(minutes)} دقیقه‌ای ثبت شد` : "وقفه پایان یافت");
  }
  function toggleProjectTimer(projectId?: string) {
    if (activeEntry) {
      setData((prev) => ({
        ...prev,
        timeEntries: prev.timeEntries.map((entry) => entry.id === activeEntry.id
          ? { ...entry, endedAt: new Date().toISOString() }
          : entry),
      }));
      setToast("تایمر پروژه متوقف و ذخیره شد");
      return;
    }
    const project = data.projects.find((item) => item.id === (projectId || timerDraft.projectId));
    if (!project) return setToast("ابتدا یک پروژه انتخاب کنید");
    setData((prev) => ({
      ...prev,
      timeEntries: [{
        id: crypto.randomUUID(),
        clientId: project.clientId,
        projectId: project.id,
        task: timerDraft.task,
        startedAt: new Date().toISOString(),
        endedAt: null,
        note: timerDraft.note,
        billable: timerDraft.billable,
        effectiveRate: project.rate,
      }, ...prev.timeEntries],
    }));
    setToast("تایمر پروژه شروع شد");
  }
  function addClient() {
    if (!clientDraft.name.trim()) return setToast("نام مشتری را وارد کنید");
    const client: Client = {
      id: crypto.randomUUID(),
      name: clientDraft.name.trim(),
      email: clientDraft.email.trim(),
      note: clientDraft.note.trim(),
      color: colors[data.clients.length % colors.length],
      archived: false,
    };
    setData((prev) => ({ ...prev, clients: [...prev.clients, client] }));
    setClientDraft({ name: "", email: "", note: "" });
    setProjectDraft((prev) => ({ ...prev, clientId: prev.clientId || client.id }));
    setShowClientForm(false);
    setToast("مشتری جدید ذخیره شد");
  }
  function addProject() {
    if (!projectDraft.name.trim() || !projectDraft.clientId) return setToast("نام پروژه و مشتری الزامی است");
    const project: Project = {
      id: crypto.randomUUID(),
      clientId: projectDraft.clientId,
      name: projectDraft.name.trim(),
      rate: projectDraft.rate,
      budgetHours: projectDraft.budgetHours,
      note: projectDraft.note,
      color: colors[data.projects.length % colors.length],
      status: "active",
      billable: true,
    };
    setData((prev) => ({ ...prev, projects: [...prev.projects, project] }));
    setSelectedProjectId(project.id);
    setTimerDraft((prev) => ({ ...prev, projectId: project.id }));
    setProjectDraft({ name: "", clientId: project.clientId, rate: 850_000, budgetHours: 60, note: "" });
    setShowProjectForm(false);
    setToast("پروژه ساخته شد");
  }
  function saveLeave() {
    if (leaveDraft.endDate < leaveDraft.startDate) return setToast("بازه تاریخ معتبر نیست");
    const overlap = data.leaves.some((item) => (
      item.id !== leaveDraft.id &&
      item.startDate <= leaveDraft.endDate &&
      item.endDate >= leaveDraft.startDate
    ));
    if (overlap) return setToast("این بازه با مرخصی دیگری هم‌پوشانی دارد");
    const entry = {
      ...leaveDraft,
      id: leaveDraft.id || crypto.randomUUID(),
      createdAt: leaveDraft.createdAt || new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      leaves: leaveDraft.id
        ? prev.leaves.map((item) => item.id === leaveDraft.id ? entry : item)
        : [entry, ...prev.leaves],
    }));
    setLeaveDraft({ id: "", startDate: localDateKey(), endDate: localDateKey(), type: "full", minutes: 120, note: "", createdAt: "" });
    setToast(leaveDraft.id ? "مرخصی ویرایش شد" : "مرخصی ثبت شد");
  }
  function backupBlob(source = data) {
    return new Blob([JSON.stringify({
      appName: "ساعت‌یار",
      schemaVersion: 3,
      exportedAt: new Date().toISOString(),
      ...source,
    }, null, 2)], { type: "application/json" });
  }
  function downloadBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
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
        if (!isAppData(parsed)) throw new Error("invalid");
        setImportPreview({
          settings: { ...defaultSettings, ...parsed.settings },
          records: parsed.records ?? {},
          leaves: parsed.leaves ?? [],
          clients: parsed.clients ?? [],
          projects: parsed.projects ?? [],
          timeEntries: parsed.timeEntries ?? [],
        });
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
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId);

  const reportHeaders = ["تاریخ", "مشتری", "پروژه", "شرح", "مدت (دقیقه)", "نرخ مؤثر", "مبلغ", "قابل صورتحساب"];
  function reportRows(entries = filteredEntries) {
    return entries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      return [
        new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(new Date(entry.startedAt)),
        client?.name ?? "",
        project?.name ?? "",
        entry.note,
        minutes,
        entry.effectiveRate,
        entry.billable ? Math.round(minutes / 60 * entry.effectiveRate) : 0,
        entry.billable ? "بله" : "خیر",
      ];
    });
  }
  function exportReport(kind: "excel" | "csv") {
    if (kind === "excel") exportExcel(`گزارش-صورتحساب-${localDateKey()}.xls`, "گزارش صورتحساب", reportHeaders, reportRows());
    else exportCsv(`گزارش-صورتحساب-${localDateKey()}.csv`, reportHeaders, reportRows());
    setToast(`گزارش ${kind === "excel" ? "Excel" : "CSV"} دانلود شد`);
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode; hide?: boolean }[] = [
    { id: "today", label: "امروز", icon: <CalendarDays /> },
    { id: "month", label: "ماه من", icon: <LayoutDashboard />, hide: data.settings.mode === "freelancer" },
    { id: "clients", label: "مشتری‌ها", icon: <Users />, hide: data.settings.mode === "employee" },
    { id: "projects", label: "پروژه‌ها", icon: <Folder />, hide: data.settings.mode === "employee" },
    { id: "leave", label: "مرخصی‌ها", icon: <Umbrella />, hide: data.settings.mode === "freelancer" },
    { id: "reports", label: "گزارش‌ها", icon: <BarChart3 /> },
  ];

  function changeMode(mode: Mode) {
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, mode },
    }));
    if (
      (mode === "employee" && (tab === "clients" || tab === "projects")) ||
      (mode === "freelancer" && (tab === "month" || tab === "leave"))
    ) {
      setTab("today");
    }
    const labels: Record<Mode, string> = {
      employee: "کارمند",
      freelancer: "فریلنسر",
      hybrid: "ترکیبی",
    };
    setToast(`فضای کاری روی «${labels[mode]}» قرار گرفت`);
  }

  if (!ready) return <main className="loading"><Clock3 /> در حال آماده‌سازی ساعت‌یار…</main>;

  return (
    <main className="app-shell" dir="rtl">
      {toast && <div className="toast" role="status"><CheckCircle2 />{toast}</div>}

      {!data.settings.onboarded && (
        <div className="onboarding">
          <header className="onboarding-head">
            <div className="brand"><span><Clock3 /></span><div><strong>ساعت‌یار</strong><small>حساب کار، بدون حساب‌وکتاب</small></div></div>
            <span className="safe-note"><CheckCircle2 /> ذخیره خودکار</span>
          </header>
          <section className="wizard-shell">
            <div className="wizard-steps" aria-label="مراحل راه‌اندازی">
              {["خوش‌آمدید", "نوع استفاده", "برنامه کاری", "ذخیره‌سازی"].map((label, index) => (
                <div className={onboardingStep === index + 1 ? "active" : onboardingStep > index + 1 ? "done" : ""} key={label}>
                  <span>{onboardingStep > index + 1 ? <Check /> : fa.format(index + 1)}</span><small>{label}</small>
                </div>
              ))}
            </div>
            {onboardingStep === 1 && (
              <div className="wizard-page intro-step">
                <span className="wizard-logo"><Clock3 /></span>
                <h1>به ساعت‌یار خوش آمدی</h1>
                <p>زمان، مرخصی، پروژه و درآمدت را بدون ارسال اطلاعات به سرور مدیریت کن.</p>
                <label>دوست داری چه صدایت کنیم؟<Input autoFocus placeholder="مثلاً حامد" value={data.settings.name} onChange={(event) => setData({ ...data, settings: { ...data.settings, name: event.target.value } })} /></label>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="wizard-page">
                <h1>ساعت‌یار را برای خودت تنظیم کن</h1>
                <p>نوع استفاده را انتخاب کن؛ بعداً از تنظیمات قابل تغییر است.</p>
                <div className="mode-grid">
                  {[
                    { id: "employee" as Mode, icon: <CalendarDays />, title: "کارمند", points: ["ورود و خروج", "مرخصی و اضافه‌کاری", "گزارش ماهانه"] },
                    { id: "freelancer" as Mode, icon: <BriefcaseBusiness />, title: "فریلنسر", points: ["مشتری و پروژه", "تایمر قابل صورتحساب", "گزارش درآمد"] },
                    { id: "hybrid" as Mode, icon: <LayoutDashboard />, title: "ترکیبی", points: ["هر دو فضای کاری", "جابجایی سریع", "گزارش‌های جداگانه"] },
                  ].map((mode) => (
                    <button type="button" className={data.settings.mode === mode.id ? "selected" : ""} key={mode.id} onClick={() => setData({ ...data, settings: { ...data.settings, mode: mode.id } })}>
                      {data.settings.mode === mode.id && <span className="mode-check"><Check /></span>}
                      <i>{mode.icon}</i><strong>{mode.title}</strong>
                      <ul>{mode.points.map((point) => <li key={point}>{point}</li>)}</ul>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {onboardingStep === 3 && (
              <div className="wizard-page">
                <h1>برنامه کاری تو</h1>
                <p>اعداد اولیه را وارد کن؛ همه موارد بعداً قابل ویرایش‌اند.</p>
                <div className="form-grid three">
                  <label>هدف هفتگی (ساعت)<NumberField value={data.settings.weeklyMinutes / 60} onValueChange={(value) => setData({ ...data, settings: { ...data.settings, weeklyMinutes: value * 60 } })} /></label>
                  <label>روزهای کاری<Select value={String(data.settings.workDays)} onValueChange={(value) => setData({ ...data, settings: { ...data.settings, workDays: Number(value) } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[4, 5, 6].map((value) => <SelectItem value={String(value)} key={value}>{fa.format(value)} روز</SelectItem>)}</SelectContent></Select></label>
                  <label>ناهار پیش‌فرض<Select value={String(data.settings.lunchMinutes)} onValueChange={(value) => setData({ ...data, settings: { ...data.settings, lunchMinutes: Number(value) } })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[30, 45, 60].map((value) => <SelectItem value={String(value)} key={value}>{fa.format(value)} دقیقه</SelectItem>)}</SelectContent></Select></label>
                </div>
              </div>
            )}
            {onboardingStep === 4 && (
              <div className="wizard-page">
                <span className="wizard-logo"><ShieldCheck /></span>
                <h1>اطلاعات فقط روی دستگاه تو می‌ماند</h1>
                <p>ساعت‌یار آفلاین کار می‌کند. برای انتقال دستگاه، فایل پشتیبان بگیر.</p>
                <div className="privacy-callout"><Database /><div><strong>ذخیره محلی امن</strong><span>داده‌های اصلی داخل IndexedDB مرورگر ذخیره می‌شوند.</span></div></div>
              </div>
            )}
            <footer className="wizard-actions">
              <Button variant="outline" onClick={() => setOnboardingStep(Math.max(1, onboardingStep - 1))} disabled={onboardingStep === 1}>قبلی</Button>
              {onboardingStep < 4 ? (
                <Button onClick={() => setOnboardingStep(onboardingStep + 1)} disabled={onboardingStep === 1 && !data.settings.name.trim()}>ادامه<ChevronLeft /></Button>
              ) : (
                <Button onClick={() => setData({ ...data, settings: { ...data.settings, onboarded: true } })}>شروع ساعت‌یار<Check /></Button>
              )}
            </footer>
          </section>
        </div>
      )}

      <header className="topbar">
        <div className="brand"><span><Clock3 /></span><div><strong>ساعت‌یار</strong><small>{data.settings.name ? `فضای شخصی ${data.settings.name}` : "حساب کار، بدون حساب‌وکتاب"}</small></div></div>
        <nav className="main-nav" aria-label="ناوبری اصلی">
          {navItems.filter((item) => !item.hide).map((item) => (
            <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <span className="autosave"><CheckCircle2 /> ذخیره خودکار</span>
          <div className="quick-mode-switch">
            <span><UserRound /> فضای کاری</span>
            <Select value={data.settings.mode} onValueChange={(mode) => changeMode(mode as Mode)}>
              <SelectTrigger aria-label="تغییر سریع فضای کاری">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">کارمند</SelectItem>
                <SelectItem value="freelancer">فریلنسر</SelectItem>
                <SelectItem value="hybrid">ترکیبی</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={exportBackup} aria-label="دانلود پشتیبان"><Download /></Button>
          <Button variant="outline" onClick={() => setTab("settings")}><SettingsIcon /> تنظیمات</Button>
        </div>
      </header>

      <div className="workspace">
        {tab === "today" && (
          <TodayPage
            data={data}
            record={record}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayCalc={todayCalc}
            dailyTarget={dailyTarget}
            suggestedExit={suggestedExit}
            activeEntry={activeEntry}
            activeBreak={activeBreak}
            lunchRunning={lunchRunning}
            timerDraft={timerDraft}
            setTimerDraft={setTimerDraft}
            startWork={startWork}
            finishWork={finishWork}
            updateRecord={updateRecord}
            startLunch={startLunch}
            finishLunch={finishLunch}
            startBreak={startBreak}
            finishBreak={finishBreak}
            toggleProjectTimer={toggleProjectTimer}
            editingEntry={editingEntry}
            setEditingEntry={setEditingEntry}
            setData={setData}
            setTab={setTab}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}
        {tab === "clients" && (
          <ClientsPage data={data} setData={setData} showForm={showClientForm} setShowForm={setShowClientForm} draft={clientDraft} setDraft={setClientDraft} addClient={addClient} setTab={setTab} />
        )}
        {tab === "month" && (
          <MonthPage
            data={data}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            monthRecords={monthRecords}
            monthStats={monthStats}
            dailyTarget={dailyTarget}
          />
        )}
        {tab === "projects" && (
          <ProjectsPage
            data={data}
            setData={setData}
            selectedProject={selectedProject}
            setSelectedProjectId={setSelectedProjectId}
            showForm={showProjectForm}
            setShowForm={setShowProjectForm}
            draft={projectDraft}
            setDraft={setProjectDraft}
            addProject={addProject}
            activeEntry={activeEntry}
            toggleProjectTimer={toggleProjectTimer}
          />
        )}
        {tab === "reports" && (
          <ReportsPage
            data={data}
            monthRecords={monthRecords}
            monthStats={monthStats}
            filters={reportFilter}
            setFilters={setReportFilter}
            entries={filteredEntries}
            reportBillable={reportBillable}
            reportIncome={reportIncome}
            exportReport={exportReport}
          />
        )}
        {tab === "leave" && (
          <LeavePage data={data} setData={setData} draft={leaveDraft} setDraft={setLeaveDraft} saveLeave={saveLeave} used={usedLeave} available={leaveAvailable} />
        )}
        {tab === "settings" && (
          <SettingsPage
            data={data}
            setData={setData}
            storage={storageInfo}
            exportBackup={exportBackup}
            previewImport={previewImport}
            importPreview={importPreview}
            applyImport={applyImport}
            requestPersistence={async () => {
              const persisted = await storage.requestPersistence();
              setStorageInfo(await storage.estimate());
              setToast(persisted ? "ذخیره پایدار فعال شد" : "مرورگر ذخیره پایدار را فعال نکرد؛ پشتیبان‌گیری را ادامه دهید");
            }}
            onModeChange={changeMode}
            setToast={setToast}
          />
        )}
      </div>

      <footer className="app-footer">
        <span>{online ? <><Wifi /> برنامه آماده استفاده آفلاین است</> : <><WifiOff /> آفلاین؛ همه تغییرات روی همین دستگاه ذخیره می‌شوند</>}</span>
        <span><ShieldCheck /> اطلاعات شخصی به هیچ سروری ارسال نمی‌شود.</span>
      </footer>
    </main>
  );
}

type TodayProps = {
  data: AppData;
  record: WorkRecord;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayCalc: ReturnType<typeof calc>;
  dailyTarget: number;
  suggestedExit: string;
  activeEntry?: TimeEntry;
  activeBreak?: BreakItem;
  lunchRunning: boolean;
  timerDraft: { projectId: string; task: string; note: string; billable: boolean };
  setTimerDraft: React.Dispatch<React.SetStateAction<{ projectId: string; task: string; note: string; billable: boolean }>>;
  startWork: () => void;
  finishWork: () => void;
  updateRecord: (patch: Partial<WorkRecord>) => void;
  startLunch: () => void;
  finishLunch: () => void;
  startBreak: () => void;
  finishBreak: (minutes?: number) => void;
  toggleProjectTimer: (projectId?: string) => void;
  editingEntry: string;
  setEditingEntry: (id: string) => void;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setTab: (tab: Tab) => void;
  setSelectedProjectId: (id: string) => void;
};

function TodayPage(props: TodayProps) {
  const recentProjects = props.data.projects.filter((item) => item.status === "active").slice(0, 3);
  const progress = Math.min(100, Math.round(props.todayCalc.credited / props.dailyTarget * 100));
  const todayEntries = props.data.timeEntries.filter((entry) => localDateKey(new Date(entry.startedAt)) === props.selectedDate);
  const [manualDraft, setManualDraft] = useState({
    projectId: props.data.projects.find((item) => item.status === "active")?.id ?? "",
    start: "09:00",
    end: "10:00",
    note: "",
    billable: true,
  });

  function saveManualEntry() {
    const project = props.data.projects.find((item) => item.id === manualDraft.projectId);
    if (!project) return alert("برای ثبت دستی، ابتدا پروژه را انتخاب کنید.");
    const startedAt = new Date(`${props.selectedDate}T${manualDraft.start}:00`).getTime();
    const endedAt = new Date(`${props.selectedDate}T${manualDraft.end}:00`).getTime();
    if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt <= startedAt) {
      return alert("زمان شروع و پایان معتبر نیست.");
    }
    const overlaps = props.data.timeEntries.some((entry) => {
      const currentStart = new Date(entry.startedAt).getTime();
      const currentEnd = entry.endedAt ? new Date(entry.endedAt).getTime() : Date.now();
      return startedAt < currentEnd && endedAt > currentStart;
    });
    if (overlaps) return alert("این بازه با رکورد دیگری هم‌پوشانی دارد.");
    props.setData((previous) => ({
      ...previous,
      timeEntries: [{
        id: crypto.randomUUID(),
        clientId: project.clientId,
        projectId: project.id,
        task: manualDraft.note || "ورودی دستی",
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        note: manualDraft.note,
        billable: manualDraft.billable,
        effectiveRate: project.rate,
      }, ...previous.timeEntries],
    }));
    props.setEditingEntry("");
    setManualDraft((previous) => ({ ...previous, note: "" }));
  }
  return (
    <>
      <section className="page-heading">
        <div><span className="save-inline"><CheckCircle2 /> ذخیره خودکار</span><h1>امروز روی چه چیزی کار می‌کنی؟</h1><p>{jalali(props.selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>
        <JalaliDatePicker value={props.selectedDate} onChange={props.setSelectedDate} recordedDates={Object.keys(props.data.records)} />
      </section>

      <section className="focus-card">
        <div className="focus-form">
          {props.data.settings.mode !== "employee" && (
            <>
              <label>مشتری<Select value={props.data.projects.find((item) => item.id === props.timerDraft.projectId)?.clientId ?? ""} onValueChange={(clientId) => props.setTimerDraft((prev) => ({ ...prev, projectId: props.data.projects.find((project) => project.clientId === clientId)?.id ?? "" }))}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{props.data.clients.filter((item) => !item.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
              <label>پروژه<Select value={props.timerDraft.projectId} onValueChange={(projectId) => props.setTimerDraft((prev) => ({ ...prev, projectId }))}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{props.data.projects.filter((item) => item.status === "active").map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label>
              <label>وظیفه<Input placeholder="مثلاً طراحی رابط" value={props.timerDraft.task} onChange={(event) => props.setTimerDraft((prev) => ({ ...prev, task: event.target.value }))} /></label>
            </>
          )}
          <label className="focus-note">توضیحات<Input placeholder="شرح کوتاه کار امروز" value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((prev) => ({ ...prev, note: event.target.value }))} /></label>
          {props.data.settings.mode !== "employee" && <button type="button" className={`billable-toggle ${props.timerDraft.billable ? "on" : ""}`} onClick={() => props.setTimerDraft((prev) => ({ ...prev, billable: !prev.billable }))}><span /> قابل صورتحساب</button>}
        </div>
        <div className="focus-clock">
          <span className="running-label"><i />{props.activeEntry ? "تایمر پروژه در حال اجرا" : props.record.start && !props.record.end ? "روز کاری در حال اجرا" : "آماده شروع"}</span>
          <strong>{props.activeEntry ? <LiveDuration startedAt={props.activeEntry.startedAt} /> : props.record.start && !props.record.end ? duration(props.todayCalc.worked) : "۰:۰۰:۰۰"}</strong>
          <small>خروج پیشنهادی: {faDigits(props.suggestedExit)}</small>
          <div>
            {props.data.settings.mode !== "employee" && <Button onClick={() => props.toggleProjectTimer()}>{props.activeEntry ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button>}
            {!props.record.start ? <Button onClick={props.startWork}><Play /> شروع روز</Button> : !props.record.end ? <Button variant="outline" onClick={props.finishWork}><Square /> پایان روز</Button> : <Button variant="secondary" onClick={props.startWork}><Play /> شروع دوباره</Button>}
          </div>
        </div>
      </section>

      <section className="time-edit-strip">
        <label>ورود<TimePicker value={props.record.start} onChange={(start) => props.updateRecord({ start })} suggestions={[{ label: "شروع معمول", value: props.data.settings.defaultStart }]} /></label>
        <label>خروج<TimePicker value={props.record.end} onChange={(end) => props.updateRecord({ end })} suggestions={[{ label: "پیشنهادی", value: props.suggestedExit }, { label: "پایان معمول", value: props.data.settings.defaultEnd }]} /></label>
        <div className="tracker-box">
          <span><Coffee /> ناهار <small>{fa.format(props.record.lunchMinutes)} دقیقه</small></span>
          <Button variant={props.lunchRunning ? "default" : "outline"} size="sm" onClick={props.lunchRunning ? props.finishLunch : props.startLunch}>{props.lunchRunning ? <><Square /> پایان</> : <><Play /> شروع</>}</Button>
        </div>
        <div className="tracker-box">
          <span><Pause /> وقفه <small>{duration(props.todayCalc.breakMinutes)}</small></span>
          {!props.activeBreak ? <Button variant="outline" size="sm" onClick={props.startBreak}><Play /> شروع</Button> : <div className="preset-row">{[15, 30, 40, 60].map((value) => <Button variant="outline" size="sm" key={value} onClick={() => props.finishBreak(value)}>{fa.format(value)}</Button>)}<Button size="sm" onClick={() => props.finishBreak()}><Square /></Button></div>}
        </div>
      </section>

      {props.editingEntry === "manual" && props.data.settings.mode !== "employee" && (
        <section className="panel manual-entry-form">
          <div className="panel-head"><div><Plus /><h2>ثبت دستی زمان پروژه</h2></div><Button variant="ghost" onClick={() => props.setEditingEntry("")}>بستن</Button></div>
          <div className="form-grid three">
            <label>پروژه<Select value={manualDraft.projectId} onValueChange={(projectId) => setManualDraft({ ...manualDraft, projectId })}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{props.data.projects.filter((item) => item.status === "active").map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label>
            <label>شروع<TimePicker value={manualDraft.start} onChange={(start) => setManualDraft({ ...manualDraft, start })} /></label>
            <label>پایان<TimePicker value={manualDraft.end} onChange={(end) => setManualDraft({ ...manualDraft, end })} /></label>
            <label className="span-2">شرح<Input value={manualDraft.note} onChange={(event) => setManualDraft({ ...manualDraft, note: event.target.value })} placeholder="مثلاً جلسه طراحی" /></label>
            <label className="check-field"><input type="checkbox" checked={manualDraft.billable} onChange={(event) => setManualDraft({ ...manualDraft, billable: event.target.checked })} /> قابل صورتحساب</label>
          </div>
          <Button onClick={saveManualEntry}><Save /> ذخیره ورودی</Button>
        </section>
      )}

      <section className="metric-grid four">
        <MetricCard icon={<Clock3 />} label="زمان امروز" value={duration(props.todayCalc.worked)} suffix="ساعت" />
        <MetricCard icon={<Tag />} label="قابل صورتحساب" value={duration(Math.max(0, props.todayCalc.worked - props.todayCalc.breakMinutes))} suffix="ساعت" />
        <MetricCard icon={<WalletCards />} label="درآمد تخمینی" value={money(props.todayCalc.worked / 60 * 850_000)} suffix="تومان" tone="blue" />
        <article className="metric-card goal-card"><div className="mini-ring" style={{ "--p": `${progress * 3.6}deg` } as React.CSSProperties}><strong>{fa.format(progress)}٪</strong></div><div><small>هدف روزانه</small><strong>{duration(props.todayCalc.credited)} <span>از {duration(props.dailyTarget)}</span></strong></div></article>
      </section>

      <section className="dashboard-grid">
        <article className="panel timeline-panel">
          <div className="panel-head"><div><Clock3 /><h2>خط زمانی امروز</h2></div>{props.data.settings.mode !== "employee" && <Button variant="ghost" size="sm" onClick={() => props.setEditingEntry(props.editingEntry ? "" : "manual")}><Plus /> افزودن ورودی زمان</Button>}</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>وظیفه</th><th>شروع</th><th>پایان</th><th>مدت زمان</th><th>قابل صورتحساب</th><th>عملیات</th></tr></thead>
              <tbody>
                {todayEntries.map((entry) => {
                  const project = props.data.projects.find((item) => item.id === entry.projectId);
                  return <tr key={entry.id}><td><strong><i style={{ background: project?.color }} />{entry.task || project?.name || "بدون عنوان"}</strong><small>{entry.note}</small></td><td>{props.editingEntry === entry.id ? <Input type="datetime-local" value={entry.startedAt.slice(0, 16)} onChange={(event) => props.setData((prev) => ({ ...prev, timeEntries: prev.timeEntries.map((item) => item.id === entry.id ? { ...item, startedAt: new Date(event.target.value).toISOString() } : item) }))} /> : faDigits(new Date(entry.startedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }))}</td><td>{entry.endedAt ? faDigits(new Date(entry.endedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })) : "در حال اجرا"}</td><td>{duration(entryMinutes(entry))}</td><td><span className={`status ${entry.billable ? "success" : ""}`}>{entry.billable ? "بله" : "خیر"}</span></td><td><Button variant="outline" size="icon" onClick={() => props.setEditingEntry(props.editingEntry === entry.id ? "" : entry.id)} aria-label="ویرایش"><Edit3 /></Button></td></tr>;
                })}
                {todayEntries.length === 0 && <tr><td colSpan={6}><div className="empty-state"><Clock3 /><strong>هنوز رکورد پروژه‌ای برای امروز نداری</strong><span>تایمر پروژه را شروع کن یا یک ورودی دستی اضافه کن.</span></div></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="table-total"><span>جمع کل: <strong>{duration(todayEntries.reduce((sum, entry) => sum + entryMinutes(entry), 0))}</strong></span></div>
        </article>
        {props.data.settings.mode !== "employee" && <aside className="panel recent-projects"><div className="panel-head"><div><Info /><h2>پروژه‌های اخیر</h2></div></div>{recentProjects.map((project) => <div className="recent-project" key={project.id}><span style={{ background: project.color }} /><div><strong>{project.name}</strong><small>{props.data.clients.find((item) => item.id === project.clientId)?.name}</small></div><Button variant="outline" size="sm" onClick={() => props.toggleProjectTimer(project.id)}><Play /> شروع</Button></div>)}{recentProjects.length === 0 && <div className="empty-state compact"><Folder /><span>از صفحه پروژه‌ها اولین پروژه را بساز.</span></div>}<Button variant="ghost" className="full" onClick={() => props.setTab("projects")}>مشاهده همه پروژه‌ها <ChevronLeft /></Button></aside>}
      </section>

      {props.record.start && !props.record.end && props.todayCalc.worked > 4 * 60 && <div className="long-timer-warning"><AlertTriangle /><div><strong>بیش از {fa.format(4)} ساعت از شروع روز گذشته است.</strong><span>برای حفظ دقت ثبت زمان، یک استراحت کوتاه یا بررسی تایمر پیشنهاد می‌شود.</span></div><Button variant="outline" onClick={props.startBreak}>شروع وقفه</Button></div>}
    </>
  );
}

function ClientsPage({ data, setData, showForm, setShowForm, draft, setDraft, addClient, setTab }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: { name: string; email: string; note: string };
  setDraft: React.Dispatch<React.SetStateAction<{ name: string; email: string; note: string }>>;
  addClient: () => void;
  setTab: (tab: Tab) => void;
}) {
  const active = data.clients.filter((client) => !client.archived);
  return (
    <>
      <section className="page-heading"><div><span className="save-inline"><CheckCircle2 /> ذخیره خودکار</span><h1>مشتری‌ها</h1><p>مشتری‌ها، پروژه‌ها و درآمدت را یک‌جا مدیریت کن.</p></div><Button onClick={() => setShowForm(!showForm)}><Plus /> مشتری جدید</Button></section>
      {showForm && <section className="inline-form panel"><div className="form-grid three"><label>نام مشتری<Input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>ایمیل اختیاری<Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label>توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label></div><div className="row-actions"><Button onClick={addClient}><Save /> ذخیره مشتری</Button><Button variant="outline" onClick={() => setShowForm(false)}>انصراف</Button></div></section>}
      <section className="metric-grid four">
        <MetricCard icon={<Users />} label="مشتری فعال" value={fa.format(active.length)} suffix="مشتری" />
        <MetricCard icon={<Folder />} label="پروژه فعال" value={fa.format(data.projects.filter((project) => project.status === "active").length)} suffix="پروژه" />
        <MetricCard icon={<Clock3 />} label="زمان این ماه" value={duration(data.timeEntries.reduce((sum, entry) => sum + entryMinutes(entry), 0))} suffix="ساعت" />
        <MetricCard icon={<CircleDollarSign />} label="مبلغ قابل صورتحساب" value={money(data.timeEntries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0))} suffix="تومان" />
      </section>
      <section className="dashboard-grid clients-layout">
        <article className="panel table-panel"><div className="panel-head"><div><Users /><h2>فهرست مشتری‌ها</h2></div><div className="search-box"><Search /><Input placeholder="جست‌وجوی مشتری" /></div></div><div className="table-wrap"><table><thead><tr><th>مشتری</th><th>پروژه‌ها</th><th>زمان کل</th><th>مبلغ</th><th>آخرین فعالیت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{data.clients.map((client) => {
          const projects = data.projects.filter((project) => project.clientId === client.id);
          const entries = data.timeEntries.filter((entry) => entry.clientId === client.id);
          const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
          const income = entries.reduce((sum, entry) => sum + (entry.billable ? entryMinutes(entry) / 60 * entry.effectiveRate : 0), 0);
          return <tr key={client.id}><td><strong className="avatar-name"><span style={{ background: client.color }}>{client.name.slice(0, 1)}</span>{client.name}</strong><small>{client.note}</small></td><td>{fa.format(projects.length)}<small>پروژه</small></td><td>{duration(minutes)}<small>ساعت</small></td><td>{money(income)}<small>تومان</small></td><td>{entries[0] ? jalali(localDateKey(new Date(entries[0].startedAt))) : "—"}</td><td><span className={`status ${client.archived ? "" : "success"}`}>{client.archived ? "غیرفعال" : "فعال"}</span></td><td><Button variant="outline" size="icon" onClick={() => setData((prev) => ({ ...prev, clients: prev.clients.map((item) => item.id === client.id ? { ...item, archived: !item.archived } : item) }))}><MoreVertical /></Button></td></tr>;
        })}{data.clients.length === 0 && <tr><td colSpan={7}><div className="empty-state"><Users /><strong>هنوز مشتری‌ای ثبت نشده</strong><span>با دکمه «مشتری جدید» شروع کن.</span></div></td></tr>}</tbody></table></div></article>
        <aside className="panel top-clients"><div className="panel-head"><div><BarChart3 /><h2>مشتری‌های برتر این ماه</h2></div></div>{active.slice(0, 4).map((client, index) => {
          const minutes = data.timeEntries.filter((entry) => entry.clientId === client.id).reduce((sum, entry) => sum + entryMinutes(entry), 0);
          const max = Math.max(1, ...active.map((item) => data.timeEntries.filter((entry) => entry.clientId === item.id).reduce((sum, entry) => sum + entryMinutes(entry), 0)));
          return <div className="bar-item" key={client.id}><div><strong>{client.name}</strong><span>{duration(minutes)} ساعت</span></div><i><b style={{ width: `${Math.max(7, minutes / max * 100)}%`, background: client.color }} /></i><small>رتبه {fa.format(index + 1)}</small></div>;
        })}<Button variant="outline" className="full" onClick={() => setTab("reports")}>مشاهده گزارش کامل <BarChart3 /></Button></aside>
      </section>
    </>
  );
}

function ProjectsPage({ data, setData, selectedProject, setSelectedProjectId, showForm, setShowForm, draft, setDraft, addProject, activeEntry, toggleProjectTimer }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  selectedProject?: Project;
  setSelectedProjectId: (id: string) => void;
  showForm: boolean;
  setShowForm: (value: boolean) => void;
  draft: { name: string; clientId: string; rate: number; budgetHours: number; note: string };
  setDraft: React.Dispatch<React.SetStateAction<{ name: string; clientId: string; rate: number; budgetHours: number; note: string }>>;
  addProject: () => void;
  activeEntry?: TimeEntry;
  toggleProjectTimer: (id?: string) => void;
}) {
  if (selectedProject) {
    const entries = data.timeEntries.filter((entry) => entry.projectId === selectedProject.id);
    const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
    const billable = entries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entryMinutes(entry), 0);
    const progress = Math.min(100, Math.round(minutes / Math.max(1, (selectedProject.budgetHours ?? 0) * 60) * 100));
    return <>
      <section className="page-heading project-title"><div><button type="button" className="back-link" onClick={() => setSelectedProjectId("")}><ChevronRight /> همه پروژه‌ها</button><h1><i style={{ background: selectedProject.color }} />{selectedProject.name}</h1><p>کارفرما: {data.clients.find((client) => client.id === selectedProject.clientId)?.name}</p></div><div className="row-actions"><Button onClick={() => toggleProjectTimer(selectedProject.id)}>{activeEntry?.projectId === selectedProject.id ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button><Button variant="outline" onClick={() => setData((prev) => ({ ...prev, projects: prev.projects.map((item) => item.id === selectedProject.id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item) }))}><Pause /> {selectedProject.status === "active" ? "توقف پروژه" : "فعال‌سازی"}</Button></div></section>
      <section className="metric-grid four"><MetricCard icon={<Clock3 />} label="زمان ثبت‌شده" value={duration(minutes)} suffix="ساعت" /><MetricCard icon={<TrendingUp />} label="بودجه زمانی" value={`${fa.format(progress)}٪`} suffix={`از ${fa.format(selectedProject.budgetHours ?? 0)} ساعت`} /><MetricCard icon={<WalletCards />} label="مبلغ قابل صورتحساب" value={money(billable / 60 * selectedProject.rate)} suffix="تومان" /><MetricCard icon={<Tag />} label="نرخ ساعتی" value={money(selectedProject.rate)} suffix="تومان" tone="blue" /></section>
      <section className="project-progress panel"><div><span>باقی‌مانده</span><strong>{duration(Math.max(0, (selectedProject.budgetHours ?? 0) * 60 - minutes))}</strong></div><div className="progress-main"><span>بودجه زمانی پروژه</span><i><b style={{ width: `${progress}%` }} /></i><small>{duration(minutes)} از {fa.format(selectedProject.budgetHours ?? 0)} ساعت</small></div><div><span>هزینه مورد انتظار</span><strong>{money((selectedProject.budgetHours ?? 0) * selectedProject.rate)}</strong><small>تومان</small></div></section>
      <section className="dashboard-grid project-detail-grid"><article className="panel table-panel"><div className="panel-head"><div><Clock3 /><h2>تازه‌ترین رکوردهای زمان</h2></div></div><div className="table-wrap"><table><thead><tr><th>تاریخ</th><th>شروع</th><th>پایان</th><th>مدت</th><th>وظیفه</th><th>قابل صورتحساب</th></tr></thead><tbody>{entries.slice(0, 8).map((entry) => <tr key={entry.id}><td>{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(new Date(entry.startedAt))}</td><td>{new Date(entry.startedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</td><td>{entry.endedAt ? new Date(entry.endedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) : "در حال اجرا"}</td><td>{duration(entryMinutes(entry))}</td><td>{entry.task || entry.note || "—"}</td><td><span className={`status ${entry.billable ? "success" : ""}`}>{entry.billable ? "بله" : "خیر"}</span></td></tr>)}{entries.length === 0 && <tr><td colSpan={6}><div className="empty-state compact"><Clock3 /><span>هنوز زمانی برای این پروژه ثبت نشده.</span></div></td></tr>}</tbody></table></div></article><aside className="panel project-info"><div className="panel-head"><div><Info /><h2>اطلاعات پروژه</h2></div></div><dl><dt>وضعیت</dt><dd><span className="status success">{selectedProject.status === "active" ? "فعال" : "متوقف"}</span></dd><dt>واحد پول</dt><dd>تومان</dd><dt>قابل صورتحساب</dt><dd>{selectedProject.billable === false ? "خیر" : "بله"}</dd><dt>یادداشت‌ها</dt><dd>{selectedProject.note || "—"}</dd></dl></aside></section>
    </>;
  }
  return <>
    <section className="page-heading"><div><span className="save-inline"><CheckCircle2 /> ذخیره خودکار</span><h1>پروژه‌ها</h1><p>بودجه، نرخ و زمان هر پروژه را یک‌جا ببین.</p></div><Button onClick={() => setShowForm(!showForm)}><Plus /> پروژه جدید</Button></section>
    {showForm && <section className="inline-form panel"><div className="form-grid three"><label>نام پروژه<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>مشتری<Select value={draft.clientId} onValueChange={(clientId) => setDraft({ ...draft, clientId })}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{data.clients.filter((client) => !client.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label><label>نرخ ساعتی<NumberField value={draft.rate} onValueChange={(rate) => setDraft({ ...draft, rate })} /></label><label>بودجه ساعتی<NumberField value={draft.budgetHours} onValueChange={(budgetHours) => setDraft({ ...draft, budgetHours })} /></label><label className="span-2">توضیح<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label></div><div className="row-actions"><Button onClick={addProject}><Save /> ذخیره پروژه</Button><Button variant="outline" onClick={() => setShowForm(false)}>انصراف</Button></div></section>}
    <section className="project-cards">{data.projects.map((project) => {
      const entries = data.timeEntries.filter((entry) => entry.projectId === project.id);
      const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
      const progress = Math.min(100, Math.round(minutes / Math.max(1, (project.budgetHours ?? 0) * 60) * 100));
      return <article className="project-card" key={project.id} onClick={() => setSelectedProjectId(project.id)}><div className="project-card-head"><span style={{ background: project.color }} /><div><strong>{project.name}</strong><small>{data.clients.find((client) => client.id === project.clientId)?.name}</small></div><span className={`status ${project.status === "active" ? "success" : ""}`}>{project.status === "active" ? "فعال" : project.status === "paused" ? "متوقف" : "تکمیل"}</span></div><div className="project-card-stats"><span>زمان ثبت‌شده<strong>{duration(minutes)}</strong></span><span>نرخ ساعتی<strong>{money(project.rate)}</strong></span></div><div className="budget-line"><div><span>مصرف بودجه</span><b>{fa.format(progress)}٪</b></div><i><b style={{ width: `${progress}%` }} /></i></div><Button variant="outline" className="full">مشاهده جزئیات <ChevronLeft /></Button></article>;
    })}{data.projects.length === 0 && <article className="panel empty-state large"><Folder /><strong>اولین پروژه‌ات را بساز</strong><span>پروژه را به مشتری متصل کن، بودجه و نرخ را مشخص کن و تایمر را شروع کن.</span><Button onClick={() => setShowForm(true)}><Plus /> پروژه جدید</Button></article>}</section>
  </>;
}

function MonthPage({
  data,
  selectedDate,
  setSelectedDate,
  monthRecords,
  monthStats,
  dailyTarget,
}: {
  data: AppData;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  monthRecords: WorkRecord[];
  monthStats: { worked: number; target: number; balance: number; breaks: number };
  dailyTarget: number;
}) {
  const cells = jalaliMonthCells(selectedDate);
  const monthLabel = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
  }).format(new Date(`${selectedDate}T12:00:00`));
  const weekValues = Array.from({ length: 7 }, (_, weekday) =>
    monthRecords
      .filter((item) => (new Date(`${item.date}T12:00:00`).getDay() + 1) % 7 === weekday)
      .reduce((sum, item) => sum + calc(item, dailyTarget).worked, 0),
  );
  const maxWeekValue = Math.max(1, ...weekValues);

  function moveMonth(amount: number) {
    const pivot = new Date(`${selectedDate}T12:00:00`);
    pivot.setDate(pivot.getDate() + amount * 32);
    setSelectedDate(localDateKey(pivot));
  }
  function exportMonth() {
    exportCsv(
      `گزارش-ماه-${selectedDate.slice(0, 7)}.csv`,
      ["تاریخ شمسی", "ورود", "خروج", "کارکرد خالص", "وقفه", "تراز", "یادداشت"],
      monthRecords.map((item) => {
        const result = calc(item, dailyTarget);
        return [
          jalali(item.date),
          item.start || "—",
          item.end || "—",
          result.worked,
          result.breakMinutes + item.lunchMinutes,
          result.balance,
          item.note,
        ];
      }),
    );
  }

  return <>
    <section className="page-heading">
      <div><span className="save-inline"><CheckCircle2 /> ذخیره خودکار</span><h1>ماه من</h1><p>نمای شمسی کارکرد، وقفه، مرخصی و تراز روزانه.</p></div>
      <div className="row-actions"><Button variant="outline" onClick={exportMonth}><Download /> خروجی CSV</Button><JalaliDatePicker value={selectedDate} onChange={setSelectedDate} recordedDates={Object.keys(data.records)} /></div>
    </section>
    <section className="metric-grid four">
      <MetricCard icon={<Clock3 />} label="ساعت موظفی" value={duration(monthStats.target)} suffix="ساعت" tone="blue" />
      <MetricCard icon={<CheckCircle2 />} label="کارکرد واقعی" value={duration(monthStats.worked)} suffix="ساعت" />
      <MetricCard icon={<TrendingUp />} label={monthStats.balance >= 0 ? "اضافه‌کاری" : "کسری کار"} value={duration(monthStats.balance, true)} suffix="ساعت" tone={monthStats.balance >= 0 ? "green" : "amber"} />
      <MetricCard icon={<Coffee />} label="ناهار و وقفه" value={duration(monthStats.breaks)} suffix="ساعت" tone="purple" />
    </section>
    <section className="month-layout">
      <article className="panel month-calendar">
        <div className="month-calendar-head"><Button variant="outline" size="icon" onClick={() => moveMonth(-1)} aria-label="ماه قبل"><ChevronRight /></Button><div><h2>{monthLabel}</h2><span>{fa.format(monthRecords.length)} روز دارای رکورد</span></div><Button variant="outline" size="icon" onClick={() => moveMonth(1)} aria-label="ماه بعد"><ChevronLeft /></Button></div>
        <div className="month-weekdays">{["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="month-cells">{cells.map((cell) => {
          const item = data.records[cell.key];
          const leave = data.leaves.some((entry) => entry.startDate <= cell.key && entry.endDate >= cell.key);
          const result = item ? calc(item, dailyTarget) : null;
          const status = leave ? "leave" : item?.holiday ? "holiday" : item?.end ? (result && result.balance >= 0 ? "complete" : "deficit") : item?.start ? "partial" : "";
          return <button key={cell.key} type="button" className={`${cell.inMonth ? "" : "outside"} ${cell.key === localDateKey() ? "today" : ""} ${status}`} onClick={() => setSelectedDate(cell.key)}>
            <span>{fa.format(cell.day)}</span>{item && <small>{duration(result?.worked ?? 0)}</small>}{status && <i aria-hidden="true" />}
          </button>;
        })}</div>
        <div className="calendar-legend"><span><i className="complete" /> کامل</span><span><i className="deficit" /> کسری</span><span><i className="leave" /> مرخصی</span><span><i className="holiday" /> تعطیل</span></div>
      </article>
      <aside className="panel weekly-chart">
        <div className="panel-head"><div><BarChart3 /><h2>کارکرد هفتگی</h2></div></div>
        <div className="weekly-bars">{weekValues.map((value, index) => <div key={index}><span>{duration(value)}</span><i><b style={{ height: `${Math.max(4, value / maxWeekValue * 100)}%` }} /></i><small>{["ش", "ی", "د", "س", "چ", "پ", "ج"][index]}</small></div>)}</div>
        <p className="helper"><Info />نمودار از رکوردهای همین ماه محاسبه می‌شود و داده مشتق‌شده جداگانه ذخیره نمی‌گردد.</p>
      </aside>
    </section>
    <section className="panel table-panel month-table">
      <div className="panel-head"><div><FileSpreadsheet /><h2>جزئیات روزانه</h2></div></div>
      <div className="table-wrap"><table><thead><tr><th>تاریخ</th><th>ورود</th><th>خروج</th><th>کارکرد</th><th>وقفه</th><th>تراز</th><th>یادداشت</th><th>ویرایش</th></tr></thead><tbody>{monthRecords.map((item) => {
        const result = calc(item, dailyTarget);
        return <tr key={item.date}><td>{jalali(item.date, { day: "numeric", month: "long" })}</td><td>{faDigits(item.start || "—")}</td><td>{faDigits(item.end || "—")}</td><td>{duration(result.worked)}</td><td>{duration(result.breakMinutes + item.lunchMinutes)}</td><td className={result.balance >= 0 ? "positive" : "negative"}>{duration(result.balance, true)}</td><td>{item.note || "—"}</td><td><Button variant="outline" size="icon" onClick={() => { setSelectedDate(item.date); }}><Edit3 /></Button></td></tr>;
      })}{monthRecords.length === 0 && <tr><td colSpan={8}><div className="empty-state"><CalendarDays /><strong>برای این ماه رکوردی نیست</strong><span>از صفحه امروز، شروع و پایان روز را ثبت کن.</span></div></td></tr>}</tbody></table></div>
    </section>
  </>;
}

function ReportsPage({ data, monthRecords, monthStats, filters, setFilters, entries, reportBillable, reportIncome, exportReport }: {
  data: AppData;
  monthRecords: WorkRecord[];
  monthStats: { worked: number; target: number; balance: number; breaks: number };
  filters: { clientId: string; projectId: string; billable: string; query: string };
  setFilters: React.Dispatch<React.SetStateAction<{ clientId: string; projectId: string; billable: string; query: string }>>;
  entries: TimeEntry[];
  reportBillable: number;
  reportIncome: number;
  exportReport: (kind: "excel" | "csv") => void;
}) {
  const weekValues = [12, 18, 20, 19, 14, 3, 0];
  return <>
    <section className="page-heading"><div><span className="save-inline"><CheckCircle2 /> ذخیره خودکار</span><h1>گزارش کار و درآمد</h1><p>جمع‌بندی شفاف زمان، صورتحساب و عملکرد این ماه.</p></div><div className="row-actions"><Button variant="outline" onClick={() => exportReport("csv")}><Download /> خروجی CSV</Button><Button onClick={() => exportReport("excel")}><FileSpreadsheet /> خروجی Excel</Button></div></section>
    <section className="filters panel"><div className="search-box"><Search /><Input placeholder="جست‌وجوی پروژه یا توضیح" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} /></div><Select value={filters.clientId} onValueChange={(clientId) => setFilters({ ...filters, clientId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه مشتری‌ها</SelectItem>{data.clients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select><Select value={filters.projectId} onValueChange={(projectId) => setFilters({ ...filters, projectId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه پروژه‌ها</SelectItem>{data.projects.map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select><Select value={filters.billable} onValueChange={(billable) => setFilters({ ...filters, billable })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه وضعیت‌ها</SelectItem><SelectItem value="true">قابل صورتحساب</SelectItem><SelectItem value="false">غیرقابل صورتحساب</SelectItem></SelectContent></Select><Button><Filter /> اعمال فیلتر</Button></section>
    <section className="metric-grid four"><MetricCard icon={<Clock3 />} label="کل زمان" value={duration(monthStats.worked + entries.reduce((sum, entry) => sum + entryMinutes(entry), 0))} suffix="ساعت" tone="blue" /><MetricCard icon={<CheckCircle2 />} label="قابل صورتحساب" value={duration(reportBillable)} suffix="ساعت" /><MetricCard icon={<Pause />} label="غیرقابل صورتحساب" value={duration(Math.max(0, entries.reduce((sum, entry) => sum + entryMinutes(entry), 0) - reportBillable))} suffix="ساعت" tone="amber" /><MetricCard icon={<TrendingUp />} label="درآمد تخمینی" value={money(reportIncome)} suffix="تومان" /></section>
    <section className="charts-grid">
      <article className="panel chart-card"><div className="panel-head"><div><BarChart3 /><h2>روند زمان و درآمد هفتگی</h2></div></div><div className="dual-chart">{weekValues.map((value, index) => <div key={index}><i className="income" style={{ height: `${value * 6}px` }} /><i className="time" style={{ height: `${Math.max(8, value * 4)}px` }} /><span>{["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"][index]}</span></div>)}</div><small className="chart-note">ارتفاع سبز زمان و آبی درآمد نسبی هر روز را نشان می‌دهد.</small></article>
      <article className="panel donut-card"><div className="panel-head"><div><WalletCards /><h2>خلاصه صورتحساب</h2></div></div><div className="donut" style={{ "--billable": `${Math.round(reportBillable / Math.max(1, entries.reduce((sum, entry) => sum + entryMinutes(entry), 0)) * 360)}deg` } as React.CSSProperties}><strong>{fa.format(Math.round(reportBillable / Math.max(1, entries.reduce((sum, entry) => sum + entryMinutes(entry), 0)) * 100))}٪</strong><span>قابل صورتحساب</span></div><ul><li><i className="green" /> قابل صورتحساب <strong>{duration(reportBillable)}</strong></li><li><i className="amber" /> غیرقابل صورتحساب <strong>{duration(Math.max(0, entries.reduce((sum, entry) => sum + entryMinutes(entry), 0) - reportBillable))}</strong></li></ul></article>
    </section>
    <section className="dashboard-grid report-table-grid"><article className="panel table-panel"><div className="panel-head"><div><FileSpreadsheet /><h2>جزئیات رکوردها</h2></div></div><div className="table-wrap"><table><thead><tr><th>تاریخ</th><th>مشتری</th><th>پروژه</th><th>شرح</th><th>مدت</th><th>نرخ مؤثر</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>{entries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      const client = data.clients.find((item) => item.id === entry.clientId);
      const minutes = entryMinutes(entry);
      return <tr key={entry.id}><td>{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" }).format(new Date(entry.startedAt))}</td><td>{client?.name}</td><td>{project?.name}</td><td>{entry.note || entry.task || "—"}</td><td>{duration(minutes)}</td><td>{money(entry.effectiveRate)}</td><td>{money(entry.billable ? minutes / 60 * entry.effectiveRate : 0)}</td><td><span className={`status ${entry.billable ? "success" : ""}`}>{entry.billable ? "قابل صورتحساب" : "غیرقابل"}</span></td></tr>;
    })}{entries.length === 0 && <tr><td colSpan={8}><div className="empty-state"><Filter /><strong>رکوردی با این فیلتر پیدا نشد</strong><span>فیلترها را تغییر بده یا تایمر پروژه را شروع کن.</span></div></td></tr>}</tbody></table></div></article><aside className="panel print-card"><div className="panel-head"><div><Printer /><h2>آماده ارسال به مشتری</h2></div></div><div className="paper-preview"><BarChart3 /><span /><span /><i /></div><ul><li><Check /> خلاصه زمان و درآمد</li><li><Check /> نمودارهای تحلیلی</li><li><Check /> ریز فعالیت‌ها</li><li><Check /> مناسب چاپ و ذخیره</li></ul><Button className="full" onClick={() => window.print()}><Printer /> پیش‌نمایش چاپ</Button></aside></section>
    <section className="panel employee-report"><div><strong>گزارش کارمندی این ماه</strong><span>{fa.format(monthRecords.length)} روز ثبت‌شده · هدف {duration(monthStats.target)} · کارکرد {duration(monthStats.worked)} · تراز {duration(monthStats.balance, true)}</span></div><span className={monthStats.balance >= 0 ? "positive" : "negative"}>{duration(monthStats.balance, true)}</span></section>
  </>;
}

function LeavePage({ data, setData, draft, setDraft, saveLeave, used, available }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  draft: LeaveEntry;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
  saveLeave: () => void;
  used: number;
  available: number;
}) {
  return <>
    <section className="page-heading"><div><span className="save-inline"><CheckCircle2 /> ذخیره خودکار</span><h1>مرخصی‌های من</h1><p>سهمیه، درخواست‌های شخصی و تاریخچه مرخصی را مدیریت کن.</p></div></section>
    <section className="metric-grid three"><MetricCard icon={<Umbrella />} label="سهمیه کل" value={duration(data.settings.leaveBalanceMinutes + data.settings.monthlyLeaveMinutes)} suffix="ساعت" tone="blue" /><MetricCard icon={<Clock3 />} label="مصرف‌شده" value={duration(used)} suffix="ساعت" tone="amber" /><MetricCard icon={<CheckCircle2 />} label="مانده مرخصی" value={duration(available)} suffix="ساعت" /></section>
    <section className="leave-layout"><article className="panel leave-form"><div className="panel-head"><div><Plus /><h2>{draft.id ? "ویرایش مرخصی" : "ثبت مرخصی جدید"}</h2></div></div><div className="form-grid two"><label>نوع مرخصی<Select value={draft.type} onValueChange={(type) => setDraft({ ...draft, type: type as LeaveEntry["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">روز کامل</SelectItem><SelectItem value="half">نیم‌روز</SelectItem><SelectItem value="hourly">ساعتی</SelectItem></SelectContent></Select></label>{draft.type === "hourly" && <label>مدت (دقیقه)<NumberField value={draft.minutes} onValueChange={(minutes) => setDraft({ ...draft, minutes })} /></label>}<label>از تاریخ<JalaliDatePicker value={draft.startDate} onChange={(startDate) => setDraft({ ...draft, startDate })} /></label><label>تا تاریخ<JalaliDatePicker value={draft.endDate} onChange={(endDate) => setDraft({ ...draft, endDate })} /></label><label className="span-2">توضیح اختیاری<Input value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label></div><Button className="full" onClick={saveLeave}><Save /> {draft.id ? "ذخیره تغییرات" : "ثبت مرخصی"}</Button><p className="helper"><Info />این اپ شخصی است و فرایند تأیید سازمانی ندارد.</p></article><article className="panel table-panel"><div className="panel-head"><div><Umbrella /><h2>تاریخچه مرخصی‌ها</h2></div></div><div className="table-wrap"><table><thead><tr><th>بازه</th><th>نوع</th><th>مدت</th><th>توضیح</th><th>عملیات</th></tr></thead><tbody>{data.leaves.map((entry) => <tr key={entry.id}><td>{jalali(entry.startDate)} تا {jalali(entry.endDate)}</td><td><span className="status success">{entry.type === "full" ? "روز کامل" : entry.type === "half" ? "نیم‌روز" : "ساعتی"}</span></td><td>{entry.type === "hourly" ? duration(entry.minutes) : entry.type === "half" ? "نیم‌روز" : "یک روز"}</td><td>{entry.note || "—"}</td><td><div className="row-actions"><Button variant="outline" size="icon" onClick={() => setDraft(entry)}><Edit3 /></Button><Button variant="destructive" size="icon" onClick={() => { if (confirm("این مرخصی حذف شود؟")) setData((prev) => ({ ...prev, leaves: prev.leaves.filter((item) => item.id !== entry.id) })); }}><Trash2 /></Button></div></td></tr>)}{data.leaves.length === 0 && <tr><td colSpan={5}><div className="empty-state"><Umbrella /><strong>مرخصی‌ای ثبت نشده</strong><span>اولین مرخصی را از فرم کناری ثبت کن.</span></div></td></tr>}</tbody></table></div></article></section>
  </>;
}

function SettingsPage({ data, setData, storage, exportBackup, previewImport, importPreview, applyImport, requestPersistence, onModeChange, setToast }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  storage: { usage: number; quota: number; persisted: boolean };
  exportBackup: () => void;
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
  requestPersistence: () => Promise<void>;
  onModeChange: (mode: Mode) => void;
  setToast: (message: string) => void;
}) {
  const usagePercent = storage.quota ? Math.min(100, storage.usage / storage.quota * 100) : 0;
  return <>
    <section className="page-heading"><div><h1>تنظیمات و داده‌ها</h1><p>برنامه کاری، پشتیبان‌گیری و فضای ذخیره‌سازی را مدیریت کن.</p></div></section>
    <section className="settings-layout">
      <aside className="panel settings-menu"><button className="active"><Database /> داده و پشتیبان</button><button><UserRound /> عمومی</button><button><CalendarDays /> برنامه کاری</button><button><Info /> درباره برنامه</button></aside>
      <div className="settings-content">
        <section className="panel settings-card"><div className="panel-head"><div><HardDrive /><h2>فضای ذخیره‌سازی</h2></div></div><dl className="storage-list"><div><dt>محل ذخیره‌سازی</dt><dd>ذخیره مرورگر (IndexedDB)</dd></div><div><dt>فضای استفاده‌شده</dt><dd>{(storage.usage / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} مگابایت</dd></div></dl><div className="storage-meter"><i><b style={{ width: `${Math.max(2, usagePercent)}%` }} /></i><span>حدود {(storage.quota / 1024 / 1024 / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} گیگابایت سهمیه تقریبی مرورگر</span></div><Button className="full" onClick={() => void requestPersistence()}><ShieldCheck /> {storage.persisted ? "ذخیره پایدار فعال است" : "درخواست ذخیره پایدار"}</Button><p className="helper"><Info />سیستم‌عامل یا مرورگر ممکن است در شرایط کمبود فضا داده‌های محلی را پاک کند؛ پشتیبان منظم توصیه می‌شود.</p></section>
        <section className="panel settings-card"><div className="panel-head"><div><Download /><h2>پشتیبان‌گیری</h2></div></div><p>آخرین وضعیت برنامه را به‌صورت JSON نسخه‌بندی‌شده دانلود کن.</p><Button variant="outline" className="full" onClick={exportBackup}><Download /> دانلود فایل پشتیبان</Button></section>
        <section className="panel settings-card restore-card"><div className="panel-head"><div><Upload /><h2>بازیابی داده‌ها</h2></div></div><label className="drop-zone"><Upload /><strong>فایل پشتیبان را اینجا انتخاب کن</strong><span>فقط فایل JSON ساعت‌یار</span><Input type="file" accept=".json,application/json" onChange={(event) => previewImport(event.target.files?.[0])} /></label>{importPreview && <div className="import-preview"><strong><CheckCircle2 /> فایل معتبر است</strong><span>{fa.format(Object.keys(importPreview.records).length)} روز، {fa.format(importPreview.clients.length)} مشتری، {fa.format(importPreview.projects.length)} پروژه و {fa.format(importPreview.timeEntries.length)} رکورد زمان</span><div className="row-actions"><Button onClick={() => void applyImport("merge")}><Check /> ادغام پیشنهادی</Button><Button variant="destructive" onClick={() => void applyImport("replace")}>جایگزینی کامل</Button></div></div>}</section>
        <section className="panel settings-card work-settings"><div className="panel-head"><div><SettingsIcon /><h2>تنظیمات کاری</h2></div></div><div className="form-grid three"><label>نوع استفاده<Select value={data.settings.mode} onValueChange={(mode) => onModeChange(mode as Mode)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="employee">کارمند</SelectItem><SelectItem value="freelancer">فریلنسر</SelectItem><SelectItem value="hybrid">ترکیبی</SelectItem></SelectContent></Select></label><label>شروع معمول<TimePicker value={data.settings.defaultStart} onChange={(defaultStart) => setData({ ...data, settings: { ...data.settings, defaultStart } })} /></label><label>پایان معمول<TimePicker value={data.settings.defaultEnd} onChange={(defaultEnd) => setData({ ...data, settings: { ...data.settings, defaultEnd } })} /></label><label>ناهار پیش‌فرض<NumberField value={data.settings.lunchMinutes} onValueChange={(lunchMinutes) => setData({ ...data, settings: { ...data.settings, lunchMinutes } })} /></label><label>هدف هفتگی<NumberField value={data.settings.weeklyMinutes / 60} onValueChange={(hours) => setData({ ...data, settings: { ...data.settings, weeklyMinutes: hours * 60 } })} /></label><label>حقوق پایه<NumberField value={data.settings.salary} onValueChange={(salary) => setData({ ...data, settings: { ...data.settings, salary } })} /></label></div><Button onClick={() => setToast("تنظیمات ذخیره شد")}><Save /> ذخیره تنظیمات</Button></section>
        <section className="panel danger-zone"><div><AlertTriangle /><div><strong>پاک‌کردن همه داده‌ها</strong><span>این عملیات قابل بازگشت نیست؛ ابتدا پشتیبان بگیر.</span></div></div><Button variant="destructive" onClick={() => { if (confirm("تمام اطلاعات ساعت‌یار برای همیشه پاک شود؟")) { setData({ settings: { ...defaultSettings, onboarded: true }, records: {}, leaves: [], clients: [], projects: [], timeEntries: [] }); setToast("همه داده‌ها پاک شدند"); } }}><Trash2 /> پاک‌کردن همه داده‌ها</Button></section>
      </div>
    </section>
  </>;
}
