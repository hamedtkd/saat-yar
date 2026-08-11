"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Coffee, Edit3, Palmtree } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getHolidayInfo } from "@/lib/holidays";
import { getRecordStatus } from "@/lib/record-health";
import type { MessageKey } from "@/lib/i18n";
import { calc } from "@/lib/time-engine";
import type { AppData } from "@/lib/types";
import { getDailyTargetMinutes } from "@/lib/work-schedule";

const healthStateKeys = {
  empty: "today.health.state.empty",
  invalid: "today.health.state.invalid",
  incomplete: "today.health.state.incomplete",
  complete: "today.health.state.complete",
} satisfies Record<ReturnType<typeof getRecordStatus>["state"], MessageKey>;

const healthIssueKeys: Record<string, MessageKey> = {
  "missing-start": "today.health.issue.missing-start",
  "missing-end": "today.health.issue.missing-end",
  "invalid-work-span": "today.health.issue.invalid-work-span",
  "partial-lunch": "today.health.issue.partial-lunch",
  "open-break": "today.health.issue.open-break",
  "invalid-lunch": "today.health.issue.invalid-lunch",
  "invalid-break": "today.health.issue.invalid-break",
  "leave-without-type": "today.health.issue.leave-without-type",
};

export function MonthDayDetails({ data, selectedDate }: { data: AppData; selectedDate: string }) {
  const { t, date, digits, duration, locale } = useLocaleUi();
  const stored = data.records[selectedDate];
  const leave = data.leaves.find((item) => item.startDate <= selectedDate && item.endDate >= selectedDate);
  const holiday = getHolidayInfo(selectedDate, {
    mode: data.settings.mode,
    manualHoliday: stored?.holiday,
    includeOfficialHolidays: data.settings.autoOfficialHolidays,
    includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
    overrides: data.holidayOverrides,
  });
  const record = stored ? { ...stored, holiday: holiday.isHoliday } : null;
  const target = holiday.isHoliday ? 0 : getDailyTargetMinutes(selectedDate, data.settings);
  const result = record ? calc(record, target) : null;
  const health = record ? getRecordStatus(record) : null;
  const holidayLabel = locale === "fa-IR" && holiday.title ? holiday.title : t("common.holiday");

  return (
    <article className="dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-4 shadow-[0_6px_20px_rgba(0,0,0,.035)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-extrabold text-[var(--text)]">
            <CalendarDays className="size-4 text-[var(--accent-strong)]" />
            {t("month.details.title")}
          </div>
          <strong className="text-base font-black text-[var(--text)]">{date(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
          <div className="mt-2 flex flex-wrap gap-2">
            {holiday.isHoliday && <StatusBadge success={false}>{holidayLabel}</StatusBadge>}
            {leave && <span className="rounded-full bg-[var(--info-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--info)]">{t("month.details.leave")}</span>}
            {health && <StatusBadge success={health.state === "complete"}>{t(healthStateKeys[health.state])}</StatusBadge>}
          </div>
        </div>
        <Button asChild>
          <Link href={`/today?date=${selectedDate}`}><Edit3 className="size-4" /> {t("month.details.edit")}</Link>
        </Button>
      </div>

      {record ? (
        <div className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
          <Detail icon={<Clock3 />} label={t("month.details.inOut")} value={<TimeRange start={digits(record.start || "—")} end={digits(record.end || "—")} separator={t("common.rangeTo")} />} />
          <Detail icon={<CheckCircle2 />} label={t("common.netWorked")} value={duration(result?.worked ?? 0)} />
          <Detail icon={<Coffee />} label={t("month.details.rest")} value={duration((result?.breakMinutes ?? 0) + (result?.unpaidLunchMinutes ?? 0))} />
          <Detail icon={(result?.balance ?? 0) >= 0 ? <CheckCircle2 /> : <AlertTriangle />} label={t("month.details.balance")} value={duration(result?.balance ?? 0, true)} tone={(result?.balance ?? 0) >= 0 ? "green" : "red"} />
        </div>
      ) : (
        <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] text-center">
          {leave ? <Palmtree className="size-5 text-[var(--info)]" /> : <Clock3 className="size-5 text-[var(--text-muted)]" />}
          <strong className="text-xs text-[var(--text)]">{t("month.details.empty")}</strong>
          <span className="text-[10px] text-[var(--text-muted)]">{t("month.details.emptyHint")}</span>
        </div>
      )}

      {health && health.issues.length > 0 && (
        <div className="mt-3 rounded-xl border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[var(--warning-soft)] p-3 text-[10px] leading-6 text-[var(--warning)]">
          {health.issues.map((issue) => <div key={`${issue.code}-${issue.message}`}>• {healthIssueKeys[issue.code] ? t(healthIssueKeys[issue.code]) : issue.message}</div>)}
        </div>
      )}
    </article>
  );
}

function TimeRange({ start, end, separator }: { start: string; end: string; separator: string }) {
  return <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap"><bdi dir="ltr">{start}</bdi><span dir="auto" className="text-[.72em] font-bold text-[var(--text-muted)]">{separator}</span><bdi dir="ltr">{end}</bdi></span>;
}

function Detail({ icon, label, value, tone = "default" }: { icon: ReactNode; label: string; value: ReactNode; tone?: "default" | "green" | "red" }) {
  return (
    <div className="rounded-[15px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3.5">
      <div className="mb-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">{icon}{label}</div>
      <strong className={cn("block text-start text-sm font-black text-[var(--text)]", tone === "green" && "text-[var(--accent-strong)]", tone === "red" && "text-[var(--danger)]")}>{value}</strong>
    </div>
  );
}
