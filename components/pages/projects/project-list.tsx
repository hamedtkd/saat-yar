"use client";

import { ChevronLeft, Folder, Plus, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PrivateMoney } from "@/components/common/private-money";
import { ProgressBar } from "@/components/common/progress-bar";
import { StatusBadge } from "@/components/common/status-badge";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import { useRuntimeNow } from "@/hooks/use-runtime-now";
import { getProjectFinanceSummary } from "@/lib/project-finance";
import type { AppData } from "@/lib/types";

export function ProjectList({ data, onSelect, onCreate, financialsHidden }: { data: AppData; onSelect: (id: string) => void; onCreate: () => void; financialsHidden: boolean }) {
  const { b, duration, percent } = useBusinessUi();
  const timerActive = data.timeEntries.some((entry) => !entry.endedAt);
  const runtimeNow = useRuntimeNow("minute", timerActive);
  const now = runtimeNow ?? 0;

  return (
    <section className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      {data.projects.map((project) => {
        const summary = getProjectFinanceSummary(project, data.timeEntries, data.expenses, now);
        const progressTone = summary.budgetStatus === "exceeded" ? "danger" : summary.budgetStatus === "warning" ? "warning" : "accent";
        const statusLabel = project.status === "active" ? b("common.active") : project.status === "paused" ? b("common.paused") : b("common.completed");
        return <SurfaceCard as="article" className="group cursor-pointer p-5 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_32%,var(--dashboard-border))] hover:shadow-[0_14px_34px_rgba(0,0,0,.07)]" key={project.id} onClick={() => onSelect(project.id)}>
          <div className="grid grid-cols-[12px_1fr_auto] items-center gap-3"><span className="h-11 rounded-full" style={{ background: project.color }} /><div className="min-w-0"><strong className="block truncate text-base text-[var(--text)]">{project.name}</strong><small className="text-[var(--text-muted)]">{data.clients.find((client) => client.id === project.clientId)?.name ?? b("projects.list.noClient")}</small></div><StatusBadge success={project.status === "active"}>{statusLabel}</StatusBadge></div>
          {summary.budgetStatus !== "healthy" && summary.budgetStatus !== "none" && <div className="mt-4 flex items-center gap-2 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--warning-soft)] px-3 py-2 text-[11px] text-[var(--warning)]"><TriangleAlert className="size-4" />{summary.budgetStatus === "exceeded" ? b("projects.list.budgetExceeded") : b("projects.list.budgetWarning")}</div>}
          <div className="my-5 grid grid-cols-2 gap-3"><div className="rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]"><span>{b("projects.list.tracked")}</span><strong className="mt-1 block text-lg text-[var(--text)]">{duration(summary.trackedMinutes)}</strong></div><div className="rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]"><span>{b("projects.list.profit")}</span><strong className="mt-1 block text-lg text-[var(--text)]"><PrivateMoney value={summary.profit} hidden={financialsHidden} /></strong></div></div>
          <div className="mb-5"><div className="mb-2 flex justify-between text-xs text-[var(--text-muted)]"><span>{b("projects.list.budgetUsage")}</span><b className="text-[var(--text)]">{percent(summary.budgetProgress)}</b></div><ProgressBar value={summary.budgetProgress} tone={progressTone} /></div>
          <Button variant="outline" className="w-full">{b("projects.list.details")} <ChevronLeft /></Button>
        </SurfaceCard>;
      })}
      {data.projects.length === 0 && <SurfaceCard as="article" className="col-span-full grid min-h-[290px] place-content-center justify-items-center p-5 text-center"><EmptyState large icon={<Folder />} title={b("projects.empty.title")} description={b("projects.empty.description")}><Button onClick={onCreate}><Plus /> {b("projects.new")}</Button></EmptyState></SurfaceCard>}
    </section>
  );
}
