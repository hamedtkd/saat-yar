import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceTransferHistoryEntry } from "@/lib/device-transfer-history";

function formatHistoryTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "زمان نامشخص";
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function describeEntry(entry: DeviceTransferHistoryEntry) {
  if (entry.direction === "sent") return "دریافت بسته توسط دستگاه مقابل تأیید شد";
  const mode = entry.mode === "replace" ? "جایگزینی کامل" : "ادغام";
  return `${mode} · ${entry.additions ?? 0} داده جدید · ${entry.conflicts ?? 0} تعارض`;
}

export function DeviceTransferHistory({ entries, onClear }: {
  entries: DeviceTransferHistoryEntry[];
  onClear: () => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4" data-device-transfer-history>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-[var(--accent-strong)]" />
          <strong className="text-xs">آخرین انتقال‌ها</strong>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onClear}><Trash2 /> پاک‌کردن تاریخچه</Button>
      </div>
      <div className="grid gap-2">
        {entries.slice(0, 3).map((entry) => {
          const Icon = entry.direction === "sent" ? ArrowUpFromLine : ArrowDownToLine;
          return (
            <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5">
              <span className="mt-0.5 rounded-lg bg-[var(--accent-soft)] p-1.5 text-[var(--accent-strong)]"><Icon className="size-3.5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-[10px]">{entry.direction === "sent" ? "ارسال به" : "دریافت از"} {entry.deviceName}</strong>
                  <span className="text-[9px] text-[var(--text-muted)]">{formatHistoryTime(entry.at)}</span>
                </div>
                <p className="mt-1 text-[9px] leading-5 text-[var(--text-muted)]"><CheckCircle2 className="ml-1 inline size-3 text-[var(--accent-strong)]" />{describeEntry(entry)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[9px] leading-5 text-[var(--text-muted)]">این تاریخچه فقط متادیتای انتقال را روی همین دستگاه نگه می‌دارد؛ محتوای داده یا کلید Session در آن ذخیره نمی‌شود.</p>
    </div>
  );
}
