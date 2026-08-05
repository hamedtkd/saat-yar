import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

export function SurfaceCard({ as: Component = "section", className, ...props }: SurfaceCardProps) {
  return (
    <Component
      className={cn(
        "rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)] shadow-[0_8px_24px_rgba(0,0,0,.045)] transition-colors dark:shadow-[0_10px_30px_rgba(0,0,0,.16)]",
        className,
      )}
      {...props}
    />
  );
}
