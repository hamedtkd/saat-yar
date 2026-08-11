"use client";

import { Check, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { FileDropField } from "@/components/common/file-drop-field";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

export function RestoreCard({ previewImport, importPreview, applyImport }: {
  previewImport: (file?: File) => void;
  importPreview: AppData | null;
  applyImport: (mode: "merge" | "replace") => Promise<void>;
}) {
  const { number, s } = useSystemUi();
  return (
    <section id="settings-restore" className={cn("scroll-mt-24 dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] shadow-[0_5px_16px_rgba(0,0,0,.03)] p-4", "p-5", "col-span-full max-[620px]:col-auto")}>
      <PanelHead icon={<Upload />} title={s("Restore and import")} />
      <div className="mb-4 grid gap-3 rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><strong className="text-xs text-[var(--text)]">{s("Import Wizard for existing data")}</strong><p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">{s("Import backups or CSV with Preview, column mapping, and conflict handling.")}</p></div>
        <Button asChild size="sm"><GuardedLink href="/import"><FileSpreadsheet /> {s("Open Import Wizard")}</GuardedLink></Button>
      </div>
      <p className="mb-2 text-[10px] text-[var(--text-muted)]">{s("Quick Saatyar JSON restore remains available for compatibility:")}</p>
      <FileDropField accept=".json,application/json" title={s("Choose backup file here")} description={s("Saatyar JSON files only")} onFile={previewImport} />
      {importPreview && <div className={cn("mt-3 grid gap-[9px] rounded-[10px] border border-[var(--accent)] bg-[var(--accent-soft)] p-3 text-[11px] [&_strong]:flex [&_strong]:gap-[7px] [&_strong]:text-[var(--accent-strong)]")}><strong><CheckCircle2 /> {s("The file is valid")}</strong><span>{s("{days} days, {clients} clients, {projects} projects, and {entries} time entries", { days: number(Object.keys(importPreview.records).length), clients: number(importPreview.clients.length), projects: number(importPreview.projects.length), entries: number(importPreview.timeEntries.length) })}</span><div className={cn("flex items-center gap-[9px] max-[620px]:flex-wrap")}><Button onClick={() => void applyImport("merge")}><Check /> {s("Recommended merge")}</Button><Button variant="destructive" onClick={() => void applyImport("replace")}>{s("Full replace")}</Button></div></div>}
    </section>
  );
}
