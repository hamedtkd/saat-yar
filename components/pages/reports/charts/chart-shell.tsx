import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ChartShell({ children }: { children: ReactNode }) {
  return (
    <article className={cn(
      "min-w-0 rounded-2xl border border-[var(--border)]",
      "bg-[var(--surface-glass)] p-4 shadow-[0_12px_38px_rgba(17,45,55,0.055)] sm:p-5 print:break-inside-avoid print:bg-white print:p-3 print:shadow-none",
    )}>
      {children}
    </article>
  );
}

export function ChartsGrid({ children }: { children: ReactNode }) {
  return (
    <section className={cn(
      "mb-4 grid gap-4",
      "grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] max-[1050px]:grid-cols-1 print:grid-cols-1",
    )}>
      {children}
    </section>
  );
}
