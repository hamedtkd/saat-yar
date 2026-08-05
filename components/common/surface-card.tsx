import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

export function SurfaceCard({ as: Component = "section", className, ...props }: SurfaceCardProps) {
  return (
    <Component
      className={cn(
        "rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)] shadow-[0_18px_55px_rgba(0,0,0,.08)] transition-colors dark:shadow-[0_20px_70px_rgba(0,0,0,.28)]",
        className,
      )}
      {...props}
    />
  );
}
