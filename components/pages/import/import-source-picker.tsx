import { DatabaseBackup, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/cn";

export type ImportSource = "backup" | "csv";

export function ImportSourcePicker({ value, onChange }: { value: ImportSource; onChange: (value: ImportSource) => void }) {
  const options = [
    { value: "backup" as const, title: "پشتیبان ساعت‌یار", description: "بازیابی JSON نسخه‌بندی‌شده با Preview قبل از اعمال", icon: DatabaseBackup },
    { value: "csv" as const, title: "CSV / Excel", description: "ورود روزهای کاری، مشتری‌ها، پروژه‌ها و هزینه‌ها", icon: FileSpreadsheet },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="نوع واردسازی">
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-import-source={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "grid min-h-[126px] grid-cols-[auto_1fr] gap-3 rounded-[var(--card-radius)] border p-4 text-start transition-colors",
              active ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--dashboard-border)] bg-[var(--surface-1)] hover:border-[var(--accent)]",
            )}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--accent-strong)]"><Icon /></span>
            <span className="min-w-0"><strong className="block text-sm text-[var(--text)]">{option.title}</strong><span className="mt-1 block text-[11px] leading-5 text-[var(--text-muted)]">{option.description}</span></span>
          </button>
        );
      })}
    </div>
  );
}
