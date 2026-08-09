"use client";

import { DatabaseZap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BackupImportPanel } from "@/components/pages/import/backup-import-panel";
import { CsvImportPanel } from "@/components/pages/import/csv-import-panel";
import { ImportSourcePicker, type ImportSource } from "@/components/pages/import/import-source-picker";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { CommitImport } from "./types";

export function ImportStep({ data, commitImport }: { data: AppData; commitImport: CommitImport }) {
  const [source, setSource] = useState<ImportSource>("backup");

  const commitWithoutFinishingOnboarding: CommitImport = (next, message, options) => commitImport({
    ...next,
    settings: { ...next.settings, onboarded: data.settings.onboarded },
  }, message, options);

  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[720px] text-center" data-onboarding-import>
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><DatabaseZap /></span>
        <h1>از قبل داده داری؟ همین‌جا واردش کن</h1>
        <p>این مرحله کاملاً اختیاری است. Backup ساعت‌یار یا CSV را Preview کن؛ تا قبل از تأیید هیچ داده‌ای تغییر نمی‌کند.</p>
      </div>
      <div className="mx-auto grid max-w-[980px] gap-4 text-right" data-onboarding-inline-form>
        <div className="rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-sm text-[var(--text)]">منبع داده</strong><span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--success)]"><ShieldCheck className="size-3.5" /> Local-first</span></div>
          <ImportSourcePicker value={source} onChange={setSource} />
        </div>
        {source === "backup"
          ? <BackupImportPanel data={data} commitImport={commitWithoutFinishingOnboarding} />
          : <CsvImportPanel data={data} commitImport={commitWithoutFinishingOnboarding} />}
        <p className="text-center text-[10px] leading-5 text-[var(--text-muted)]">اگر چیزی برای Import نداری، مستقیم «شروع ساعت‌یار» را بزن. این Wizard همیشه از Settings هم در دسترس است.</p>
      </div>
    </StepShell>
  );
}
