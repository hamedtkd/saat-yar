import { Check, CheckCircle2, Upload } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fa } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData } from "@/lib/types";

export function RestoreCard({ previewImport, importPreview, applyImport }: {
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
}) {
  return (
    <section className={tw("panel", "settings-card", "restore-card")}>
      <PanelHead icon={<Upload />} title="بازیابی داده‌ها" />
      <label className={tw("drop-zone")}><Upload /><strong>فایل پشتیبان را اینجا انتخاب کن</strong><span>فقط فایل JSON ساعت‌یار</span><Input type="file" accept=".json,application/json" onChange={(event) => previewImport(event.target.files?.[0])} /></label>
      {importPreview && <div className={tw("import-preview")}><strong><CheckCircle2 /> فایل معتبر است</strong><span>{fa.format(Object.keys(importPreview.records).length)} روز، {fa.format(importPreview.clients.length)} مشتری، {fa.format(importPreview.projects.length)} پروژه و {fa.format(importPreview.timeEntries.length)} رکورد زمان</span><div className={tw("row-actions")}><Button onClick={() => void applyImport("merge")}><Check /> ادغام پیشنهادی</Button><Button variant="destructive" onClick={() => void applyImport("replace")}>جایگزینی کامل</Button></div></div>}
    </section>
  );
}
