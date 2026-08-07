import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeading({ title, description, children, autosave = true, variant = "default" }: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  autosave?: boolean;
  variant?: "default" | "dashboard";
}) {
  if (variant === "dashboard") {
    return (
      <section className="dashboard-card mb-4 grid min-h-[118px] grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] px-5 py-4 shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[780px]:grid-cols-1 max-[780px]:text-center">
        <div className="max-[780px]:order-2 max-[780px]:mx-auto">{children}</div>
        <div className="min-w-0 text-center max-[780px]:order-1">
          <h1 className="text-[clamp(1.25rem,2.3vw,2rem)] font-black leading-tight tracking-[-.035em] text-[var(--text)]">{title}</h1>
          {description && <p className="mt-2 text-[11px] font-semibold text-[var(--text-muted)]">{description}</p>}
        </div>
        <div className="flex justify-end max-[780px]:hidden">
          {autosave && <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--accent-strong)]"><CheckCircle2 className="size-3.5" /> ذخیره خودکار</span>}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("dashboard-card mb-5 flex min-h-[112px] items-center justify-between gap-6 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] px-5 py-4 shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[720px]:min-h-0 max-[720px]:flex-col max-[720px]:items-stretch sm:px-6") }>
      <div className="min-w-0">
        {autosave && <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent-strong)]"><CheckCircle2 className="size-3.5" /> ذخیره خودکار</span>}
        <h1 className="mt-2 text-[clamp(1.4rem,2.5vw,2.15rem)] font-black leading-tight tracking-[-.035em] text-[var(--text)]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-[var(--text-muted)]">{description}</p>}
      </div>
      {children && <div className="row-actions flex flex-wrap items-center gap-2 max-[720px]:w-full">{children}</div>}
    </section>
  );
}
