import type { ReactNode } from "react";

export function ChartEmptyState({ icon, title, description, compact = false }: {
  icon: ReactNode;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={`grid place-items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center ${compact ? "min-h-[220px]" : "min-h-[300px]"}`}>
      <div className="max-w-xs">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">{icon}</span>
        <strong className="mt-3 block text-sm font-extrabold text-[var(--text)]">{title}</strong>
        <p className="mt-1 text-[10px] leading-6 text-[var(--text-muted)]">{description}</p>
      </div>
    </div>
  );
}
