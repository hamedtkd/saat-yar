import { AlertTriangle, ArrowDownToLine, GitMerge, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceTransferConflictResolution, DeviceTransferPreview } from "@/lib/device-transfer-types";

const labels: Record<string, string> = {
  records: "روزهای کاری",
  leaves: "مرخصی‌ها",
  clients: "مشتری‌ها",
  projects: "پروژه‌ها",
  timeEntries: "ثبت زمان‌ها",
  expenses: "هزینه‌ها",
  invoices: "فاکتورها",
  holidayOverrides: "تعطیلات دستی",
  deletedRecords: "سطل بازیابی",
};

export function DeviceTransferPreviewPanel({ preview, sourceName, onApply, onCancel }: {
  preview: DeviceTransferPreview;
  sourceName: string;
  onApply: (mode: "merge" | "replace", conflicts: DeviceTransferConflictResolution) => void;
  onCancel: () => void;
}) {
  const additions = Object.values(preview.collections).reduce((sum, item) => sum + item.additions, 0);
  return (
    <div className="mt-4 rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-4">
      <div className="mb-3 flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 flex-none text-[var(--accent-strong)]" />
        <div>
          <strong className="block text-sm">انتقال از {sourceName} آماده بررسی است</strong>
          <p className="mt-1 text-[10px] leading-6 text-[var(--text-muted)]">Checksum و رمزگشایی تأیید شده‌اند. قبل از ذخیره، روش ادغام را انتخاب کن.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 max-[520px]:grid-cols-1">
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center"><b>{additions}</b><span className="block text-[10px] text-[var(--text-muted)]">داده جدید</span></div>
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center"><b>{preview.conflictCount}</b><span className="block text-[10px] text-[var(--text-muted)]">تعارض</span></div>
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center"><b>{preview.settingsChanged ? "تغییر" : "یکسان"}</b><span className="block text-[10px] text-[var(--text-muted)]">تنظیمات</span></div>
      </div>
      <div className="mt-3 grid gap-1 text-[10px] text-[var(--text-muted)]">
        {Object.entries(preview.collections).filter(([, item]) => item.additions || item.conflicts).map(([key, item]) => (
          <div key={key} className="flex justify-between rounded-lg bg-[var(--surface-1)] px-3 py-2">
            <span>{labels[key] ?? key}</span><span>+{item.additions} جدید · {item.conflicts} تعارض</span>
          </div>
        ))}
      </div>
      {preview.conflictCount > 0 && <p className="mt-3 flex items-start gap-2 text-[10px] leading-6 text-[var(--warning)]"><AlertTriangle className="mt-0.5 size-4 flex-none" />در ادغام امن، تعارض‌ها روی همین دستگاه حفظ می‌شوند. گزینه «ورودی اولویت دارد» فقط وقتی استفاده کن که دستگاه مقابل مرجع اصلی است.</p>}
      <div className="mt-4 grid grid-cols-3 gap-2 max-[700px]:grid-cols-1">
        <Button size="sm" onClick={() => onApply("merge", "keep-local")}><GitMerge /> ادغام امن</Button>
        <Button size="sm" variant="secondary" onClick={() => onApply("merge", "use-incoming")}><ArrowDownToLine /> ورودی اولویت دارد</Button>
        <Button size="sm" variant="destructive" onClick={() => onApply("replace", "use-incoming")}><AlertTriangle /> جایگزینی کامل</Button>
      </div>
      <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={onCancel}><XCircle /> رد انتقال و پایان نشست</Button>
    </div>
  );
}
