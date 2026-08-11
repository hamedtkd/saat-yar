import type { ReactNode } from "react";
import { DescriptionTooltip } from "@/components/common/description-tooltip";
import { cn } from "@/lib/cn";

export function SectionHeading({ icon, eyebrow, title, description, trailing, className }: {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex flex-wrap items-center justify-between gap-3 px-1", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-[13px] border border-[color-mix(in_srgb,var(--accent)_18%,var(--dashboard-border))] bg-[var(--accent-soft)] text-[var(--accent-strong)] [&_svg]:size-5">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <span className="mb-0.5 block text-[9px] font-black tracking-[.08em] text-[var(--accent-strong)]">{eyebrow}</span>}
          <div className="flex min-w-0 items-center gap-1">
            <h2 className="min-w-0 text-[13px] font-black text-[var(--text)] sm:text-sm">{title}</h2>
            {description && <DescriptionTooltip content={description} />}
          </div>
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
