"use client";

import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { DescriptionTooltip } from "@/components/common/description-tooltip";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";

export function PageHeading({ title, description, children, autosave = true, variant = "default" }: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  autosave?: boolean;
  variant?: "default" | "dashboard";
}) {
  const { t } = useLocale();
  if (variant === "dashboard") {
    return (
      <section className="dashboard-card mb-4 grid min-h-[104px] grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] px-5 py-4 shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[780px]:grid-cols-1 max-[780px]:text-center">
        <div className="max-[780px]:order-2 max-[780px]:mx-auto">{children}</div>
        <div className="min-w-0 text-center max-[780px]:order-1">
          <div className="inline-flex max-w-full items-center justify-center gap-1.5">
            <h1 className="min-w-0 text-[clamp(1.25rem,2.3vw,2rem)] font-black leading-tight tracking-[-.035em] text-[var(--text)]">{title}</h1>
            {description && <DescriptionTooltip content={description} />}
          </div>
        </div>
        <div className="flex justify-end max-[780px]:hidden">
          {autosave && <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--accent-strong)]"><CheckCircle2 className="size-3.5" /> {t("common.autosave")}</span>}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("dashboard-card mb-5 flex min-w-0 max-w-full min-h-[98px] items-center justify-between gap-6 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] px-5 py-4 shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[720px]:min-h-0 max-[720px]:flex-col max-[720px]:items-stretch sm:px-6") }>
      <div className="min-w-0">
        {autosave && <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--accent-strong)]"><CheckCircle2 className="size-3.5" /> {t("common.autosave")}</span>}
        <div className="mt-2 flex min-w-0 items-center gap-1.5">
          <h1 className="min-w-0 text-[clamp(1.4rem,2.5vw,2.15rem)] font-black leading-tight tracking-[-.035em] text-[var(--text)]">{title}</h1>
          {description && <DescriptionTooltip content={description} />}
        </div>
      </div>
      {children && <div className="row-actions flex min-w-0 max-w-full flex-wrap items-center gap-2 max-[720px]:w-full [&>*]:max-w-full">{children}</div>}
    </section>
  );
}
