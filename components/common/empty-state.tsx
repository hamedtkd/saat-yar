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
    <div className={cn("grid min-h-[145px] place-content-center justify-items-center gap-[5px] text-center text-[#6c7d89] [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-[#a9b8be] [&_strong]:text-[#102a3a] [&_span]:text-[10px]", compact && "min-h-[90px]", large && "col-span-full min-h-[290px]")}>
      {icon}{title && <strong>{title}</strong>}{description && <span>{description}</span>}{children}
    </div>
  );
}
