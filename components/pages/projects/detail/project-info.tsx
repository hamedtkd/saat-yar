import { Info } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { PrivateMoney } from "@/components/common/private-money";
import { StatusBadge } from "@/components/common/status-badge";
import { SurfaceCard } from "@/components/common/surface-card";
import type { Project } from "@/lib/types";

export function ProjectInfo({ project, financialsHidden }: { project: Project; financialsHidden: boolean }) {
  return (
    <SurfaceCard as="aside" className="p-4 max-[900px]:order-first">
      <PanelHead icon={<Info />} title="اطلاعات پروژه" />
      <dl className="m-0 [&_dt]:border-t [&_dt]:border-[#edf1f2] [&_dt]:pt-[13px] [&_dt]:text-[10px] [&_dt]:text-[#6c7d89] [&_dd]:mb-[13px] [&_dd]:mt-1.5 [&_dd]:text-xs">
        <dt>وضعیت</dt><dd><StatusBadge success={project.status === "active"}>{project.status === "active" ? "فعال" : "متوقف"}</StatusBadge></dd>
        <dt>نرخ ساعتی</dt><dd><PrivateMoney value={project.rate} hidden={financialsHidden} /> تومان</dd>
        <dt>قابل صورتحساب</dt><dd>{project.billable === false ? "خیر" : "بله"}</dd>
        <dt>یادداشت‌ها</dt><dd>{project.note || "—"}</dd>
      </dl>
    </SurfaceCard>
  );
}
