import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ChartShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article className={cn(
      "dashboard-card min-w-0 rounded-[var(--card-radius)] border border-[var(--dashboard-border)]",
      "bg-[var(--surface-1)] p-4 shadow-[0_6px_20px_rgba(0,0,0,.035)] sm:p-5 print:break-inside-avoid print:bg-[var(--surface-1)] print:p-3 print:shadow-none",
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
