"use client";

import { RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jalali } from "@/lib/format";

export function RecordResetUndo({ date, onUndo, onDismiss }: { date?: string; onUndo: () => void; onDismiss: () => void }) {
  if (!date) return null;

  return (
    <section role="status" aria-live="polite" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--info)_28%,var(--border))] bg-[var(--info-soft)] px-4 py-3 text-[var(--text)]">
      <div className="grid gap-0.5">
        <strong className="text-xs font-extrabold">رکورد {jalali(date, { day: "numeric", month: "long" })} پاک شد</strong>
        <span className="text-[10px] leading-5 text-[var(--text-muted)]">تا چند ثانیه می‌توانی تمام اطلاعات حذف‌شده را برگردانی.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={onUndo}><RotateCcw className="size-4" /> بازگردانی رکورد</Button>
        <Button type="button" size="icon" variant="ghost" aria-label="بستن پیام بازگردانی" onClick={onDismiss}><X className="size-4" /></Button>
      </div>
    </section>
  );
}
