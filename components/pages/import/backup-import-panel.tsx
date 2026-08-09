"use client";

import { useState } from "react";
import { CheckCircle2, DatabaseBackup, ShieldCheck } from "lucide-react";
import { FileDropField } from "@/components/common/file-drop-field";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { parseBackupEnvelope } from "@/lib/backup-workflow";
import { defaultSettings } from "@/lib/constants";
import { normaliseData } from "@/lib/data/normalise";
import { fa } from "@/lib/format";
import { analyzeBackupImport, mergeBackupKeepingCurrent, type BackupImportAnalysis } from "@/lib/import-wizard";
import type { AppData } from "@/lib/types";

export function BackupImportPanel({ data, commitImport }: {
  data: AppData;
  commitImport: (next: AppData, message: string, options?: { safetyBackup?: boolean }) => Promise<boolean>;
}) {
  const [analysis, setAnalysis] = useState<BackupImportAnalysis | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    setError(""); setAnalysis(null);
    try {
      const parsed = parseBackupEnvelope(JSON.parse(await file.text()));
      const incoming = normaliseData(parsed, defaultSettings);
      setAnalysis(analyzeBackupImport(data, incoming));
    } catch {
      setError("فایل انتخاب‌شده یک پشتیبان معتبر ساعت‌یار نیست.");
    }
  }

  async function apply(mode: "safe" | "replace") {
    if (!analysis || busy) return;
    setBusy(true);
    const next = mode === "replace" ? analysis.incoming : mergeBackupKeepingCurrent(data, analysis.incoming);
    await commitImport(
      next,
      mode === "replace" ? "پشتیبان با موفقیت جایگزین شد" : "موارد جدید پشتیبان بدون بازنویسی داده فعلی اضافه شدند",
      { safetyBackup: mode === "replace" },
    );
    setBusy(false);
  }

  return (
    <section className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-4 sm:p-5">
      <PanelHead icon={<DatabaseBackup />} title="واردسازی پشتیبان ساعت‌یار" />
      <p className="mb-4 text-[11px] leading-6 text-[var(--text-muted)]">فایل ابتدا فقط خوانده و تحلیل می‌شود. تا قبل از فشردن دکمه اعمال، هیچ داده‌ای تغییر نمی‌کند.</p>
      <FileDropField accept=".json,application/json" title="فایل JSON ساعت‌یار را انتخاب کن" description="پشتیبان نسخه‌های قبلی هم در صورت پشتیبانی Schema مهاجرت داده می‌شود" onFile={(file) => { void onFile(file); }} />
      {error && <p className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">{error}</p>}
      {analysis && (
        <div className="mt-4 grid gap-4" data-import-backup-preview>
          <div className="flex flex-wrap gap-2"><StatusBadge tone="success"><CheckCircle2 className="me-1 size-3" /> فایل معتبر</StatusBadge><StatusBadge tone={analysis.conflicts ? "warning" : "neutral"}>{fa.format(analysis.conflicts)} تعارض</StatusBadge><StatusBadge tone="info">{fa.format(analysis.additions)} مورد جدید</StatusBadge></div>
          <div className="grid gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 text-[11px] text-[var(--text-muted)] sm:grid-cols-3">
            <span><strong className="block text-[var(--text)]">روزهای کاری</strong>{fa.format(analysis.details.records.additions)} جدید / {fa.format(analysis.details.records.conflicts)} موجود</span>
            <span><strong className="block text-[var(--text)]">کسب‌وکار و مالی</strong>{fa.format(analysis.details.clients.additions + analysis.details.projects.additions + analysis.details.expenses.additions + analysis.details.invoices.additions)} مورد جدید</span>
            <span><strong className="block text-[var(--text)]">تنظیمات متفاوت</strong>{fa.format(analysis.settingsChanged)} بخش</span>
          </div>
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--info)_25%,var(--border))] bg-[var(--info-soft)] p-3 text-[11px] leading-6 text-[var(--text-muted)]"><ShieldCheck className="me-1 inline size-4 text-[var(--info)]" /> «افزودن امن» فقط موارد جدید را اضافه می‌کند و تنظیمات و موارد متعارض فعلی را نگه می‌دارد. «جایگزینی کامل» ابتدا یک پشتیبان ایمنی دانلود می‌کند.</div>
          <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => { void apply("safe"); }}>افزودن امن موارد جدید</Button><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={busy}>جایگزینی کامل</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>همه داده‌های فعلی جایگزین شوند؟</AlertDialogTitle><AlertDialogDescription>این عملیات کل AppData فعلی را با فایل انتخاب‌شده جایگزین می‌کند. قبل از اجرا یک Backup ایمنی دانلود می‌شود، اما بهتر است فقط وقتی مطمئن هستی ادامه بدهی.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={() => { void apply("replace"); }}>بله، جایگزین شود</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
        </div>
      )}
    </section>
  );
}
