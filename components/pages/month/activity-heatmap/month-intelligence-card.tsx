"use client";

import type { ReactNode } from "react";
import { Flame, Gauge, MinusCircle, TrendingUp } from "lucide-react";
import { DescriptionTooltip } from "@/components/common/description-tooltip";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { buildMonthActivityCells, summarizeMonthIntelligence } from "@/lib/month-intelligence";
import type { Settings, WorkRecord } from "@/lib/types";

export function MonthIntelligenceCard({ selectedDate, records, settings }: { selectedDate: string; records: WorkRecord[]; settings: Settings }) {
  const { t, calendar, date, duration, number } = useLocaleUi();
  const summary = summarizeMonthIntelligence(buildMonthActivityCells(selectedDate, calendar, records, settings));
  const balanceMagnitude = summary.overtimeMinutes + summary.deficitMinutes;
  const overtimeShare = balanceMagnitude > 0 ? (summary.overtimeMinutes / balanceMagnitude) * 100 : 0;

  return (
    <SurfaceCard as="article" className="self-start p-4" data-month-intelligence>
      <div className="flex items-center gap-1">
        <h3 className="text-sm font-black text-[var(--text)]">{t("month.intelligence.title")}</h3>
        <DescriptionTooltip content={t("month.intelligence.description")} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Metric icon={<Gauge />} label={t("month.intelligence.activeDays")} value={number(summary.activeDays)} />
        <Metric icon={<Flame />} label={t("month.intelligence.streak")} value={t("month.intelligence.daysValue", { count: number(summary.longestStreak) })} />
        <Metric icon={<TrendingUp />} label={t("month.intelligence.overtime")} value={duration(summary.overtimeMinutes, true)} hint={t("month.intelligence.dayCount", { count: number(summary.overtimeDays) })} tone="positive" />
        <Metric icon={<MinusCircle />} label={t("month.intelligence.deficit")} value={summary.deficitMinutes ? `−${duration(summary.deficitMinutes)}` : duration(0)} hint={t("month.intelligence.dayCount", { count: number(summary.deficitDays) })} tone="negative" />
      </div>

      <div className="mt-3 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-2.5">
        <div className="flex items-center justify-between gap-3 text-[8px] font-bold text-[var(--text-muted)]">
          <span>{t("month.intelligence.balanceDistribution")}</span>
          <span>{t("month.intelligence.balancedDays", { count: number(summary.balancedDays) })}</span>
        </div>
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]" aria-label={t("month.intelligence.balanceDistribution")}>
          {balanceMagnitude > 0 && <>
            <span className="h-full bg-[var(--success)]" style={{ width: `${overtimeShare}%` }} />
            <span className="h-full bg-[var(--warning)]" style={{ width: `${100 - overtimeShare}%` }} />
          </>}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[8px] text-[var(--text-muted)]">
          <span>{t("month.intelligence.overtimeShort", { value: duration(summary.overtimeMinutes) })}</span>
          <span>{t("month.intelligence.deficitShort", { value: duration(summary.deficitMinutes) })}</span>
        </div>
      </div>

      <p className="mt-3 truncate text-[9px] leading-5 text-[var(--text-muted)]" title={summary.bestDay ? t("month.intelligence.bestDay", { date: date(summary.bestDay.key, { day: "numeric", month: "long" }), value: duration(summary.bestDay.worked) }) : t("month.intelligence.noActivity")}>
        {summary.bestDay
          ? t("month.intelligence.bestDay", { date: date(summary.bestDay.key, { day: "numeric", month: "long" }), value: duration(summary.bestDay.worked) })
          : t("month.intelligence.noActivity")}
      </p>
    </SurfaceCard>
  );
}

function Metric({ icon, label, value, hint, tone = "neutral" }: { icon: ReactNode; label: string; value: string; hint?: string; tone?: "neutral" | "positive" | "negative" }) {
  const toneClass = tone === "positive" ? "text-[var(--success)]" : tone === "negative" ? "text-[var(--warning)]" : "text-[var(--text)]";
  return (
    <div className="min-w-0 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-2.5">
      <div className="flex items-center gap-1.5 text-[var(--accent)] [&_svg]:size-3.5"><span className="shrink-0">{icon}</span><span className="truncate text-[8px] font-bold text-[var(--text-muted)]">{label}</span></div>
      <strong className={`mt-1.5 block truncate text-[13px] font-black tabular-nums ${toneClass}`}>{value}</strong>
      {hint && <span className="mt-0.5 block text-[8px] text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
}
