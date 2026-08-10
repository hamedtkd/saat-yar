"use client";

import { Coffee, Pause, Play, Square } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import type { TodayTimeStripProps } from "./types";

export function QuickControls(props: Pick<TodayTimeStripProps, "record" | "lunchRunning" | "startLunch" | "finishLunch" | "activeBreak" | "todayCalc" | "startBreak" | "finishBreak">) {
  const { duration, number, t } = useLocaleUi();
  return <>
    <div className="grid min-h-[122px] content-between gap-3 rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3.5">
      <div className="flex items-center justify-between gap-3"><strong className="text-sm font-black text-[var(--text)]">{t("common.lunch")}</strong><span className="grid size-9 place-items-center rounded-xl bg-[var(--warning-soft)] text-[var(--warning)]"><Coffee className="size-4" /></span></div>
      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[11px]"><span className="text-[var(--text-muted)]">{t("today.quick.recordedDuration")}</span><strong>{t("today.quick.minutes", { count: number(props.record.lunchMinutes) })}</strong></div>
      <Button type="button" variant={props.lunchRunning ? "secondary" : "outline"} size="sm" onClick={props.lunchRunning ? props.finishLunch : props.startLunch} className="w-full border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] text-[var(--warning)]">{props.lunchRunning ? <><Square className="size-4" />{t("today.quick.finishLunch")}</> : <><Play className="size-4" />{t("today.quick.startLunch")}</>}</Button>
    </div>
    <div className="grid min-h-[122px] content-between gap-3 rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3.5">
      <div className="flex items-center justify-between gap-3"><strong className="text-sm font-black text-[var(--text)]">{t("common.break")}</strong><span className="grid size-9 place-items-center rounded-xl bg-[var(--info-soft)] text-[var(--info)]"><Pause className="size-4" /></span></div>
      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[11px]"><span className="text-[var(--text-muted)]">{t("today.quick.todayBreaks")}</span><strong>{duration(props.todayCalc.breakMinutes)}</strong></div>
      {!props.activeBreak ? <Button type="button" variant="outline" size="sm" onClick={props.startBreak} className="w-full border-[color-mix(in_srgb,var(--info)_30%,var(--border))] text-[var(--info)]"><Play className="size-4" />{t("today.quick.registerBreak")}</Button> : <div className="flex items-center gap-1.5">{[15,30,40].map((value) => <Button type="button" variant="outline" size="sm" key={value} onClick={() => props.finishBreak(value)} className="min-w-0 flex-1 px-1.5">{number(value)}</Button>)}<Button type="button" size="icon" onClick={() => props.finishBreak()} aria-label={t("today.quick.finishBreak")} className="size-9"><Square className="size-4" /></Button></div>}
    </div>
  </>;
}
