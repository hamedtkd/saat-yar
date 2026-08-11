"use client";

import { AlertTriangle, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/cn";
import { getRecordStatus } from "@/lib/record-health";
import type { MessageKey } from "@/lib/i18n";
import type { WorkRecord } from "@/lib/types";

const stateKeys = {
  empty: "today.health.state.empty",
  invalid: "today.health.state.invalid",
  incomplete: "today.health.state.incomplete",
  complete: "today.health.state.complete",
} satisfies Record<ReturnType<typeof getRecordStatus>["state"], MessageKey>;

const issueKeys: Record<string, MessageKey> = {
  "missing-start": "today.health.issue.missing-start",
  "missing-end": "today.health.issue.missing-end",
  "partial-lunch": "today.health.issue.partial-lunch",
  "open-break": "today.health.issue.open-break",
  "invalid-lunch": "today.health.issue.invalid-lunch",
  "invalid-break": "today.health.issue.invalid-break",
  "leave-without-type": "today.health.issue.leave-without-type",
};

export function RecordHealthBanner({ record, onReset }: { record: WorkRecord; onReset: () => void }) {
  const { t } = useLocaleUi();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const status = getRecordStatus(record);
  if (status.state === "empty" || (record.needsReview && record.autoClosedAt)) return null;

  const healthy = status.state === "complete";
  const confirmReset = () => {
    onReset();
    setConfirmOpen(false);
  };

  return (
    <>
      <section className={cn(
        "mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-3",
        healthy ? "border-[color-mix(in_srgb,var(--success)_28%,var(--border))] bg-[var(--success-soft)] text-[var(--success)]" : "border-[color-mix(in_srgb,var(--warning)_28%,var(--border))] bg-[var(--warning-soft)] text-[var(--warning)]",
      )}>
        <div className="flex min-w-0 items-start gap-3">
          {healthy ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <AlertTriangle className="mt-0.5 size-5 shrink-0" />}
          <div>
            <strong className="text-xs font-extrabold">{t("today.health.status", { status: t(stateKeys[status.state]) })}</strong>
            {status.issues.length > 0 ? (
              <ul className="mt-1 grid gap-1 text-[10px] leading-5">
                {status.issues.map((issue, index) => (
                  <li key={`${issue.code}-${index}`}>• {issueKeys[issue.code] ? t(issueKeys[issue.code]) : issue.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[10px]">{t("today.health.valid")}</p>
            )}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setConfirmOpen(true)} className="rounded-xl bg-[var(--surface-1)]">
          <RotateCcw className="size-4" /> {t("today.health.reset")}
        </Button>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("today.health.dialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("today.health.dialogDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-start gap-3 rounded-[var(--control-radius)] border border-[color-mix(in_srgb,var(--danger)_25%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface-1))] px-3 py-3 text-xs leading-6 text-[var(--danger)]">
            <Trash2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t("today.health.dialogHint")}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[var(--danger)] text-white hover:opacity-90" onClick={confirmReset}>{t("today.health.confirm")}</AlertDialogAction>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
