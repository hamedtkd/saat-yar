"use client";

import { ArrowRight, DatabaseZap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PageHeading } from "@/components/common/page-heading";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";
import { Button } from "@/components/ui/button";
import type { AppData } from "@/lib/types";
import { BackupImportPanel } from "./backup-import-panel";
import { CsvImportPanel } from "./csv-import-panel";
import { ImportSourcePicker, type ImportSource } from "./import-source-picker";

export function ImportPage({ data, commitImport }: {
  data: AppData;
  commitImport: (next: AppData, message: string, options?: { safetyBackup?: boolean }) => Promise<boolean>;
}) {
  const [source, setSource] = useState<ImportSource>("backup");
  return (
    <>
      <PageHeading
        autosave={false}
        title="واردسازی داده‌ها"
        description="قبل از هر تغییر، فایل را بررسی کن، ستون‌ها را تطبیق بده و تعارض‌ها را ببین. هیچ Importی بدون تأیید نهایی اعمال نمی‌شود."
      >
        <Button asChild variant="outline"><GuardedLink href="/settings#settings-restore"><ArrowRight /> بازگشت به تنظیمات</GuardedLink></Button>
      </PageHeading>

      <section className="mb-5 grid gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><strong className="text-sm text-[var(--text)]">Import امن و Local-first</strong><p className="mt-1 text-[11px] leading-6 text-[var(--text-muted)]">فایل روی سروری آپلود نمی‌شود. پردازش و Preview داخل همین مرورگر انجام می‌شود.</p></div>
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[color-mix(in_srgb,var(--success)_25%,var(--border))] bg-[var(--success-soft)] px-3 py-2 text-[10px] font-bold text-[var(--success)]"><ShieldCheck className="size-4" /> بدون تغییر تا تأیید نهایی</span>
      </section>

      <section className="grid gap-4">
        <div className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2"><DatabaseZap className="text-[var(--accent-strong)]" /><div><h2 className="text-[15px] font-bold text-[var(--text)]">منبع داده را انتخاب کن</h2><p className="mt-1 text-[10px] text-[var(--text-muted)]">برای Backup کامل JSON یا داده‌های جدولی CSV از مسیر مناسب استفاده کن.</p></div></div>
          <ImportSourcePicker value={source} onChange={setSource} />
        </div>
        {source === "backup" ? <BackupImportPanel data={data} commitImport={commitImport} /> : <CsvImportPanel data={data} commitImport={commitImport} />}
      </section>
    </>
  );
}
