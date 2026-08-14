"use client";

import { Clock3 } from "lucide-react";
import { DescriptionTooltip } from "@/components/common/description-tooltip";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { buildRecentActivityDays } from "@/lib/month-intelligence";
import type { Settings, WorkRecord } from "@/lib/types";

export function RecentActivityCard({
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
  const { t, calendar, date, duration } = useLocaleUi();
  const days = buildRecentActivityDays(selectedDate, calendar, records, settings);

  return (
    <SurfaceCard as="article" className="self-start p-4" data-month-recent-activity>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Clock3 className="size-4.5" />
          </span>
          <div className="flex min-w-0 items-center gap-1">
            <h3 className="truncate text-sm font-black text-[var(--text)]">{t("month.recent.title")}</h3>
            <DescriptionTooltip content={t("month.recent.description")} />
          </div>
        </div>
      </div>

      <div className="mt-3 divide-y divide-[var(--dashboard-border)]">
        {days.map((day) => {
          const progress = day.target > 0 ? Math.min(100, (day.worked / day.target) * 100) : day.worked > 0 ? 100 : 0;
          const balanceTone = day.balance > 5 ? "text-[var(--success)]" : day.balance < -5 ? "text-[var(--warning)]" : "text-[var(--text-muted)]";
          return (
            <button
              key={day.key}
              type="button"
              data-recent-activity-date={day.key}
              aria-pressed={day.key === selectedDate}
              onClick={() => setSelectedDate(day.key)}
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1.5 py-2 text-start outline-none transition hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                day.key === selectedDate && "bg-[var(--accent-soft)]",
              )}
            >
              <span className="min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] font-bold text-[var(--text)]">{date(day.key, { weekday: "short", day: "numeric", month: "short" })}</span>
                  <span className="shrink-0 text-[8px] text-[var(--text-muted)]">{day.target > 0 ? t("month.recent.target", { value: duration(day.target) }) : t("month.recent.noTarget")}</span>
                </span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <span className="block h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${progress}%` }} />
                </span>
              </span>
              <span className="min-w-[66px] text-end">
                <strong className="block text-[11px] font-black tabular-nums text-[var(--text)]">{duration(day.worked)}</strong>
                <span className={cn("mt-0.5 block text-[8px] font-bold tabular-nums", balanceTone)}>
                  {day.hasRecord ? duration(day.balance, true) : t("month.recent.noRecord")}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
