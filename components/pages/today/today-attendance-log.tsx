"use client";

import { Coffee, LogIn, LogOut, Pause, PencilLine } from "lucide-react";
import { useState, type ReactNode } from "react";

import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import type { AttendanceEventTarget } from "@/lib/attendance-event-edit";
import { spanMinutes } from "@/lib/time-engine";
import type { WorkRecord, WorkRecordPatch } from "@/lib/types";
import { AttendanceEventEditDialog } from "./attendance-event-edit-dialog";

type AttendanceEventView = {
  key: string;
  type: string;
  time: string;
  duration: string;
  note: string;
  icon: ReactNode;
  tone: string;
  target: AttendanceEventTarget;
};

export function TodayAttendanceLog({ record, updateRecord }: { record: WorkRecord; updateRecord: (patch: WorkRecordPatch) => void }) {
  const { digits, duration, number, t } = useLocaleUi();
  const [editing, setEditing] = useState<AttendanceEventTarget>();
  const events: AttendanceEventView[] = [
    ...(record.start ? [{ key: "start", type: t("common.clockIn"), time: record.start, duration: "—", note: t("today.attendance.startNote"), icon: <LogIn />, tone: "bg-[var(--success-soft)] text-[var(--success)]", target: { kind: "clock-in" } as const }] : []),
    ...(record.lunchStart ? [{ key: "lunch", type: t("common.lunch"), time: record.lunchStart, duration: record.lunchEnd ? duration(spanMinutes(record.lunchStart, record.lunchEnd)) : t("common.running"), note: record.lunchPaid ? t("today.attendance.paidLunch") : t("today.attendance.lunchBreak"), icon: <Coffee />, tone: "bg-[var(--warning-soft)] text-[var(--warning)]", target: { kind: "lunch" } as const }] : []),
    ...record.breaks.map((item) => ({ key: item.id, type: t("common.break"), time: item.start, duration: item.end ? duration(spanMinutes(item.start, item.end)) : t("common.running"), note: item.title || t("today.attendance.breakNote"), icon: <Pause />, tone: "bg-[var(--info-soft)] text-[var(--info)]", target: { kind: "break", id: item.id } as const })),
    ...(record.end ? [{ key: "end", type: t("common.clockOut"), time: record.end, duration: "—", note: t("today.attendance.endNote"), icon: <LogOut />, tone: "bg-[var(--danger-soft)] text-[var(--danger)]", target: { kind: "clock-out" } as const }] : []),
  ];

  return (
    <SurfaceCard className="dashboard-card mb-4 overflow-hidden p-3 shadow-[0_5px_16px_rgba(0,0,0,.03)] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="grid gap-0.5 text-start">
          <strong className="text-xs font-black">{t("today.attendance.title")}</strong>
          <span className="text-[9px] leading-5 text-[var(--text-muted)]">{t("today.attendance.editHint")}</span>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[9px] font-bold text-[var(--text-muted)]">{t("today.attendance.events", { count: number(events.length) })}</span>
      </div>

      {events.length ? (
        <>
          <div className="hidden overflow-hidden rounded-[16px] border border-[var(--dashboard-border)] md:block">
            <table className="w-full border-collapse text-[11px]">
              <thead className="bg-[var(--surface-2)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2.5 text-start">{t("common.type")}</th>
                  <th className="px-3 py-2.5 text-start">{t("common.time")}</th>
                  <th className="px-3 py-2.5 text-start">{t("common.duration")}</th>
                  <th className="px-3 py-2.5 text-start">{t("common.note")}</th>
                  <th className="w-16 px-3 py-2.5 text-center">{t("common.edit")}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.key} className="border-t border-[var(--dashboard-border)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent-soft)_45%,transparent)]">
                    <td className="px-3 py-2.5"><span className="inline-flex items-center gap-2 font-black"><i className={`grid size-7 place-items-center rounded-lg ${event.tone} [&_svg]:size-3.5`}>{event.icon}</i>{event.type}</span></td>
                    <td className="px-3 py-2.5 font-bold" dir="ltr">{digits(event.time)}</td>
                    <td className="px-3 py-2.5 font-semibold">{event.duration}</td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">{event.note}</td>
                    <td className="px-3 py-2 text-center">
                      <Button type="button" variant="ghost" size="icon" className="size-8 rounded-lg text-[var(--accent-strong)]" data-attendance-event-edit={event.target.kind} onClick={() => setEditing(event.target)} aria-label={t("today.attendance.editAria", { type: event.type })}>
                        <PencilLine aria-hidden="true" className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-2 md:hidden">
            {events.map((event) => (
              <article key={event.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3">
                <i className={`grid size-9 place-items-center rounded-[11px] ${event.tone} [&_svg]:size-4`}>{event.icon}</i>
                <div className="min-w-0 text-start">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><strong className="text-[11px] text-[var(--text)]">{event.type}</strong><span dir="ltr" className="text-[10px] font-black text-[var(--accent-strong)]">{digits(event.time)}</span><span className="text-[9px] text-[var(--text-muted)]">{event.duration}</span></div>
                  <p className="mt-1 truncate text-[9px] text-[var(--text-muted)]">{event.note}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="size-9 rounded-lg text-[var(--accent-strong)]" data-attendance-event-edit={event.target.kind} onClick={() => setEditing(event.target)} aria-label={t("today.attendance.editAria", { type: event.type })}>
                  <PencilLine aria-hidden="true" className="size-4" />
                </Button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-[16px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 py-7 text-center text-[11px] text-[var(--text-muted)]">{t("today.attendance.empty")}</div>
      )}

      {editing && (
        <AttendanceEventEditDialog
          key={editing.kind === "break" ? `break-${editing.id}` : editing.kind}
          record={record}
          target={editing}
          updateRecord={updateRecord}
          onClose={() => setEditing(undefined)}
        />
      )}
    </SurfaceCard>
  );
}
