import { StatusBadge } from "@/components/common/status-badge";
import { fa } from "@/lib/format";

export function ImportPreviewStats({ ready, conflicts, invalid }: { ready: number; conflicts: number; invalid: number }) {
  return (
    <div className="flex flex-wrap gap-2" data-import-preview>
      <StatusBadge tone="success">{fa.format(ready)} آماده ورود</StatusBadge>
      <StatusBadge tone={conflicts ? "warning" : "neutral"}>{fa.format(conflicts)} تعارض</StatusBadge>
      <StatusBadge tone={invalid ? "danger" : "neutral"}>{fa.format(invalid)} ردیف نامعتبر</StatusBadge>
    </div>
  );
}
