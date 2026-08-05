import { ChevronLeft, Folder, Plus, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PrivateMoney } from "@/components/common/private-money";
import { ProgressBar } from "@/components/common/progress-bar";
import { StatusBadge } from "@/components/common/status-badge";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { duration, fa } from "@/lib/format";
import { getProjectFinanceSummary } from "@/lib/project-finance";
import type { AppData } from "@/lib/types";

export function ProjectList({ data, onSelect, onCreate, financialsHidden }: { data: AppData; onSelect: (id: string) => void; onCreate: () => void; financialsHidden: boolean }) {
  return (
    <section className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      {data.projects.map((project) => {
        const summary = getProjectFinanceSummary(project, data.timeEntries, data.expenses);
        const progressTone = summary.budgetStatus === "exceeded" ? "danger" : summary.budgetStatus === "warning" ? "warning" : "accent";
        return <SurfaceCard as="article" className="group cursor-pointer p-5 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]" key={project.id} onClick={() => onSelect(project.id)}>
          <div className="grid grid-cols-[12px_1fr_auto] items-center gap-3"><span className="h-11 rounded-full" style={{ background: project.color }} /><div className="min-w-0"><strong className="block truncate text-base text-[var(--text)]">{project.name}</strong><small className="text-[var(--text-muted)]">{data.clients.find((client) => client.id === project.clientId)?.name ?? "بدون مشتری"}</small></div><StatusBadge success={project.status === "active"}>{project.status === "active" ? "فعال" : project.status === "paused" ? "متوقف" : "تکمیل"}</StatusBadge></div>
          {summary.budgetStatus !== "healthy" && summary.budgetStatus !== "none" && <div className="mt-4 flex items-center gap-2 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--warning-soft)] px-3 py-2 text-[11px] text-[var(--warning)]"><TriangleAlert className="size-4" />{summary.budgetStatus === "exceeded" ? "بودجه زمانی تمام شده" : "بودجه به ۸۰٪ رسیده"}</div>}
          <div className="my-5 grid grid-cols-2 gap-3"><div className="rounded-[var(--control-radius)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]"><span>زمان ثبت‌شده</span><strong className="mt-1 block text-lg text-[var(--text)]">{duration(summary.trackedMinutes)}</strong></div><div className="rounded-[var(--control-radius)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]"><span>سود خالص</span><strong className="mt-1 block text-lg text-[var(--text)]"><PrivateMoney value={summary.profit} hidden={financialsHidden} /></strong></div></div>
          <div className="mb-5"><div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]"><span>مصرف بودجه</span><b className="text-[var(--text)]">{fa.format(summary.budgetProgress)}٪</b></div><ProgressBar value={summary.budgetProgress} tone={progressTone} /></div>
          <Button variant="outline" className="w-full">مشاهده جزئیات <ChevronLeft /></Button>
        </SurfaceCard>;
      })}
      {data.projects.length === 0 && <SurfaceCard as="article" className="col-span-full grid min-h-[290px] place-content-center justify-items-center p-5 text-center"><EmptyState large icon={<Folder />} title="اولین پروژه‌ات را بساز" description="پروژه را به مشتری متصل کن، بودجه و نرخ را مشخص کن و تایمر را شروع کن."><Button onClick={onCreate}><Plus /> پروژه جدید</Button></EmptyState></SurfaceCard>}
    </section>
  );
}
