import { Check, CheckCircle2, Upload } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { FileDropField } from "@/components/common/file-drop-field";
import { fa } from "@/lib/format";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function RestoreCard({ previewImport, importPreview, applyImport }: {
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
}) {
  return (
    <section id="settings-restore" className={cn("scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] p-4", "p-5", "col-span-full max-[620px]:col-auto")}>
      <PanelHead icon={<Upload />} title="بازیابی داده‌ها" />
      <FileDropField accept=".json,application/json" title="فایل پشتیبان را اینجا انتخاب کن" description="فقط فایل JSON ساعت‌یار" onFile={previewImport} />
      {importPreview && <div className={cn("mt-3 grid gap-[9px] rounded-[10px] border border-[var(--accent)] bg-[var(--accent-soft)] p-3 text-[11px] [&_strong]:flex [&_strong]:gap-[7px] [&_strong]:text-[var(--accent-strong)]")}><strong><CheckCircle2 /> فایل معتبر است</strong><span>{fa.format(Object.keys(importPreview.records).length)} روز، {fa.format(importPreview.clients.length)} مشتری، {fa.format(importPreview.projects.length)} پروژه و {fa.format(importPreview.timeEntries.length)} رکورد زمان</span><div className={cn("flex items-center gap-[9px] max-[620px]:flex-wrap")}><Button onClick={() => void applyImport("merge")}><Check /> ادغام پیشنهادی</Button><Button variant="destructive" onClick={() => void applyImport("replace")}>جایگزینی کامل</Button></div></div>}
    </section>
  );
}
