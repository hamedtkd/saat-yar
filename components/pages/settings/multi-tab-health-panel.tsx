import { Clock3, MonitorSmartphone, RefreshCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/common/status-badge";
import { formatSyncTime, shortTabId, type MultiTabSyncStatus } from "@/lib/multi-tab-sync-status";

export function MultiTabHealthPanel({ status }: { status: MultiTabSyncStatus }) {
  const tone = !status.supported ? "neutral" : status.pending ? "warning" : "success";
  const label = !status.supported ? "غیرفعال" : status.pending ? "نیازمند تصمیم" : "هماهنگ";

  return (
    <div className="grid gap-3 border-t border-[var(--border)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <MonitorSmartphone className="mt-0.5 size-4 text-[var(--accent-strong)]" aria-hidden="true" />
          <div className="grid gap-1">
            <strong className="text-xs text-[var(--text)]">سلامت همگام‌سازی چند تب</strong>
            <span className="text-[10px] leading-5 text-[var(--text-muted)]">
              آخرین تغییر خارجی و وضعیت تعارض با ویرایش محلی را نشان می‌دهد.
            </span>
          </div>
        </div>
        <StatusBadge tone={tone}>{label}</StatusBadge>
      </div>

      {!status.supported ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[10px] leading-5 text-[var(--text-muted)]">
          مرورگر فعلی از BroadcastChannel پشتیبانی نمی‌کند؛ ذخیره محلی فعال است اما همگام‌سازی زنده بین تب‌ها انجام نمی‌شود.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-[720px]:grid-cols-1">
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
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <span className="text-[var(--accent-strong)] [&_svg]:size-4">{icon}</span>
      <span className="grid min-w-0 gap-1">
        <small className="text-[9px] text-[var(--text-muted)]">{label}</small>
        <strong className="truncate text-[10px] text-[var(--text)]">{value}</strong>
      </span>
    </div>
  );
}
