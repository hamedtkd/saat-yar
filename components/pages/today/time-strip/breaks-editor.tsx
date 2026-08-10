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
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm font-extrabold text-[var(--text)]">{t("today.breaks.title")}</strong><p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">{t("today.breaks.description")}</p></div><Button type="button" variant="outline" size="sm" onClick={addBreak} className="rounded-xl"><Plus className="size-4" />{t("today.breaks.add")}</Button></div>
    <div className="grid gap-3">
      {record.breaks.length === 0 && <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] p-5 text-center text-[11px] text-[var(--text-muted)]">{t("today.breaks.empty")}</div>}
      {record.breaks.map((item, index) => <div key={item.id} className="grid grid-cols-1 items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
        <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("today.breaks.itemTitle")}</span><Input value={item.title} onChange={(event) => updateBreak(item.id, { title: event.target.value })} placeholder={t("today.breaks.placeholder", { count: number(index + 1) })} className="h-11 rounded-xl shadow-none" /></label>
        <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("common.start")}</span><TimePicker value={item.start} onChange={(start) => updateBreak(item.id, { start })} /></label>
        <label className="grid min-w-0 gap-2"><span className="text-[11px] font-bold text-[var(--text-muted)]">{t("common.end")}</span><TimePicker value={item.end} onChange={(end) => updateBreak(item.id, { end })} /></label>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[11px] font-semibold text-[var(--text-muted)]">
          <Checkbox checked={Boolean(item.paid)} onCheckedChange={(paid) => updateBreak(item.id, { paid })} aria-label={t("today.breaks.paidAria", { count: number(index + 1) })} />
          <span>{t("common.paid")}</span>
        </label>
        <Button type="button" variant="destructive" size="icon" onClick={() => removeBreak(item.id)} aria-label={t("today.breaks.removeAria", { count: number(index + 1) })} className="size-11 rounded-xl md:justify-self-end"><Trash2 className="size-4" /></Button>
      </div>)}
    </div>
  </section>;
}
