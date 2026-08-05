import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
export function EmptyState({ icon, title, description, compact = false, large = false, children }: {
  icon: ReactNode;
  title?: string;
  description?: string;
  compact?: boolean;
  large?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={cn("grid min-h-[145px] place-content-center justify-items-center gap-[5px] text-center text-[var(--text-muted)] [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-[var(--text-muted)]/60 [&_strong]:text-[var(--text)] [&_span]:text-[10px]", compact && "min-h-[90px]", large && "col-span-full min-h-[290px]")}>
      {icon}{title && <strong>{title}</strong>}{description && <span>{description}</span>}{children}
    </div>
  );
}
