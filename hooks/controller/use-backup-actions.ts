import type { Dispatch, SetStateAction } from "react";
import { isValidAppData, parseBackup } from "@/lib/backup-schema";
import { defaultSettings } from "@/lib/constants";
import { normaliseData } from "@/lib/data/normalise";
import { APP_DATA_SCHEMA_VERSION } from "@/lib/data/version";
import { localDateKey } from "@/lib/format";
import type { AppData } from "@/lib/types";

type StorageLike = { save: (data: AppData) => Promise<void> };
type Args = {
  data: AppData; setData: Dispatch<SetStateAction<AppData>>; setToast: (message: string) => void;
  importPreview: AppData | null; setImportPreview: Dispatch<SetStateAction<AppData | null>>; storage: StorageLike;
};

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}
function backupBlob(source: AppData) {
  return new Blob([JSON.stringify({ appName: "ساعت‌یار", schemaVersion: APP_DATA_SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: source }, null, 2)], { type: "application/json" });
}
function mergeById<T extends { id: string }>(current: T[], incoming: T[]) {
  return [...current, ...incoming.filter((item) => !current.some((existing) => existing.id === item.id))];
}

export function useBackupActions({ data, setData, setToast, importPreview, setImportPreview, storage }: Args) {
  function exportBackup() { downloadBlob(backupBlob(data), `saatyar-backup-${localDateKey()}.json`); setToast("فایل پشتیبان دانلود شد"); }
  function previewImport(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackup(JSON.parse(String(reader.result)));
        if (!isValidAppData(parsed)) throw new Error("invalid");
        setImportPreview(normaliseData(parsed, defaultSettings)); setToast("فایل معتبر است؛ روش بازیابی را انتخاب کنید");
      } catch { setImportPreview(null); setToast("ساختار فایل پشتیبان معتبر نیست"); }
    };
    reader.readAsText(file);
  }
  async function applyImport(mode: "merge" | "replace") {
    if (!importPreview) return;
    if (mode === "replace") downloadBlob(backupBlob(data), `saatyar-before-replace-${localDateKey()}.json`);
    const next = mode === "replace" ? importPreview : {
      settings: { ...data.settings, ...importPreview.settings }, records: { ...data.records, ...importPreview.records },
      leaves: mergeById(data.leaves, importPreview.leaves), clients: mergeById(data.clients, importPreview.clients),
      projects: mergeById(data.projects, importPreview.projects), timeEntries: mergeById(data.timeEntries, importPreview.timeEntries),
      expenses: mergeById(data.expenses, importPreview.expenses), invoices: mergeById(data.invoices, importPreview.invoices),
      holidayOverrides: mergeById(data.holidayOverrides, importPreview.holidayOverrides),
    };
    await storage.save(next); setData(next); setImportPreview(null);
    setToast(mode === "replace" ? "داده‌ها با موفقیت جایگزین شدند" : "داده‌ها با موفقیت ادغام شدند");
  }
  return { exportBackup, previewImport, applyImport };
}
