"use client";

import type { ReactNode } from "react";
import { BriefcaseBusiness, Flame, Gauge, MinusCircle, Palmtree, Sparkles, TrendingUp } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { buildMonthActivityCells, summarizeMonthIntelligence } from "@/lib/month-intelligence";
import type { AppData } from "@/lib/types";
import { AnalyticsCardHeader } from "./analytics-card-header";

export function MonthIntelligenceCard({ selectedDate, data }: { selectedDate: string; data: AppData }) {
  const { t, calendar, date, duration, number } = useLocaleUi();
  const summary = summarizeMonthIntelligence(buildMonthActivityCells(selectedDate, calendar, data));
  const distributionMagnitude = summary.overtimeMinutes + summary.leaveMinutes + summary.deficitMinutes;
  const overtimeShare = distributionMagnitude > 0 ? (summary.overtimeMinutes / distributionMagnitude) * 100 : 0;
  const leaveShare = distributionMagnitude > 0 ? (summary.leaveMinutes / distributionMagnitude) * 100 : 0;
  const deficitShare = distributionMagnitude > 0 ? (summary.deficitMinutes / distributionMagnitude) * 100 : 0;

  return (
    <SurfaceCard as="article" className="flex h-full flex-col p-4" data-month-intelligence>
      <AnalyticsCardHeader icon={<Sparkles />} title={t("month.intelligence.title")} description={t("month.intelligence.description")} />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Metric icon={<BriefcaseBusiness />} label={t("month.intelligence.worked")} value={duration(summary.workedMinutes)} />
        <Metric icon={<Palmtree />} label={t("month.intelligence.leave")} value={duration(summary.leaveMinutes)} hint={t("month.intelligence.leaveDayCount", { count: number(summary.leaveDays) })} tone="info" />
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
          {distributionMagnitude > 0 && <>
            <span className="h-full bg-[var(--success)]" style={{ width: `${overtimeShare}%` }} />
            <span className="h-full bg-[var(--info)]" style={{ width: `${leaveShare}%` }} />
            <span className="h-full bg-[var(--warning)]" style={{ width: `${deficitShare}%` }} />
          </>}
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-2 text-[8px] text-[var(--text-muted)]">
          <span className="text-start">{t("month.intelligence.overtimeShort", { value: duration(summary.overtimeMinutes) })}</span>
          <span className="text-center text-[var(--info)]">{t("month.intelligence.leaveShort", { value: duration(summary.leaveMinutes) })}</span>
          <span className="text-end">{t("month.intelligence.deficitShort", { value: duration(summary.deficitMinutes) })}</span>
        </div>
      </div>

      <p className="mt-auto pt-3 truncate text-[9px] leading-5 text-[var(--text-muted)]" title={summary.bestDay ? t("month.intelligence.bestDay", { date: date(summary.bestDay.key, { day: "numeric", month: "long" }), value: duration(summary.bestDay.worked) }) : t("month.intelligence.noActivity")}>
        {summary.bestDay
          ? t("month.intelligence.bestDay", { date: date(summary.bestDay.key, { day: "numeric", month: "long" }), value: duration(summary.bestDay.worked) })
          : t("month.intelligence.noActivity")}
      </p>
    </SurfaceCard>
  );
}

function Metric({ icon, label, value, hint, tone = "neutral" }: { icon: ReactNode; label: string; value: string; hint?: string; tone?: "neutral" | "positive" | "negative" | "info" }) {
  const toneClass = tone === "positive" ? "text-[var(--success)]" : tone === "negative" ? "text-[var(--warning)]" : tone === "info" ? "text-[var(--info)]" : "text-[var(--text)]";
  return (
    <div className="min-w-0 rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-2.5">
      <div className="flex items-center gap-1.5 text-[var(--accent)] [&_svg]:size-3.5"><span className="shrink-0">{icon}</span><span className="truncate text-[8px] font-bold text-[var(--text-muted)]">{label}</span></div>
      <strong className={`mt-1.5 block truncate text-[13px] font-black tabular-nums ${toneClass}`}>{value}</strong>
      {hint && <span className="mt-0.5 block text-[8px] text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
}
