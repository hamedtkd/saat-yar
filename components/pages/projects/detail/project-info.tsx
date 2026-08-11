"use client";

import { Info } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import type { Project } from "@/lib/types";

export function ProjectInfo({ project, financialsHidden }: { project: Project; financialsHidden: boolean }) {
  const { b } = useBusinessUi();
  return (
    <SurfaceCard as="aside" className="p-4 max-[900px]:order-first">
      <PanelHead icon={<Info />} title={b("projects.info.title")} />
      <dl className="m-0 [&_dt]:border-t [&_dt]:border-[var(--border)] [&_dt]:pt-[13px] [&_dt]:text-[10px] [&_dt]:text-[var(--text-muted)] [&_dd]:mb-[13px] [&_dd]:mt-1.5 [&_dd]:text-xs">
        <dt>{b("common.status")}</dt><dd><StatusBadge success={project.status === "active"}>{project.status === "active" ? b("common.active") : b("common.paused")}</StatusBadge></dd>
        <dt>{b("projects.info.rate")}</dt><dd><PrivateMoney value={project.rate} hidden={financialsHidden} /> {b("common.toman")}</dd>
        <dt>{b("projects.info.billable")}</dt><dd>{project.billable === false ? b("common.no") : b("common.yes")}</dd>
        <dt>{b("projects.info.notes")}</dt><dd>{project.note || "—"}</dd>
      </dl>
    </SurfaceCard>
  );
}
