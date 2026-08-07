import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

export function SurfaceCard({ as: Component = "section", className, ...props }: SurfaceCardProps) {
  return (
    <Component
      className={cn(
        "dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] text-[var(--text)] shadow-[0_6px_20px_rgba(0,0,0,.035)] transition-[border-color,background-color,box-shadow] dark:shadow-[0_10px_28px_rgba(0,0,0,.16)]",
        className,
      )}
      {...props}
    />
  );
}
