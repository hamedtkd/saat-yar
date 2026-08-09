import { CheckCircle2, Pencil, RotateCcw, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const mobileDockClass =
  "fixed bottom-[calc(82px+env(safe-area-inset-bottom))] left-1/2 z-40 mb-0 w-[calc(100%-16px)] max-w-[520px] -translate-x-1/2 xl:sticky xl:bottom-auto xl:left-auto xl:top-[78px] xl:mb-4 xl:w-auto xl:max-w-none xl:translate-x-0";

export function CompletedDayEditActionBar({
  dirty,
  changeCount,
  onCancel,
  onReset,
  onSave,
}: {
  dirty: boolean;
  changeCount: number;
  onCancel: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div
      data-completed-edit-actions
      data-dirty={dirty ? "true" : "false"}
      role="region"
      aria-label="کنترل‌های ویرایش روز"
      className={`${mobileDockClass} grid gap-3 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--accent)_38%,var(--border))] bg-[var(--surface-glass)] px-3.5 py-3 shadow-[0_12px_32px_rgba(0,0,0,.12)] backdrop-blur-2xl sm:flex sm:items-center sm:justify-between sm:px-4 print:hidden`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <Pencil aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-xs font-black text-[var(--text)]">در حال ویرایش این روز</strong>
            <span
              aria-live="polite"
              className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${
                dirty
                  ? "border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] text-[var(--warning)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"
              }`}
            >
              {dirty ? `${changeCount} تغییر ذخیره‌نشده` : "هنوز تغییری ندادی"}
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
            {dirty
              ? "تغییرها فعلاً فقط در پیش‌نویس هستند؛ همین‌جا ذخیره یا لغوشان کن."
              : "فیلدهای پایین فعال‌اند؛ بعد از اولین تغییر دکمه ذخیره فعال می‌شود."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-1.5 sm:flex sm:shrink-0 sm:items-center sm:gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          <X /> انصراف
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!dirty} onClick={onReset}>
          <RotateCcw /> بازنشانی
        </Button>
        <Button type="button" size="sm" className="min-w-0" disabled={!dirty} onClick={onSave}>
          <Save /> ذخیره تغییرات
        </Button>
      </div>
    </div>
  );
}

export function CompletedDayEditSavedNotice() {
  return (
    <div
      data-completed-edit-feedback
      role="status"
      aria-live="polite"
      className={`${mobileDockClass} flex items-center gap-3 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--success)_32%,var(--border))] bg-[var(--surface-glass)] px-4 py-3 text-[var(--success)] shadow-[0_10px_28px_rgba(0,0,0,.1)] backdrop-blur-2xl print:hidden`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--success-soft)]">
        <CheckCircle2 aria-hidden="true" className="size-5" />
      </span>
      <div className="grid gap-0.5">
        <strong className="text-xs font-black">تغییرات این روز ذخیره شد</strong>
        <span className="text-[10px] leading-5 text-[var(--text-muted)]">نسخه اصلی رکورد به‌روزرسانی شد و حالت ویرایش بسته شد.</span>
      </div>
    </div>
  );
}
