"use client";

import { RotateCcw, X } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";

export function RecordResetUndo({ date, onUndo, onDismiss }: { date?: string; onUndo: () => void; onDismiss: () => void }) {
  const { date: formatDate, t } = useLocaleUi();
  if (!date) return null;
  return (
    <section role="status" aria-live="polite" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--info)_28%,var(--border))] bg-[var(--info-soft)] px-4 py-3 text-[var(--text)]">
      <div className="grid gap-0.5">
        <strong className="text-xs font-extrabold">{t("today.undo.title", { date: formatDate(date, { day: "numeric", month: "long" }) })}</strong>
        <span className="text-[10px] leading-5 text-[var(--text-muted)]">{t("today.undo.description")}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={onUndo}><RotateCcw className="size-4" /> {t("today.undo.restore")}</Button>
        <Button type="button" size="icon" variant="ghost" aria-label={t("today.undo.dismiss")} onClick={onDismiss}><X className="size-4" /></Button>
      </div>
    </section>
  );
}
