import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ChartShell({ children }: { children: ReactNode }) {
  return (
    <article className={cn(
      "min-w-0 rounded-2xl border border-[var(--border)]",
      "bg-[var(--surface-glass)] p-4 shadow-[0_12px_38px_rgba(17,45,55,0.055)] sm:p-5",
    )}>
      {children}
    </article>
  );
}

export function ChartsGrid({ children }: { children: ReactNode }) {
  return (
    <section className={cn(
      "mb-4 grid gap-4",
      "grid-cols-[minmax(0,1.8fr)_minmax(290px,0.6fr)] max-[1050px]:grid-cols-1",
    )}>
      {children}
    </section>
  );
}
