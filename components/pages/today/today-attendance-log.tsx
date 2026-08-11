"use client";

import { Coffee, LogIn, LogOut, Pause } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { spanMinutes } from "@/lib/time-engine";
import type { WorkRecord } from "@/lib/types";

export function TodayAttendanceLog({ record }: { record: WorkRecord }) {
  const { digits, duration, number, t } = useLocaleUi();
  const events = [
    ...(record.start ? [{ key: "start", type: t("common.clockIn"), time: record.start, duration: "—", note: t("today.attendance.startNote"), icon: <LogIn />, tone: "bg-[var(--success-soft)] text-[var(--success)]" }] : []),
    ...(record.lunchStart ? [{ key: "lunch", type: t("common.lunch"), time: record.lunchStart, duration: record.lunchEnd ? duration(spanMinutes(record.lunchStart, record.lunchEnd)) : t("common.running"), note: record.lunchPaid ? t("today.attendance.paidLunch") : t("today.attendance.lunchBreak"), icon: <Coffee />, tone: "bg-[var(--warning-soft)] text-[var(--warning)]" }] : []),
    ...record.breaks.map((item) => ({ key: item.id, type: t("common.break"), time: item.start, duration: item.end ? duration(spanMinutes(item.start, item.end)) : t("common.running"), note: item.title || t("today.attendance.breakNote"), icon: <Pause />, tone: "bg-[var(--info-soft)] text-[var(--info)]" })),
    ...(record.end ? [{ key: "end", type: t("common.clockOut"), time: record.end, duration: "—", note: t("today.attendance.endNote"), icon: <LogOut />, tone: "bg-[var(--danger-soft)] text-[var(--danger)]" }] : []),
  ];

  return (
    <SurfaceCard className="dashboard-card mb-4 overflow-hidden p-3 shadow-[0_5px_16px_rgba(0,0,0,.03)] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-xs font-black">{t("today.attendance.title")}</strong><span className="text-[10px] text-[var(--text-muted)]">{t("today.attendance.events", { count: number(events.length) })}</span></div>
      {events.length ? <div className="overflow-x-auto rounded-[16px] border border-[var(--dashboard-border)]">
        <table className="w-full min-w-[620px] border-collapse text-[11px]">
          <thead className="bg-[var(--surface-2)] text-[var(--text-muted)]"><tr><th className="px-3 py-2.5 text-start">{t("common.type")}</th><th className="px-3 py-2.5 text-start">{t("common.time")}</th><th className="px-3 py-2.5 text-start">{t("common.duration")}</th><th className="px-3 py-2.5 text-start">{t("common.note")}</th></tr></thead>
          <tbody>{events.map((event) => <tr key={event.key} className="border-t border-[var(--dashboard-border)]"><td className="px-3 py-2.5"><span className="inline-flex items-center gap-2 font-black"><i className={`grid size-7 place-items-center rounded-lg ${event.tone} [&_svg]:size-3.5`}>{event.icon}</i>{event.type}</span></td><td className="px-3 py-2.5 font-bold" dir="ltr">{digits(event.time)}</td><td className="px-3 py-2.5">{event.duration}</td><td className="px-3 py-2.5 text-[var(--text-muted)]">{event.note}</td></tr>)}</tbody>
        </table>
      </div> : <div className="rounded-[16px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 py-7 text-center text-[11px] text-[var(--text-muted)]">{t("today.attendance.empty")}</div>}
    </SurfaceCard>
  );
}
