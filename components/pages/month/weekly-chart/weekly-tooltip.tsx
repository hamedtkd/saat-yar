"use client";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import type { WeeklyChartItem } from "./types";

type TooltipPayloadItem = { value?: number; payload?: WeeklyChartItem };
type WeeklyTooltipProps = { active?: boolean; payload?: TooltipPayloadItem[] };

export function WeeklyTooltip({ active, payload }: WeeklyTooltipProps) {
  const { t, duration, direction } = useLocaleUi();
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  const minutes = item?.minutes ?? payload[0]?.value ?? 0;
  return <div dir={direction} className={cn("min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3", "shadow-[0_8px_24px_rgba(0,0,0,.12)] backdrop-blur-xl")}>
    <strong className="block text-xs font-extrabold text-[var(--text)]">{item?.dayFull}</strong>
    {item?.dateLabel && <span className="mt-0.5 block text-[9px] text-[var(--text-muted)]">{item.dateLabel}</span>}
    <div className="mt-2 flex items-center justify-between gap-6"><span className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]"><i className="size-2 rounded-full bg-[var(--accent)]" />{t("common.worked")}</span><strong dir="ltr" className="text-xs font-extrabold text-[var(--text)]">{duration(minutes)}</strong></div>
    {item?.holiday && <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[var(--danger)]"><i className="size-2 rounded-full bg-[var(--danger)]" />{item.holidayLabel || t("common.holiday")}</div>}
    {item?.leave && <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[var(--info)]"><i className="size-2 rounded-full bg-[var(--info)]" />{t("month.details.leave")}</div>}
  </div>;
}
