"use client";

import { Clock3, LogIn, LogOut } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import type { TodayTimeStripViewProps } from "./types";

function TimeBlock({ icon, title, meta, picker, action }: { icon: React.ReactNode; title: string; meta: string; picker: React.ReactNode; action: React.ReactNode }) {
  return <div className="grid min-w-0 gap-3 rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3.5">
    <div className="flex items-center justify-between gap-3"><strong className="inline-flex items-center gap-2 text-sm font-black text-[var(--text)]"><span className="grid size-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)] [&_svg]:size-4">{icon}</span>{title}</strong><span className="text-[9px] font-semibold text-[var(--text-muted)]">{meta}</span></div>
    {picker}
    {action}
  </div>;
}

export function TimeInputs({ data, record, suggestedExit, scheduledDayOff, startWork, finishWork, updateRecord }: Pick<TodayTimeStripViewProps, "data" | "record" | "suggestedExit" | "scheduledDayOff" | "startWork" | "finishWork" | "updateRecord">) {
  const { t } = useLocaleUi();
  return <div className="grid grid-cols-2 gap-3 md:col-span-2 xl:col-span-2 max-[700px]:grid-cols-1">
    <TimeBlock
      icon={<LogIn />}
      title={t("common.clockIn")}
      meta={record.start ? record.start : "—"}
      picker={<TimePicker value={record.start} onChange={(start) => updateRecord({ start, startedAt: undefined })} suggestions={[{ label: t("today.time.normalStart"), value: data.settings.defaultStart }]} />}
      action={<Button type="button" size="sm" className="w-full" onClick={startWork} disabled={Boolean(record.start)}>{scheduledDayOff ? t("today.time.exceptionStart") : t("today.time.registerStart")}</Button>}
    />
    <TimeBlock
      icon={record.end ? <Clock3 /> : <LogOut />}
      title={t("common.clockOut")}
      meta={record.end ? record.end : "—"}
      picker={<TimePicker value={record.end} onChange={(end) => updateRecord({ end, endedAt: undefined })} suggestions={scheduledDayOff ? [] : [{ label: t("today.time.suggested"), value: suggestedExit }, { label: t("today.time.normalEnd"), value: data.settings.defaultEnd }]} />}
      action={<Button type="button" size="sm" variant="destructive" className="w-full" onClick={finishWork} disabled={!record.start || Boolean(record.end)}>{t("today.time.registerEnd")}</Button>}
    />
  </div>;
}
