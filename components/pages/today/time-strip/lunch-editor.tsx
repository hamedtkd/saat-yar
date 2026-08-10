"use client";

import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { WorkRecord } from "@/lib/types";
import type { TodayTimeStripProps } from "./types";

export function LunchEditor({ record, updateRecord, updateLunch }: Pick<TodayTimeStripProps, "record" | "updateRecord"> & { updateLunch: (patch: Partial<WorkRecord>) => void }) {
  const { t } = useLocaleUi();
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><strong className="text-sm font-extrabold text-[var(--text)]">{t("common.lunch")}</strong><p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">{t("today.lunch.description")}</p></div>
      <label className="flex! cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)]"><Checkbox checked={Boolean(record.lunchPaid)} onCheckedChange={(lunchPaid) => updateRecord({ lunchPaid })} /><span>{t("today.lunch.countsAsWork")}</span></label>
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("common.start")}</span><TimePicker key={`lunch-start-${record.lunchStart ?? "empty"}`} value={record.lunchStart ?? ""} onChange={(lunchStart) => updateLunch({ lunchStart, lunchStartedAt: undefined })} /></label>
      <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("common.end")}</span><TimePicker key={`lunch-end-${record.lunchEnd ?? "empty"}`} value={record.lunchEnd ?? ""} onChange={(lunchEnd) => updateLunch({ lunchEnd, lunchEndedAt: undefined })} /></label>
      <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("common.duration")}</span><MinuteDurationField value={record.lunchMinutes} onValueChange={(lunchMinutes) => updateLunch({ lunchMinutes })} max={360} /></label>
    </div>
    {(record.lunchStart || record.lunchEnd) && <Button type="button" className="mt-3 rounded-xl" variant="ghost" size="sm" onClick={() => updateRecord({ lunchStart: undefined, lunchEnd: undefined, lunchStartedAt: undefined, lunchEndedAt: undefined })}>{t("today.lunch.clear")}</Button>}
  </section>;
}
