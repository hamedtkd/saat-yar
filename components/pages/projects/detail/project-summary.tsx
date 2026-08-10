"use client";

import { Clock3, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { ProgressBar } from "@/components/common/progress-bar";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import type { ProjectFinanceSummary } from "@/lib/project-finance";
import type { Project } from "@/lib/types";

export function ProjectSummary({ project, summary, financialsHidden }: { project: Project; summary: ProjectFinanceSummary; financialsHidden: boolean }) {
  const { b, duration, number, percent } = useBusinessUi();
  const tone = summary.budgetStatus === "exceeded" ? "danger" : summary.budgetStatus === "warning" ? "warning" : "accent";
  return <>
    <section className="mb-5 grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1"><MetricCard icon={<Clock3 />} label={b("projects.summary.tracked")} value={duration(summary.trackedMinutes)} suffix={b("common.hour")} /><MetricCard icon={<TrendingUp />} label={b("projects.summary.budget")} value={percent(summary.budgetProgress)} suffix={b("projects.summary.ofHours", { hours: number(project.budgetHours ?? 0) })} /><MetricCard icon={<WalletCards />} label={b("projects.summary.revenue")} value={<PrivateMoney value={summary.revenue} hidden={financialsHidden} />} suffix={b("common.toman")} /><MetricCard icon={<TrendingDown />} label={b("projects.summary.profit")} value={<PrivateMoney value={summary.profit} hidden={financialsHidden} />} suffix={b("common.toman")} tone={summary.profit < 0 ? "blue" : undefined} /></section>
    <SurfaceCard as="section" className="mb-5 grid grid-cols-[190px_1fr_230px] items-center gap-7 p-6 max-[900px]:grid-cols-1">
      <div className="grid gap-1 text-center"><span className="text-xs text-[var(--text-muted)]">{b("projects.summary.budgetRemaining")}</span><strong className="text-2xl text-[var(--accent-strong)]">{duration(summary.remainingMinutes)}</strong></div>
      <div className="grid gap-2"><span className="text-xs text-[var(--text-muted)]">{b("projects.summary.budgetTitle")}</span><ProgressBar value={summary.budgetProgress} tone={tone} /><small className="text-xs text-[var(--text-muted)]">{b("projects.summary.trackedOfHours", { duration: duration(summary.trackedMinutes), hours: number(project.budgetHours ?? 0) })}</small></div>
      <div className="grid gap-1 text-center"><span className="text-xs text-[var(--text-muted)]">{b("projects.summary.margin")}</span><strong className={summary.profit < 0 ? "text-2xl text-[var(--danger)]" : "text-2xl text-[var(--success)]"}>{financialsHidden ? "••••••" : summary.marginPercent === null ? "—" : percent(summary.marginPercent)}</strong><small className="text-xs text-[var(--text-muted)]">{b("projects.summary.expensesLabel")}: <PrivateMoney value={summary.expenses} hidden={financialsHidden} /> {b("common.toman")}</small></div>
    </SurfaceCard>
  </>;
}
