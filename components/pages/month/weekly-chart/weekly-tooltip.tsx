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
  const minutes = payload[0]?.value ?? 0;
  return <div dir={direction} className={cn("min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3", "shadow-[0_8px_24px_rgba(0,0,0,.12)] backdrop-blur-xl")}>
    <strong className="block text-xs font-extrabold text-[var(--text)]">{item?.dayFull}</strong>
    <div className="mt-2 flex items-center justify-between gap-6"><span className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]"><i className="size-2 rounded-full bg-[var(--accent)]" />{t("common.worked")}</span><strong dir="ltr" className="text-xs font-extrabold text-[var(--text)]">{duration(minutes)}</strong></div>
  </div>;
}
