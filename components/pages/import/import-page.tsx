"use client";
import { ArrowRight, DatabaseZap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { PageHeading } from "@/components/common/page-heading";
import { GuardedLink } from "@/components/layout/navigation/guarded-link";
import { Button } from "@/components/ui/button";
import type { AppData } from "@/lib/types";
import { BackupImportPanel } from "./backup-import-panel";
import { CsvImportPanel } from "./csv-import-panel";
import { ImportSourcePicker, type ImportSource } from "./import-source-picker";
export function ImportPage({ data, commitImport }: { data: AppData; commitImport: (next: AppData, message: string, options?: { safetyBackup?: boolean }) => Promise<boolean> }) {
  const { s } = useSystemUi(); const [source, setSource] = useState<ImportSource>("backup");
  return <><PageHeading autosave={false} title={s("Import files")} description={s("Review the file, map columns, and inspect conflicts before any change. No import is applied without final confirmation.")}><Button asChild variant="outline"><GuardedLink href="/settings#settings-restore"><ArrowRight /> {s("Back to Settings")}</GuardedLink></Button></PageHeading><section className="mb-5 grid gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><strong className="text-sm text-[var(--text)]">{s("Safe, local-first import")}</strong><p className="mt-1 text-[11px] leading-6 text-[var(--text-muted)]">{s("Files are never uploaded to a server. Processing and Preview happen in this browser.")}</p></div><span className="inline-flex items-center gap-1.5 rounded-xl border border-[color-mix(in_srgb,var(--success)_25%,var(--border))] bg-[var(--success-soft)] px-3 py-2 text-[10px] font-bold text-[var(--success)]"><ShieldCheck className="size-4" /> {s("No changes until final confirmation")}</span></section><section className="grid gap-4"><div className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-4 sm:p-5"><div className="mb-3 flex items-center gap-2"><DatabaseZap className="text-[var(--accent-strong)]" /><div><h2 className="text-[15px] font-bold text-[var(--text)]">{s("Choose a data source")}</h2><p className="mt-1 text-[10px] text-[var(--text-muted)]">{s("Use the matching path for a full JSON backup or tabular CSV data.")}</p></div></div><ImportSourcePicker value={source} onChange={setSource} /></div>{source === "backup" ? <BackupImportPanel data={data} commitImport={commitImport} /> : <CsvImportPanel data={data} commitImport={commitImport} />}</section></>;
}
