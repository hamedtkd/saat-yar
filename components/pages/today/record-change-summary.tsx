import { ArrowLeft } from "lucide-react";
import type { WorkRecordChange } from "@/lib/work-record-diff";

export function RecordChangeSummary({ changes }: { changes: WorkRecordChange[] }) {
  if (changes.length === 0) {
    return <p className="text-[10px] text-[var(--text-muted)]">هنوز تغییری برای ذخیره ایجاد نشده است.</p>;
  }

  return (
    <div className="grid gap-2" aria-live="polite">
      <strong className="text-xs text-[var(--text)]">خلاصه تغییرات</strong>
      <div className="grid gap-2 sm:grid-cols-2">
        {changes.map((change) => (
          <div key={change.key} className="grid gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)]">{change.label}</span>
            <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[var(--text)]">
              <del className="min-w-0 truncate text-[var(--danger)]">{change.before}</del>
              <ArrowLeft className="size-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <ins className="min-w-0 truncate text-[var(--success)] no-underline">{change.after}</ins>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
