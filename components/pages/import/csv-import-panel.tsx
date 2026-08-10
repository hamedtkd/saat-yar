"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, RefreshCcw, ShieldCheck } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { FileDropField } from "@/components/common/file-drop-field";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import {
  applyCsvImport, buildCsvImportPreview, createAutoMapping,
  getCsvTemplate, parseCsvText, type CsvConflictStrategy, type CsvImportKind,
  type CsvMapping, type ParsedCsv,
} from "@/lib/import-wizard";
import type { SystemMessageKey } from "@/lib/i18n/system";
import type { AppData } from "@/lib/types";
import { CsvMappingGrid } from "./csv-mapping-grid";
import { CsvPreviewTable } from "./csv-preview-table";
import { ImportPreviewStats } from "./import-preview-stats";

const KINDS: CsvImportKind[] = ["work-records", "clients", "projects", "expenses"];
const KIND_COPY: Record<CsvImportKind, { title: SystemMessageKey; description: SystemMessageKey }> = {
  "work-records": { title: "Workdays", description: "Past workday date, clock-in/out, lunch, and notes" },
  clients: { title: "Clients", description: "Client names, emails, and notes" },
  projects: { title: "Projects", description: "Project, client, rate, budget, and status" },
  expenses: { title: "Expenses", description: "Project/client expenses with date and category" },
};

function downloadText(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([`\uFEFF${text}`], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

export function CsvImportPanel({ data, commitImport }: { data: AppData; commitImport: (next: AppData, message: string, options?: { safetyBackup?: boolean }) => Promise<boolean> }) {
  const { s, locale, number } = useSystemUi();
  const [kind, setKind] = useState<CsvImportKind>("clients");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<CsvMapping>({});
  const [strategy, setStrategy] = useState<CsvConflictStrategy>("skip");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => parsed ? buildCsvImportPreview(kind, parsed, mapping, data, locale) : null, [data, kind, locale, mapping, parsed]);

  function reset(nextKind = kind) { setParsed(null); setMapping({}); setStrategy("skip"); setError(""); setKind(nextKind); }
  async function onFile(file?: File) {
    if (!file) return;
    setError("");
    try { const nextParsed = parseCsvText(await file.text()); setParsed(nextParsed); setMapping(createAutoMapping(kind, nextParsed.headers)); }
    catch (caught) { setParsed(null); setMapping({}); setError(caught instanceof Error ? caught.message : s("Could not read the CSV file.")); }
  }
  async function apply() {
    if (!preview || busy || preview.readyCount + preview.conflictCount === 0) return;
    setBusy(true);
    const result = applyCsvImport(data, preview, strategy);
    const ok = await commitImport(result.data, s("{applied} rows imported; {skipped} rows were skipped or rejected", { applied: number(result.applied), skipped: number(result.skipped) }), { safetyBackup: strategy === "replace" && preview.conflictCount > 0 });
    if (ok) reset(kind);
    setBusy(false);
  }

  const dependencyHint = kind === "projects" ? s("Import clients first.") : kind === "expenses" ? s("Import clients and projects first.") : "";
  return (
    <section className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-4 sm:p-5">
      <PanelHead icon={<FileSpreadsheet />} title={s("Import CSV / Excel")}><Button type="button" size="sm" variant="outline" onClick={() => downloadText(getCsvTemplate(kind), `saatyar-${kind}-template.csv`)}><Download /> {s("Sample CSV")}</Button></PanelHead>
      <div className="grid gap-4">
        <label className="grid gap-2 text-[11px] font-semibold text-[var(--text-muted)]">{s("Data type")}
          <Select value={kind} onValueChange={(value) => reset(value as CsvImportKind)}><SelectTrigger data-import-kind><SelectValue /></SelectTrigger><SelectContent>{KINDS.map((key) => <SelectItem key={key} value={key}>{s(KIND_COPY[key].title)}</SelectItem>)}</SelectContent></Select>
          <span className="font-normal leading-5">{s(KIND_COPY[kind].description)}{dependencyHint ? ` — ${dependencyHint}` : ""}</span>
        </label>
        <FileDropField accept=".csv,.tsv,text/csv,text/tab-separated-values" title={s("Select CSV file")} description={s("UTF-8 with comma, semicolon, or tab delimiters. Persian digits and Persian/Gregorian dates are supported.")} onFile={(file) => { void onFile(file); }} />
        {error && <p className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,var(--border))] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">{error}</p>}
        {parsed && <div className="grid gap-4"><div className="flex items-center justify-between gap-3"><div><strong className="text-sm text-[var(--text)]">{s("Column mapping")}</strong><p className="mt-1 text-[10px] text-[var(--text-muted)]">{s("Columns were detected automatically. You can adjust them before Preview.")}</p></div><Button type="button" size="sm" variant="ghost" onClick={() => setMapping(createAutoMapping(kind, parsed.headers))}><RefreshCcw /> {s("Detect again")}</Button></div><CsvMappingGrid kind={kind} headers={parsed.headers} mapping={mapping} onChange={(field, header) => setMapping((current) => ({ ...current, [field]: header }))} />{preview && <><ImportPreviewStats ready={preview.readyCount} conflicts={preview.conflictCount} invalid={preview.invalidCount} /><CsvPreviewTable preview={preview} /></>}{preview && preview.conflictCount > 0 && <div className="grid gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3"><strong className="text-xs text-[var(--text)]">{s("Conflict behavior")}</strong><div className="grid gap-2 sm:grid-cols-2">{(["skip", "replace"] as const).map((value) => <button key={value} type="button" aria-pressed={strategy === value} onClick={() => setStrategy(value)} className={cn("rounded-xl border p-3 text-start text-[11px]", strategy === value ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--dashboard-border)] bg-[var(--surface-1)]")}><strong className="block text-[var(--text)]">{value === "skip" ? s("Keep current data") : s("Replace conflicting items")}</strong><span className="mt-1 block text-[var(--text-muted)]">{value === "skip" ? s("Conflicts are skipped and only new items are imported.") : s("A safety backup of the current state is downloaded before applying.")}</span></button>)}</div></div>}<div className="flex flex-wrap items-center gap-2"><Button type="button" data-import-apply disabled={busy || !preview || preview.readyCount + (strategy === "replace" ? preview.conflictCount : 0) === 0} onClick={() => { void apply(); }}>{s("Apply import")}</Button><Button type="button" variant="ghost" disabled={busy} onClick={() => reset(kind)}>{s("Start over")}</Button><span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]"><ShieldCheck className="size-3.5 text-[var(--success)]" /> {s("Invalid rows are never applied.")}</span></div></div>}
      </div>
    </section>
  );
}
