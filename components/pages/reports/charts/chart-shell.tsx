import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ChartShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article className={cn(
      "min-w-0 rounded-2xl border border-[var(--border)]",
      "bg-[var(--surface-glass)] p-4 shadow-[0_12px_38px_rgba(17,45,55,0.055)] sm:p-5 print:break-inside-avoid print:bg-[var(--surface-1)] print:p-3 print:shadow-none",
      className,
    )}>
      {children}
    </article>
  );
}

export function ChartsGrid({ children }: { children: ReactNode }) {
  return (
    <section className={cn(
      "report-charts mb-4 grid items-stretch gap-4 print:hidden",
      "grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] max-[1050px]:grid-cols-1",
    )}>
      {children}
    </section>
  );
}
