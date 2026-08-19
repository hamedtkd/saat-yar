"use client";

import { Coffee, TimerReset } from "lucide-react";
import { useMemo } from "react";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { entryMinutes, localDateKey } from "@/lib/format";
import type { AppData, TimeEntry } from "@/lib/types";
import { ProjectWeekTrend } from "./project-week-trend";

function entryEndMs(entry: TimeEntry, now: number) {
  return entry.endedAt ? new Date(entry.endedAt).getTime() : now;
}

function dayEntries(entries: TimeEntry[], date: string) {
  return entries.filter((entry) => localDateKey(new Date(entry.startedAt)) === date);
}

export function ProjectTodaySummary({ data, selectedDate, dailyTarget }: { data: AppData; selectedDate: string; dailyTarget: number }) {
  const { duration, percent, time, t } = useLocaleUi();
  const hasRunning = data.timeEntries.some((entry) => !entry.endedAt);
  const runtimeNow = useRuntimeNow("minute", hasRunning);
  const now = runtimeNow ?? 0;
  const entries = useMemo(() => dayEntries(data.timeEntries, selectedDate).sort((a, b) => a.startedAt.localeCompare(b.startedAt)), [data.timeEntries, selectedDate]);
  const totalMinutes = entries.reduce((sum, entry) => sum + entryMinutes(entry, now), 0);
  const firstStart = entries[0]?.startedAt;
  const gaps = entries.reduce((count, entry, index) => {
    if (index === 0) return count;
    const previous = entries[index - 1];
    if (!previous.endedAt) return count;
    return new Date(entry.startedAt).getTime() - new Date(previous.endedAt).getTime() > 60_000 ? count + 1 : count;
  }, 0);
  const progress = dailyTarget > 0 ? Math.min(100, Math.round(totalMinutes / dailyTarget * 100)) : 0;

  const timeline = useMemo(() => {
    if (!entries.length) return [];
    const start = new Date(entries[0].startedAt).getTime();
    const end = Math.max(start + 1, ...entries.map((entry) => entryEndMs(entry, now)));
    return entries.map((entry) => {
      const entryStart = new Date(entry.startedAt).getTime();
      const entryEnd = entryEndMs(entry, now);
      return {
        id: entry.id,
        left: Math.max(0, (entryStart - start) / (end - start) * 100),
        width: Math.max(2, (entryEnd - entryStart) / (end - start) * 100),
      };
    });
  }, [entries, now]);

  const trend = useMemo(() => {
    const end = new Date(`${selectedDate}T12:00:00`);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(end);
      date.setDate(end.getDate() - (6 - index));
      const key = localDateKey(date);
      const minutes = dayEntries(data.timeEntries, key).reduce((sum, entry) => sum + entryMinutes(entry, now), 0);
      return { key, minutes };
    });
  }, [data.timeEntries, now, selectedDate]);

  return (
    <section className="mt-4 border-t border-[var(--dashboard-border)] pt-4 max-[359px]:mt-3 max-[359px]:pt-3">
      <div className="flex flex-wrap items-end justify-between gap-3 max-[359px]:gap-2">
        <div className="grid gap-0.5">
          <span className="text-[10px] font-black text-[var(--text-muted)]">{t("today.timer.today")}</span>
          <strong className="text-xl font-black tabular-nums text-[var(--accent-strong)] max-[359px]:text-lg sm:text-2xl">{duration(totalMinutes)}</strong>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[8px] text-[var(--text-muted)] max-[520px]:w-full max-[359px]:gap-1">
          {dailyTarget > 0 && (
            <span className="rounded-md bg-[var(--surface-1)] px-2 py-1.5 font-bold max-[359px]:px-1.5 max-[359px]:py-1">{duration(totalMinutes)} / {duration(dailyTarget)} · {percent(progress)}</span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-1)] px-2 py-1.5 max-[359px]:px-1.5 max-[359px]:py-1"><TimerReset className="size-3" />{entries.length} {t("today.timer.activities")}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-1)] px-2 py-1.5 max-[359px]:px-1.5 max-[359px]:py-1"><Coffee className="size-3" />{gaps} {t("today.timer.pauses")}</span>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full max-[359px]:mt-2.5 bg-[color-mix(in_srgb,var(--border)_78%,transparent)]">
        <div className="relative h-full overflow-hidden rounded-full">
          {timeline.map((segment) => (
            <i key={segment.id} aria-hidden="true" className="absolute inset-y-0 rounded-full bg-[var(--accent)]" style={{ insetInlineStart: `${segment.left}%`, width: `${segment.width}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[8px] text-[var(--text-muted)] max-[359px]:gap-1 max-[359px]:text-[7.5px]">
        <span>{firstStart ? t("today.timer.startedToday", { time: time(firstStart) }) : t("today.timer.noActivityToday")}</span>
        {entries.length > 0 && <span>{entries.some((entry) => !entry.endedAt) ? t("common.running") : time(entries[entries.length - 1]?.endedAt ?? entries[entries.length - 1]?.startedAt ?? "")}</span>}
      </div>

      <ProjectWeekTrend trend={trend} />
    </section>
  );
}
