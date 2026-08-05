import { Clock3, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { PrivateMoney } from "@/components/common/private-money";
import { SurfaceCard } from "@/components/common/surface-card";
import { duration, fa } from "@/lib/format";
import type { Project } from "@/lib/types";
import type { ProjectFinanceSummary } from "@/lib/project-finance";
import { cn } from "@/lib/cn";

export function ProjectSummary({ project, summary, financialsHidden }: {
  project: Project;
  summary: ProjectFinanceSummary;
  financialsHidden: boolean;
}) {
  const progress = Math.min(100, summary.budgetProgress);
  return <>
    <section className="mb-[18px] grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      <MetricCard icon={<Clock3 />} label="زمان ثبت‌شده" value={duration(summary.trackedMinutes)} suffix="ساعت" />
      <MetricCard icon={<TrendingUp />} label="مصرف بودجه" value={`${fa.format(summary.budgetProgress)}٪`} suffix={`از ${fa.format(project.budgetHours ?? 0)} ساعت`} />
      <MetricCard icon={<WalletCards />} label="درآمد ثبت‌شده" value={<PrivateMoney value={summary.revenue} hidden={financialsHidden} />} suffix="تومان" />
      <MetricCard icon={<TrendingDown />} label="سود خالص" value={<PrivateMoney value={summary.profit} hidden={financialsHidden} />} suffix="تومان" tone={summary.profit < 0 ? "blue" : undefined} />
    </section>
    <SurfaceCard as="section" className="mb-[18px] grid grid-cols-[190px_1fr_230px] items-center gap-7 px-6 py-[18px] max-[900px]:grid-cols-1">
      <div className="grid gap-1 text-center"><span className="text-[10px] text-[#6c7d89]">باقی‌مانده بودجه</span><strong className="text-[22px] text-[#079b60]">{duration(summary.remainingMinutes)}</strong></div>
      <div className="grid gap-1"><span className="text-[10px] text-[#6c7d89]">بودجه زمانی پروژه</span><i className="my-2 block h-[7px] overflow-hidden rounded-[10px] bg-[#e8edef]"><b className={cn("block h-full rounded-[inherit]", summary.budgetStatus === "exceeded" ? "bg-red-500" : summary.budgetStatus === "warning" ? "bg-amber-500" : "bg-[#079b60]")} style={{ width: `${progress}%` }} /></i><small className="text-[10px] text-[#6c7d89]">{duration(summary.trackedMinutes)} از {fa.format(project.budgetHours ?? 0)} ساعت</small></div>
      <div className="grid gap-1 text-center"><span className="text-[10px] text-[#6c7d89]">حاشیه سود</span><strong className={cn("text-[22px]", summary.profit < 0 ? "text-red-600" : "text-[#079b60]")}>{financialsHidden ? "••••••" : summary.marginPercent === null ? "—" : `${fa.format(summary.marginPercent)}٪`}</strong><small className="text-[10px] text-[#6c7d89]">هزینه‌ها: <PrivateMoney value={summary.expenses} hidden={financialsHidden} /> تومان</small></div>
    </SurfaceCard>
  </>;
}
