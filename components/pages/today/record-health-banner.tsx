import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getRecordStatus } from "@/lib/record-health";
import type { WorkRecord } from "@/lib/types";

export function RecordHealthBanner({ record, onReset }: { record: WorkRecord; onReset: () => void }) {
  const status = getRecordStatus(record);
  const autoClosed = record.needsReview && record.autoClosedAt;
  if (status.state === "empty") return null;

  const healthy = status.state === "complete";
  return (
    <section className={cn(
      "mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-3",
      healthy ? "border-[color-mix(in_srgb,var(--success)_28%,var(--border))] bg-[var(--success-soft)] text-[var(--success)]" : "border-[color-mix(in_srgb,var(--warning)_28%,var(--border))] bg-[var(--warning-soft)] text-[var(--warning)]",
    )}>
      {autoClosed && <div className="basis-full rounded-lg border border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">خروج این روز هنگام بستن صفحه خودکار ثبت شده است؛ زمان را بررسی و در صورت نیاز اصلاح کن.</div>}
      <div className="flex min-w-0 items-start gap-3">
        {healthy ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <AlertTriangle className="mt-0.5 size-5 shrink-0" />}
        <div>
          <strong className="text-xs font-extrabold">وضعیت رکورد: {status.label}</strong>
          {status.issues.length > 0 ? (
            <ul className="mt-1 grid gap-1 text-[10px] leading-5">
              {status.issues.map((issue, index) => <li key={`${issue.code}-${index}`}>• {issue.message}</li>)}
            </ul>
          ) : (
            <p className="mt-1 text-[10px]">ورود، خروج و بازه‌های استراحت معتبر هستند.</p>
          )}
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onReset} className="rounded-xl bg-[var(--surface-1)]">
        <RotateCcw className="size-4" /> پاک‌کردن رکورد روز
      </Button>
    </section>
  );
}
