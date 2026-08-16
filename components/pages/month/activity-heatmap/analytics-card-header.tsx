import type { ReactNode } from "react";
import { DescriptionTooltip } from "@/components/common/description-tooltip";

export function AnalyticsCardHeader({
  icon,
  title,
  description,
  trailing,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3" data-month-analytics-card-header>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] [&_svg]:size-4.5">
          {icon}
        </span>
        <div className="flex min-w-0 items-center gap-1">
          <h3 className="truncate text-sm font-black text-[var(--text)]">{title}</h3>
          <DescriptionTooltip content={description} />
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
