"use client";

import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import type { MonthStats } from "./types";

type MonthSummaryProps = { isEmployee: boolean; recordCount: number; stats: MonthStats };
export function MonthSummary({ isEmployee, recordCount, stats }: MonthSummaryProps) {
  const { t, number, duration } = useLocaleUi();
  return <SurfaceCard as="section" className="mt-3 flex items-center justify-between gap-4 p-4 max-[620px]:items-start max-[620px]:flex-col"><div className="grid gap-1"><strong className="text-sm font-extrabold text-[var(--text)]">{isEmployee ? t("reports.month.employeeSummary") : t("reports.month.freelancerSummary")}</strong><span className="text-[10px] leading-6 text-[var(--text-muted)]">{t("reports.month.line", { count: number(recordCount), target: duration(stats.target), worked: duration(stats.worked), balance: duration(stats.balance, true) })}</span></div><span dir="ltr" className={cn("shrink-0 text-lg font-black", stats.balance >= 0 ? "text-[var(--accent-strong)]" : "text-[var(--danger)]")}>{duration(stats.balance, true)}</span></SurfaceCard>;
}
