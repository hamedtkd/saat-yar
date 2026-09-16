import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

export function SurfaceCard({ as: Component = "section", className, ...props }: SurfaceCardProps) {
  return (
    <Component
      className={cn(
        "dashboard-card min-w-0 max-w-full rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] text-[var(--text)] shadow-[var(--surface-shadow)] transition-[border-color,background-color,box-shadow]",
        className,
      )}
      {...props}
    />
  );
}
