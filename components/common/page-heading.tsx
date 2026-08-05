import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeading({ title, description, children, autosave = true }: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  autosave?: boolean;
}) {
  return (
    <section className={cn("mb-6 flex min-h-24 items-start justify-between gap-6 max-[620px]:min-h-0 max-[620px]:flex-col")}> 
      <div className="min-w-0">
        {autosave && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-strong)]"><CheckCircle2 className="size-4" /> ذخیره خودکار</span>}
        <h1 className="mt-2 text-[clamp(1.75rem,3vw,2.6rem)] font-black leading-tight tracking-[-.04em] text-[var(--text)]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">{description}</p>}
      </div>
      {children && <div className="row-actions flex flex-wrap items-center gap-2 max-[620px]:w-full">{children}</div>}
    </section>
  );
}
