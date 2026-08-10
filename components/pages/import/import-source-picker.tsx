import { DatabaseBackup, FileSpreadsheet } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { cn } from "@/lib/cn";
export type ImportSource = "backup" | "csv";
export function ImportSourcePicker({ value, onChange }: { value: ImportSource; onChange: (value: ImportSource) => void }) {
  const { s } = useSystemUi();
  const options = [
    { value: "backup" as const, title: s("Saatyar backup"), description: s("Restore a versioned JSON backup with a preview before applying it"), icon: DatabaseBackup },
    { value: "csv" as const, title: s("CSV / Excel"), description: s("Import workdays, clients, projects, and expenses"), icon: FileSpreadsheet },
  ];
  return <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={s("Import type")}>{options.map((option) => { const Icon = option.icon; const active = value === option.value; return <button key={option.value} type="button" role="radio" aria-checked={active} data-import-source={option.value} onClick={() => onChange(option.value)} className={cn("grid min-h-[126px] grid-cols-[auto_1fr] gap-3 rounded-[var(--card-radius)] border p-4 text-start transition-colors", active ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--dashboard-border)] bg-[var(--surface-1)] hover:border-[var(--accent)]")}><span className="grid size-10 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--accent-strong)]"><Icon /></span><span className="min-w-0"><strong className="block text-sm text-[var(--text)]">{option.title}</strong><span className="mt-1 block text-[11px] leading-5 text-[var(--text-muted)]">{option.description}</span></span></button>; })}</div>;
}
