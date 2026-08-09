"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, RefreshCcw, ShieldCheck } from "lucide-react";
import { FileDropField } from "@/components/common/file-drop-field";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import {
  applyCsvImport, buildCsvImportPreview, createAutoMapping, CSV_IMPORT_LABELS,
  getCsvTemplate, parseCsvText, type CsvConflictStrategy, type CsvImportKind,
  type CsvMapping, type ParsedCsv,
} from "@/lib/import-wizard";
import type { AppData } from "@/lib/types";
import { CsvMappingGrid } from "./csv-mapping-grid";
import { CsvPreviewTable } from "./csv-preview-table";
import { ImportPreviewStats } from "./import-preview-stats";

function downloadText(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([`\uFEFF${text}`], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

export function CsvImportPanel({ data, commitImport }: {
  data: AppData;
  commitImport: (next: AppData, message: string, options?: { safetyBackup?: boolean }) => Promise<boolean>;
}) {
  const [kind, setKind] = useState<CsvImportKind>("clients");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<CsvMapping>({});
  const [strategy, setStrategy] = useState<CsvConflictStrategy>("skip");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => parsed ? buildCsvImportPreview(kind, parsed, mapping, data) : null, [data, kind, mapping, parsed]);

  function reset(nextKind = kind) { setParsed(null); setMapping({}); setStrategy("skip"); setError(""); setKind(nextKind); }
  async function onFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      const nextParsed = parseCsvText(await file.text());
      setParsed(nextParsed);
      setMapping(createAutoMapping(kind, nextParsed.headers));
    } catch (caught) {
      setParsed(null); setMapping({});
      setError(caught instanceof Error ? caught.message : "خواندن CSV ممکن نشد.");
    }
  }
  async function apply() {
    if (!preview || busy || preview.readyCount + preview.conflictCount === 0) return;
    setBusy(true);
    const result = applyCsvImport(data, preview, strategy);
    const ok = await commitImport(
      result.data,
      `${result.applied.toLocaleString("fa-IR")} ردیف وارد شد و ${result.skipped.toLocaleString("fa-IR")} ردیف رد یا نادیده گرفته شد`,
      { safetyBackup: strategy === "replace" && preview.conflictCount > 0 },
    );
    if (ok) reset(kind);
    setBusy(false);
  }

  return (
    <section className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-4 sm:p-5">
      <PanelHead icon={<FileSpreadsheet />} title="واردسازی CSV / Excel">
        <Button size="sm" variant="outline" onClick={() => downloadText(getCsvTemplate(kind), `saatyar-${kind}-template.csv`)}><Download /> نمونه CSV</Button>
      </PanelHead>
      <div className="grid gap-4">
        <label className="grid gap-2 text-[11px] font-semibold text-[var(--text-muted)]">نوع داده
          <Select value={kind} onValueChange={(value) => reset(value as CsvImportKind)}>
            <SelectTrigger data-import-kind><SelectValue /></SelectTrigger>
            <SelectContent>{(Object.keys(CSV_IMPORT_LABELS) as CsvImportKind[]).map((key) => <SelectItem key={key} value={key}>{CSV_IMPORT_LABELS[key].title}</SelectItem>)}</SelectContent>
          </Select>
          <span className="font-normal leading-5">{CSV_IMPORT_LABELS[kind].description}{kind === "projects" ? " — ابتدا مشتری‌ها را وارد کن." : kind === "expenses" ? " — ابتدا مشتری و پروژه را وارد کن." : ""}</span>
        </label>
        <FileDropField accept=".csv,.tsv,text/csv,text/tab-separated-values" title="فایل CSV را انتخاب کن" description="UTF-8، جداکننده کاما/سمی‌کالن/Tab؛ اعداد فارسی و تاریخ شمسی یا میلادی پشتیبانی می‌شوند" onFile={(file) => { void onFile(file); }} />
        {error && <p className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">{error}</p>}
        {parsed && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-3"><div><strong className="text-sm text-[var(--text)]">تطبیق ستون‌ها</strong><p className="mt-1 text-[10px] text-[var(--text-muted)]">ستون‌ها خودکار تشخیص داده شده‌اند؛ قبل از Preview می‌توانی هرکدام را اصلاح کنی.</p></div><Button size="sm" variant="ghost" onClick={() => setMapping(createAutoMapping(kind, parsed.headers))}><RefreshCcw /> تشخیص دوباره</Button></div>
            <CsvMappingGrid kind={kind} headers={parsed.headers} mapping={mapping} onChange={(field, header) => setMapping((current) => ({ ...current, [field]: header }))} />
            {preview && <><ImportPreviewStats ready={preview.readyCount} conflicts={preview.conflictCount} invalid={preview.invalidCount} /><CsvPreviewTable preview={preview} /></>}
            {preview && preview.conflictCount > 0 && (
              <div className="grid gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3">
                <strong className="text-xs text-[var(--text)]">رفتار با تعارض‌ها</strong>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["skip", "replace"] as const).map((value) => <button key={value} type="button" aria-pressed={strategy === value} onClick={() => setStrategy(value)} className={cn("rounded-xl border p-3 text-start text-[11px]", strategy === value ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--dashboard-border)] bg-[var(--surface-1)]")}><strong className="block text-[var(--text)]">{value === "skip" ? "نگه‌داشتن داده فعلی" : "جایگزینی موارد متعارض"}</strong><span className="mt-1 block text-[var(--text-muted)]">{value === "skip" ? "تعارض‌ها رد می‌شوند و فقط موارد جدید وارد می‌شوند." : "قبل از اعمال، یک پشتیبان ایمنی از وضعیت فعلی دانلود می‌شود."}</span></button>)}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2"><Button data-import-apply disabled={busy || !preview || preview.readyCount + (strategy === "replace" ? preview.conflictCount : 0) === 0} onClick={() => { void apply(); }}>اعمال واردسازی</Button><Button variant="ghost" disabled={busy} onClick={() => reset(kind)}>شروع دوباره</Button><span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]"><ShieldCheck className="size-3.5 text-[var(--success)]" /> ردیف‌های نامعتبر هیچ‌وقت اعمال نمی‌شوند.</span></div>
          </div>
        )}
      </div>
    </section>
  );
}
