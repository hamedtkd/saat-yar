import { Check, CheckCircle2, Upload } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fa } from "@/lib/format";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function RestoreCard({ previewImport, importPreview, applyImport }: {
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
}) {
  return (
    <section className={cn("rounded-[15px] border border-[var(--border)] bg-[var(--surface-1)] shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "p-5", "col-span-full max-[620px]:col-auto")}>
      <PanelHead icon={<Upload />} title="بازیابی داده‌ها" />
      <label className={cn("relative grid min-h-[125px] place-items-center content-center rounded-xl border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--surface-2)] text-center text-[var(--accent-strong)] [&>svg]:h-[25px] [&>svg]:w-[25px] [&_span]:text-[9px] [&_span]:text-[var(--text-muted)] [&_input]:absolute [&_input]:inset-0 [&_input]:h-full [&_input]:cursor-pointer [&_input]:opacity-0")}><Upload /><strong>فایل پشتیبان را اینجا انتخاب کن</strong><span>فقط فایل JSON ساعت‌یار</span><Input type="file" accept=".json,application/json" onChange={(event) => previewImport(event.target.files?.[0])} /></label>
      {importPreview && <div className={cn("mt-3 grid gap-[9px] rounded-[10px] border border-[var(--accent)] bg-[var(--accent-soft)] p-3 text-[11px] [&_strong]:flex [&_strong]:gap-[7px] [&_strong]:text-[var(--accent-strong)]")}><strong><CheckCircle2 /> فایل معتبر است</strong><span>{fa.format(Object.keys(importPreview.records).length)} روز، {fa.format(importPreview.clients.length)} مشتری، {fa.format(importPreview.projects.length)} پروژه و {fa.format(importPreview.timeEntries.length)} رکورد زمان</span><div className={cn("flex items-center gap-[9px] max-[620px]:flex-wrap")}><Button onClick={() => void applyImport("merge")}><Check /> ادغام پیشنهادی</Button><Button variant="destructive" onClick={() => void applyImport("replace")}>جایگزینی کامل</Button></div></div>}
    </section>
  );
}
