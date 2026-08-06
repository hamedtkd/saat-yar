import { Clock3, History, MonitorSmartphone, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { formatSyncTime, shortTabId, type MultiTabSyncStatus } from "@/lib/multi-tab-sync-status";

export function MultiTabHealthPanel({ status, onClear }: { status: MultiTabSyncStatus; onClear: () => void }) {
  return (
    <div className="grid gap-3 border-t border-[var(--border)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="size-4 text-[var(--accent-strong)]" aria-hidden="true" />
          <strong className="text-xs text-[var(--text)]">سلامت همگام‌سازی چند تب</strong>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge tone={!status.supported ? "neutral" : status.pending ? "warning" : "success"}>
            {!status.supported ? "غیرفعال" : status.pending ? "نیازمند تصمیم" : "هماهنگ"}
          </StatusBadge>
          {status.events.length > 0 && (
            <Button type="button" variant="ghost" onClick={onClear} aria-label="پاک‌کردن تاریخچه همگام‌سازی">
              <Trash2 /> پاک‌کردن
            </Button>
          )}
        </div>
      </div>

      {!status.supported ? (
        <p className="text-[10px] leading-5 text-[var(--text-muted)]">مرورگر فعلی از BroadcastChannel پشتیبانی نمی‌کند.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-[700px]:grid-cols-1">
          <Metric icon={<MonitorSmartphone />} label="تب فعلی" value={shortTabId(status.currentTabId)} />
          <Metric icon={<RefreshCw />} label="آخرین تب فرستنده" value={shortTabId(status.sourceTabId)} />
          <Metric icon={<Clock3 />} label="آخرین ذخیره خارجی" value={formatSyncTime(status.savedAt)} />
        </div>
      )}

      {status.pending && (
        <div className="flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] p-3 text-[10px] leading-5 text-[var(--warning)]">
          <TriangleAlert className="mt-0.5 size-4 flex-none" aria-hidden="true" />
          نسخه جدیدی از تب دیگر رسیده، اما به‌دلیل تغییرات ذخیره‌نشده یا ذخیره فعال هنوز بارگذاری نشده است.
        </div>
      )}

      {status.events.length > 0 && (
        <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text)]"><History className="size-4" /> رخدادهای اخیر</div>
          {status.events.map((event) => (
            <div key={`${event.receivedAt}-${event.sourceTabId}`} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-2 text-[10px]">
              <span className="text-[var(--text-muted)]">تب {shortTabId(event.sourceTabId)} · {formatSyncTime(event.savedAt)}</span>
              <StatusBadge tone={event.kind === "deferred" ? "warning" : "success"}>{event.kind === "deferred" ? "به‌تعویق‌افتاده" : "بارگذاری‌شده"}</StatusBadge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><span className="text-[var(--accent-strong)] [&_svg]:size-4">{icon}</span><span className="grid min-w-0 gap-1"><small className="text-[9px] text-[var(--text-muted)]">{label}</small><strong className="truncate text-[10px] text-[var(--text)]">{value}</strong></span></div>;
}
