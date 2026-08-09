import type { Dispatch, SetStateAction } from "react";
import { isValidAppData } from "@/lib/backup-schema";
import { createBackupEnvelope, mergeAppData, parseBackupEnvelope } from "@/lib/backup-workflow";
import { defaultSettings } from "@/lib/constants";
import { normaliseData } from "@/lib/data/normalise";
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
  return new Blob([JSON.stringify(createBackupEnvelope(source), null, 2)], { type: "application/json" });
}

export function useBackupActions({ data, setData, setToast, importPreview, setImportPreview, storage }: Args) {
  function exportBackup() { downloadBlob(backupBlob(data), `saatyar-backup-${localDateKey()}.json`); setToast("فایل پشتیبان دانلود شد"); }
  function previewImport(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackupEnvelope(JSON.parse(String(reader.result)));
        if (!isValidAppData(parsed)) throw new Error("invalid");
        setImportPreview(normaliseData(parsed, defaultSettings)); setToast("فایل معتبر است؛ روش بازیابی را انتخاب کنید");
      } catch { setImportPreview(null); setToast("ساختار فایل پشتیبان معتبر نیست"); }
    };
    reader.readAsText(file);
  }
  async function commitImport(next: AppData, message: string, options: { safetyBackup?: boolean } = {}) {
    if (options.safetyBackup) downloadBlob(backupBlob(data), `saatyar-before-import-${localDateKey()}.json`);
    try {
      await storage.save(next);
      setData(next);
      setImportPreview(null);
      setToast(message);
      return true;
    } catch {
      setToast("ذخیره واردسازی ناموفق بود؛ داده‌های فعلی تغییر نکردند");
      return false;
    }
  }
  async function applyImport(mode: "merge" | "replace") {
    if (!importPreview) return;
    const next = mode === "replace" ? importPreview : mergeAppData(data, importPreview);
    await commitImport(next, mode === "replace" ? "داده‌ها با موفقیت جایگزین شدند" : "داده‌ها با موفقیت ادغام شدند", { safetyBackup: mode === "replace" });
  }
  return { exportBackup, previewImport, applyImport, commitImport };
}
