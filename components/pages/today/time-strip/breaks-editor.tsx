"use client";

import { Plus, Trash2 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { BreakItem } from "@/lib/types";
import type { TodayTimeStripProps } from "./types";

export function BreaksEditor({ record, addBreak, updateBreak, removeBreak }: Pick<TodayTimeStripProps, "record"> & { addBreak: () => void; updateBreak: (id: string, patch: Partial<BreakItem>) => void; removeBreak: (id: string) => void; }) {
  const { number, t } = useLocaleUi();

  return <section data-breaks-editor className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm font-extrabold text-[var(--text)]">{t("today.breaks.title")}</strong><p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">{t("today.breaks.description")}</p></div><Button type="button" variant="outline" size="sm" onClick={addBreak} className="rounded-xl"><Plus className="size-4" />{t("today.breaks.add")}</Button></div>
    <div className="grid gap-3">
      {record.breaks.length === 0 && <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] p-5 text-center text-[11px] text-[var(--text-muted)]">{t("today.breaks.empty")}</div>}
      {record.breaks.map((item, index) => <div key={item.id} data-break-row data-break-id={item.id} className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,.95fr)_minmax(0,.95fr)_minmax(120px,.5fr)_auto] xl:items-end">
        <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("today.breaks.itemTitle")}</span><Input value={item.title} onChange={(event) => updateBreak(item.id, { title: event.target.value })} placeholder={t("today.breaks.placeholder", { count: number(index + 1) })} className="h-11 rounded-xl shadow-none" /></label>
        <label data-break-field="start" className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("common.start")}</span><TimePicker value={item.start} onChange={(start) => updateBreak(item.id, { start })} /></label>
        <label data-break-field="end" className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("common.end")}</span><TimePicker value={item.end} onChange={(end) => updateBreak(item.id, { end })} /></label>
        <label data-break-field="paid" className="flex h-11 min-w-0 cursor-pointer items-center justify-center gap-2 self-end rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[11px] font-semibold text-[var(--text-muted)] xl:min-w-[128px]">
          <Checkbox data-break-paid-toggle checked={Boolean(item.paid)} onCheckedChange={(paid) => updateBreak(item.id, { paid })} aria-label={t("today.breaks.paidAria", { count: number(index + 1) })} />
          <span>{t("common.paid")}</span>
        </label>
        <Button type="button" variant="destructive" size="icon" onClick={() => removeBreak(item.id)} aria-label={t("today.breaks.removeAria", { count: number(index + 1) })} className="size-11 rounded-xl xl:self-end xl:justify-self-end"><Trash2 className="size-4" /></Button>
      </div>)}
    </div>
  </section>;
}
