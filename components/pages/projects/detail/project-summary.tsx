import { Clock3, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { ProgressBar } from "@/components/common/progress-bar";
import { SurfaceCard } from "@/components/common/surface-card";
import { duration, fa } from "@/lib/format";
import type { ProjectFinanceSummary } from "@/lib/project-finance";
import type { Project } from "@/lib/types";

export function ProjectSummary({ project, summary, financialsHidden }: { project: Project; summary: ProjectFinanceSummary; financialsHidden: boolean }) {
  const tone = summary.budgetStatus === "exceeded" ? "danger" : summary.budgetStatus === "warning" ? "warning" : "accent";
  return <>
    <section className="mb-5 grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1"><MetricCard icon={<Clock3 />} label="زمان ثبت‌شده" value={duration(summary.trackedMinutes)} suffix="ساعت" /><MetricCard icon={<TrendingUp />} label="مصرف بودجه" value={`${fa.format(summary.budgetProgress)}٪`} suffix={`از ${fa.format(project.budgetHours ?? 0)} ساعت`} /><MetricCard icon={<WalletCards />} label="درآمد ثبت‌شده" value={<PrivateMoney value={summary.revenue} hidden={financialsHidden} />} suffix="تومان" /><MetricCard icon={<TrendingDown />} label="سود خالص" value={<PrivateMoney value={summary.profit} hidden={financialsHidden} />} suffix="تومان" tone={summary.profit < 0 ? "blue" : undefined} /></section>
    <SurfaceCard as="section" className="mb-5 grid grid-cols-[190px_1fr_230px] items-center gap-7 p-6 max-[900px]:grid-cols-1">
      <div className="grid gap-1 text-center"><span className="text-xs text-[var(--text-muted)]">باقی‌مانده بودجه</span><strong className="text-2xl text-[var(--accent-strong)]">{duration(summary.remainingMinutes)}</strong></div>
      <div className="grid gap-2"><span className="text-xs text-[var(--text-muted)]">بودجه زمانی پروژه</span><ProgressBar value={summary.budgetProgress} tone={tone} /><small className="text-xs text-[var(--text-muted)]">{duration(summary.trackedMinutes)} از {fa.format(project.budgetHours ?? 0)} ساعت</small></div>
      <div className="grid gap-1 text-center"><span className="text-xs text-[var(--text-muted)]">حاشیه سود</span><strong className={summary.profit < 0 ? "text-2xl text-[var(--danger)]" : "text-2xl text-[var(--success)]"}>{financialsHidden ? "••••••" : summary.marginPercent === null ? "—" : `${fa.format(summary.marginPercent)}٪`}</strong><small className="text-xs text-[var(--text-muted)]">هزینه‌ها: <PrivateMoney value={summary.expenses} hidden={financialsHidden} /> تومان</small></div>
    </SurfaceCard>
  </>;
}
