"use client";

import { Coffee, LogOut, Pause, TimerReset } from "lucide-react";
import { ProgressRing } from "@/components/common/progress-ring";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { useLiveWorkCalc } from "@/hooks/use-live-work-calc";
import type { ReturnTypeCalc } from "@/lib/type-helpers";
import type { WorkRecord } from "@/lib/types";

export function TodaySmartSummary({ record, result, dailyTarget, suggestedExit, openBreak, lunchRunning, scheduledDayOff, flexible }: {
  record: WorkRecord;
  result: ReturnTypeCalc;
  dailyTarget: number;
  suggestedExit: string;
  openBreak: boolean;
  lunchRunning: boolean;
  scheduledDayOff: boolean;
  flexible: boolean;
}) {
  const { duration, percent, t } = useLocaleUi();
  const liveResult = useLiveWorkCalc(record, dailyTarget, result);
  const started = Boolean(record.start);
  const finished = Boolean(record.end);
  const workedMinutes = liveResult.worked;
  const creditedMinutes = liveResult.credited;
  const remaining = Math.max(0, dailyTarget - creditedMinutes);
  const hasTarget = dailyTarget > 0;
  const progress = hasTarget ? Math.min(100, Math.round(creditedMinutes / dailyTarget * 100)) : 0;
  const status = scheduledDayOff
    ? finished
      ? t("today.summary.exceptionRecorded")
      : started
        ? t("today.summary.exceptionActive")
        : t("today.summary.scheduledOff")
    : !hasTarget
      ? t("today.summary.noTargetWorkday")
      : !started
        ? t("today.summary.ready")
        : finished
          ? t("today.summary.completed")
          : openBreak
            ? t("today.summary.breakActive")
            : lunchRunning
              ? t("today.summary.lunchActive")
              : remaining === 0
                ? t("today.summary.targetDone")
                : t("today.summary.remaining", { duration: duration(remaining) });
  const items = [
    { icon: <TimerReset />, label: t("today.summary.currentWork"), value: duration(workedMinutes), tone: "text-[var(--success)] bg-[var(--success-soft)]" },
    { icon: <LogOut />, label: flexible ? t("today.summary.estimatedFinish") : t("today.summary.suggestedExit"), value: started && !finished && !scheduledDayOff ? suggestedExit : "—", tone: "text-[var(--danger)] bg-[var(--danger-soft)]" },
    { icon: <Coffee />, label: t("common.rest"), value: lunchRunning ? t("common.running") : t("common.recorded"), tone: "text-[var(--warning)] bg-[var(--warning-soft)]" },
    { icon: <Pause />, label: t("common.break"), value: openBreak ? t("common.running") : t("common.ready"), tone: "text-[var(--info)] bg-[var(--info-soft)]" },
  ];

  return (
    <SurfaceCard className="dashboard-card mb-4 overflow-hidden p-3 shadow-[0_5px_16px_rgba(0,0,0,.03)] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <strong className="block text-xs font-black text-[var(--text)]">{t("today.summary.today")}</strong>
          <span className="text-[10px] text-[var(--text-muted)]">{status}</span>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-black text-[var(--accent-strong)]">{scheduledDayOff ? t("today.summary.scheduledOff") : hasTarget ? t("today.summary.progress", { percent: percent(progress) }) : t("today.summary.noTarget")}</span>
      </div>
      <div className="grid grid-cols-[minmax(190px,.72fr)_repeat(4,minmax(0,1fr))] gap-2.5 max-[1080px]:grid-cols-2 max-[620px]:grid-cols-1">
        <div className="flex min-h-[78px] items-center justify-center gap-3 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 max-[1080px]:col-span-2 max-[620px]:col-span-1">
          <ProgressRing value={progress} size="sm"><strong className="text-sm font-black">{hasTarget ? percent(progress) : "—"}</strong></ProgressRing>
          <div><small className="block text-[10px] text-[var(--text-muted)]">{scheduledDayOff ? t("today.summary.zeroRequired") : hasTarget ? t("today.summary.targetProgress") : t("today.summary.noTargetShort")}</small><strong className="mt-1 block text-lg font-black text-[var(--accent-strong)]">{duration(creditedMinutes)}</strong></div>
        </div>
        {items.map((item) => (
          <div key={item.label} className="flex min-h-[78px] items-center gap-3 rounded-[16px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-2.5">
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${item.tone} [&_svg]:size-4`}>{item.icon}</span>
            <div className="min-w-0"><small className="block truncate text-[9px] font-semibold text-[var(--text-muted)]">{item.label}</small><strong className="mt-1 block truncate text-sm font-black text-[var(--text)]">{item.value}</strong></div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
