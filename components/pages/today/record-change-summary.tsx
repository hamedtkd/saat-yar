"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import type { MessageKey } from "@/lib/i18n/catalog";
import type { WorkRecordChange, WorkRecordChangeValue } from "@/lib/work-record-diff";

const fieldKeys: Record<WorkRecordChange["key"], MessageKey> = {
  start: "today.edit.field.start",
  end: "today.edit.field.end",
  lunchStart: "today.edit.field.lunchStart",
  lunchEnd: "today.edit.field.lunchEnd",
  lunchMinutes: "today.edit.field.lunchMinutes",
  lunchPaid: "today.edit.field.lunchPaid",
  note: "today.edit.field.note",
  breaks: "today.edit.field.breaks",
};

export function RecordChangeSummary({ changes }: { changes: WorkRecordChange[] }) {
  const { locale, t, digits, number } = useLocaleUi();

  const formatValue = (change: WorkRecordChange, value: WorkRecordChangeValue) => {
    if (change.key === "lunchPaid") return value ? t("common.yes") : t("common.no");
    if (change.key === "lunchMinutes") return t("today.quick.minutes", { count: number(Number(value ?? 0)) });
    if (change.key === "breaks") return number(Number(value ?? 0));
    if (value === undefined || value === "") return "—";
    if (change.key === "note") return String(value);
    return digits(String(value));
  };

  if (!changes.length) {
    return <p className="text-[10px] text-[var(--text-muted)]">{t("today.edit.noChangesToSave")}</p>;
  }

  const DirectionIcon = locale === "fa-IR" ? ArrowLeft : ArrowRight;

  return (
    <div className="grid gap-2" aria-live="polite">
      <strong className="text-xs text-[var(--text)]">{t("today.edit.changeSummary")}</strong>
      <div className="grid gap-2 sm:grid-cols-2">
        {changes.map((change) => (
          <div key={change.key} className="grid gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)]">{t(fieldKeys[change.key])}</span>
            <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[var(--text)]">
              <del className="min-w-0 truncate text-[var(--danger)]">{formatValue(change, change.beforeValue)}</del>
              <DirectionIcon className="size-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <ins className="min-w-0 truncate text-[var(--success)] no-underline">{formatValue(change, change.afterValue)}</ins>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
