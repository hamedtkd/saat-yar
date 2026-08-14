"use client";

import { useMemo, useRef } from "react";
import { Activity } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { buildMonthActivityCells } from "@/lib/month-intelligence";
import type { Settings, WorkRecord } from "@/lib/types";

const intensityClasses = [
  "bg-[var(--surface-2)]",
  "bg-[color-mix(in_srgb,var(--accent)_18%,var(--surface-2))]",
  "bg-[color-mix(in_srgb,var(--accent)_36%,var(--surface-2))]",
  "bg-[color-mix(in_srgb,var(--accent)_62%,var(--surface-2))]",
  "bg-[var(--accent)]",
] as const;

const weekdayKeys = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;

export function ActivityHeatmap({
  selectedDate,
  setSelectedDate,
  records,
  settings,
}: {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  records: WorkRecord[];
  settings: Settings;
}) {
  const { t, calendar, date, direction, duration } = useLocaleUi();
  const cells = useMemo(
    () => buildMonthActivityCells(selectedDate, calendar, records, settings),
    [calendar, records, selectedDate, settings],
  );
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const monthLabel = date(selectedDate, { year: "numeric", month: "long" });

  function moveFocus(currentIndex: number, delta: number) {
    const nextIndex = currentIndex + delta;
    const next = cells[nextIndex];
    if (!next?.inMonth) return;
    setSelectedDate(next.key);
    requestAnimationFrame(() => buttonRefs.current.get(next.key)?.focus());
  }

  return (
    <SurfaceCard as="article" className="min-w-0 p-4 sm:p-5" data-month-activity-heatmap>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Activity className="size-5" /></span>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-[var(--text)]">{t("month.activity.title")}</h3>
            <p className="mt-1 text-[10px] leading-6 text-[var(--text-muted)]">{t("month.activity.description")}</p>
          </div>
        </div>
        <span className="rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">{monthLabel}</span>
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-2.5">
        <div className="grid grid-rows-7 gap-1.5 pt-0.5 text-[9px] font-bold text-[var(--text-muted)] sm:gap-2">
          {weekdayKeys.map((day) => <span key={day} className="flex h-7 items-center">{t(`weekday.${day}.short`)}</span>)}
        </div>
        <div className="min-w-0 overflow-visible">
          <div role="grid" aria-label={t("month.activity.gridLabel", { month: monthLabel })} className="grid grid-flow-col grid-rows-7 justify-start gap-1.5 sm:gap-2">
            {cells.map((cell, index) => {
              const tooltipId = `activity-${cell.key}`;
              const dateLabel = date(cell.key, { weekday: "long", day: "numeric", month: "long" });
              const detail = cell.hasRecord
                ? t("month.activity.tooltip", { date: dateLabel, worked: duration(cell.worked), balance: duration(cell.balance, true) })
                : t("month.activity.tooltipEmpty", { date: dateLabel });
              const horizontalStep = direction === "rtl" ? -7 : 7;
              const column = Math.floor(index / 7);
              const tooltipAlignment = column === 0 ? "start-0" : column === 5 ? "end-0" : "start-1/2 -translate-x-1/2";
              return (
                <button
                  key={cell.key}
                  ref={(node) => { if (node) buttonRefs.current.set(cell.key, node); else buttonRefs.current.delete(cell.key); }}
                  type="button"
                  role="gridcell"
                  data-activity-date={cell.key}
                  data-activity-in-month={cell.inMonth ? "true" : "false"}
                  data-activity-intensity={cell.intensity}
                  aria-describedby={tooltipId}
                  aria-selected={cell.key === selectedDate}
                  tabIndex={cell.key === selectedDate ? 0 : -1}
                  disabled={!cell.inMonth}
                  onClick={() => setSelectedDate(cell.key)}
                  onKeyDown={(event) => {
                    const row = index % 7;
                    if (event.key === "ArrowDown" && row < 6) { event.preventDefault(); moveFocus(index, 1); }
                    else if (event.key === "ArrowUp" && row > 0) { event.preventDefault(); moveFocus(index, -1); }
                    else if (event.key === "ArrowRight") { event.preventDefault(); moveFocus(index, horizontalStep); }
                    else if (event.key === "ArrowLeft") { event.preventDefault(); moveFocus(index, -horizontalStep); }
                  }}
                  className={cn(
                    "group relative size-7 rounded-[7px] border border-[color-mix(in_srgb,var(--dashboard-border)_82%,transparent)] outline-none transition-[transform,border-color,box-shadow] sm:size-8",
                    intensityClasses[cell.intensity],
                    cell.inMonth ? "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_55%,var(--dashboard-border))]" : "pointer-events-none opacity-20",
                    cell.key === selectedDate && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface-1)]",
                    "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]",
                  )}
                >
                  <span id={tooltipId} role="tooltip" className={cn("pointer-events-none absolute bottom-[calc(100%+8px)] z-30 hidden w-max max-w-[190px] rounded-lg border border-[var(--dashboard-border)] bg-[var(--surface-3)] px-2.5 py-2 text-start text-[9px] font-semibold leading-5 text-[var(--text)] shadow-lg group-hover:block group-focus-visible:block", tooltipAlignment)}>
                    {detail}
                  </span>
                  <span className="sr-only">{detail}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[9px] text-[var(--text-muted)]">
        <span>{t("month.activity.keyboardHint")}</span>
        <div className="flex items-center gap-1.5" aria-label={t("month.activity.legendLabel")}>
          <span>{t("month.activity.less")}</span>
          {intensityClasses.map((className, index) => <i key={className} aria-hidden="true" className={cn("size-3 rounded-[4px] border border-[var(--dashboard-border)]", className)} data-legend-intensity={index} />)}
          <span>{t("month.activity.more")}</span>
        </div>
      </div>
    </SurfaceCard>
  );
}
