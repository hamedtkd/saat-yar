"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { buildMonthActivityCells } from "@/lib/month-intelligence";
import type { Settings, WorkRecord } from "@/lib/types";
import { ActivityHeatmapTooltip } from "./activity-heatmap-tooltip";
import { AnalyticsCardHeader } from "./analytics-card-header";

const intensityClasses = [
  "bg-[var(--surface-2)]",
  "bg-[color-mix(in_srgb,var(--accent)_18%,var(--surface-2))]",
  "bg-[color-mix(in_srgb,var(--accent)_36%,var(--surface-2))]",
  "bg-[color-mix(in_srgb,var(--accent)_62%,var(--surface-2))]",
  "bg-[var(--accent)]",
] as const;

const weekdayKeys = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;

type ActiveTooltip = { id: string; target: HTMLButtonElement; content: string } | null;

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
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip>(null);
  const monthLabel = date(selectedDate, { year: "numeric", month: "long" });

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement) || !target.matches("[data-activity-date]")) return;
      const tooltipId = target.dataset.activityTooltipId;
      const content = target.getAttribute("aria-label");
      if (!tooltipId || !content) return;
      setActiveTooltip({ id: tooltipId, target, content });
    }

    function handleFocusOut(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement) || !target.matches("[data-activity-date]")) return;
      setActiveTooltip((current) => current?.target === target ? null : current);
    }

    grid.addEventListener("focusin", handleFocusIn);
    grid.addEventListener("focusout", handleFocusOut);
    return () => {
      grid.removeEventListener("focusin", handleFocusIn);
      grid.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  function moveFocus(currentIndex: number, delta: number) {
    const nextIndex = currentIndex + delta;
    const next = cells[nextIndex];
    if (!next?.inMonth) return;
    setSelectedDate(next.key);
    requestAnimationFrame(() => buttonRefs.current.get(next.key)?.focus());
  }

  return (
    <SurfaceCard as="article" className="flex h-full min-w-0 flex-col p-4" data-month-activity-heatmap>
      <AnalyticsCardHeader
        icon={<Activity />}
        title={t("month.activity.title")}
        description={t("month.activity.description")}
        trailing={<span className="rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-2.5 py-1 text-[9px] font-bold text-[var(--text-muted)]">{monthLabel}</span>}
      />

      <div className="mx-auto mt-4 grid w-fit max-w-full min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] content-center items-start gap-2.5">
        <div className="grid grid-rows-7 gap-1.5 pt-0.5 text-[9px] font-bold text-[var(--text-muted)] sm:gap-2">
          {weekdayKeys.map((day) => <span key={day} className="flex h-7 items-center">{t(`weekday.${day}.short`)}</span>)}
        </div>
        <div className="min-w-0 overflow-visible">
          <div ref={gridRef} role="grid" aria-label={t("month.activity.gridLabel", { month: monthLabel })} className="grid grid-flow-col grid-rows-7 justify-center gap-1.5 sm:gap-2">
            {cells.map((cell, index) => {
              const tooltipId = `activity-${cell.key}`;
              const dateLabel = date(cell.key, { weekday: "long", day: "numeric", month: "long" });
              const detail = cell.hasRecord
                ? t("month.activity.tooltip", { date: dateLabel, worked: duration(cell.worked), balance: duration(cell.balance, true) })
                : t("month.activity.tooltipEmpty", { date: dateLabel });
              const horizontalStep = direction === "rtl" ? -7 : 7;
              return (
                <button
                  key={cell.key}
                  ref={(node) => { if (node) buttonRefs.current.set(cell.key, node); else buttonRefs.current.delete(cell.key); }}
                  type="button"
                  role="gridcell"
                  data-activity-date={cell.key}
                  data-activity-in-month={cell.inMonth ? "true" : "false"}
                  data-activity-intensity={cell.intensity}
                  data-activity-tooltip-id={tooltipId}
                  aria-label={detail}
                  aria-describedby={activeTooltip?.id === tooltipId ? tooltipId : undefined}
                  aria-selected={cell.key === selectedDate}
                  tabIndex={cell.key === selectedDate ? 0 : -1}
                  disabled={!cell.inMonth}
                  onClick={() => setSelectedDate(cell.key)}
                  onMouseEnter={(event) => setActiveTooltip({ id: tooltipId, target: event.currentTarget, content: detail })}
                  onMouseLeave={(event) => setActiveTooltip((current) => current?.target === event.currentTarget ? null : current)}
                  onFocus={(event) => setActiveTooltip({ id: tooltipId, target: event.currentTarget, content: detail })}
                  onBlur={(event) => setActiveTooltip((current) => current?.target === event.currentTarget ? null : current)}
                  onKeyDown={(event) => {
                    const row = index % 7;
                    if (event.key === "ArrowDown" && row < 6) { event.preventDefault(); moveFocus(index, 1); }
                    else if (event.key === "ArrowUp" && row > 0) { event.preventDefault(); moveFocus(index, -1); }
                    else if (event.key === "ArrowRight") { event.preventDefault(); moveFocus(index, horizontalStep); }
                    else if (event.key === "ArrowLeft") { event.preventDefault(); moveFocus(index, -horizontalStep); }
                  }}
                  className={cn(
                    "relative size-7 rounded-[7px] border border-[color-mix(in_srgb,var(--dashboard-border)_82%,transparent)] outline-none transition-[transform,border-color,box-shadow] sm:size-8",
                    intensityClasses[cell.intensity],
                    cell.inMonth ? "hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_55%,var(--dashboard-border))]" : "pointer-events-none opacity-20",
                    cell.key === selectedDate && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface-1)]",
                    "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[9px] text-[var(--text-muted)]">
        <span className="sr-only">{t("month.activity.keyboardHint")}</span>
        <span>{t("month.activity.less")}</span>
        {intensityClasses.map((className, index) => <i key={className} aria-hidden="true" className={cn("size-3 rounded-[4px] border border-[var(--dashboard-border)]", className)} data-legend-intensity={index} />)}
        <span>{t("month.activity.more")}</span>
      </div>

      {activeTooltip && <ActivityHeatmapTooltip key={activeTooltip.id} id={activeTooltip.id} target={activeTooltip.target} content={activeTooltip.content} />}
    </SurfaceCard>
  );
}
