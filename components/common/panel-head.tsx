import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
export function PanelHead({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className={cn("mb-3 flex min-h-[37px] items-start justify-between gap-3 [&>div:first-child]:flex [&>div:first-child]:items-center [&>div:first-child]:gap-2 [&_h2]:m-0 [&_h2]:text-[15px] [&_svg]:text-[#079b60]")}>
      <div>{icon}<h2>{title}</h2></div>
      {children}
    </div>
  );
}
