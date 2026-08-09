"use client";

import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MultiTabSyncBanner({ pending, onReload, onDismiss }: {
  pending: boolean;
  onReload: () => void;
  onDismiss: () => void;
}) {
  if (!pending) return null;
  return (
    <section className="shell-main-offset mx-auto mb-4 flex max-w-[var(--shell-content-max)] flex-wrap items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--warning)_32%,var(--border))] bg-[var(--warning-soft)] px-4 py-3 text-[var(--text)]" role="status" aria-live="polite">
      <div className="grid gap-1">
        <strong className="text-sm">اطلاعات در تب دیگری تغییر کرده است</strong>
        <span className="text-xs text-[var(--text-muted)]">برای جلوگیری از بازنویسی تغییرات، نسخه جدید را پس از ذخیره یا کنارگذاشتن ویرایش‌های فعلی بارگذاری کن.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onReload}><RefreshCw /> بارگذاری نسخه جدید</Button>
        <Button size="icon" variant="ghost" aria-label="بستن پیام همگام‌سازی" onClick={onDismiss}><X /></Button>
      </div>
    </section>
  );
}
