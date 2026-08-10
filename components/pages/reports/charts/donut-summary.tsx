"use client";

import type { ReactNode } from "react";
import { CircleDashed } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PanelHead } from "@/components/common/panel-head";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { cn } from "@/lib/cn";
import { ChartEmptyState } from "./chart-empty-state";
import { ChartShell } from "./chart-shell";
import { DonutTooltip } from "./chart-tooltips";
import type { DonutItem } from "./types";

export function DonutSummary({ icon, title, description, data, ratio, ratioLabel, footerLabel, footerValue, footerTone = "neutral" }: { icon: ReactNode; title: string; description: string; data: DonutItem[]; ratio: number; ratioLabel: string; footerLabel: string; footerValue: string; footerTone?: "positive" | "negative" | "neutral" }) {
  const { t, duration, percent } = useLocaleUi();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <ChartShell className="flex h-full flex-col"><PanelHead icon={icon} title={title} /><p className="text-[10px] leading-6 text-[var(--text-muted)]">{description}</p>{total > 0 ? <><div className="relative mx-auto h-[210px] w-full max-w-[310px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip content={<DonutTooltip />} /><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={82} startAngle={90} endAngle={-270} paddingAngle={3} cornerRadius={7} stroke="none">{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><strong className="block text-3xl font-black text-[var(--text)]">{percent(ratio)}</strong><span className="mt-1 block text-[9px] text-[var(--text-muted)]">{ratioLabel}</span></div></div></div><div className="grid gap-2">{data.map((item) => <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"><span className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]"><i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><strong dir="ltr" className="text-xs font-extrabold text-[var(--text)]">{duration(item.value)}</strong></div>)}</div></> : <div className="mt-4"><ChartEmptyState compact icon={<CircleDashed className="size-5" />} title={t("reports.charts.notEnough")} description={t("reports.charts.notEnoughHint")} /></div>}<div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3"><span className="text-[10px] font-semibold text-[var(--text-muted)]">{footerLabel}</span><strong dir="ltr" className={cn("text-sm font-extrabold", footerTone === "positive" && "text-[var(--accent-strong)]", footerTone === "negative" && "text-[var(--danger)]", footerTone === "neutral" && "text-[var(--text)]")}>{footerValue}</strong></div></ChartShell>;
}
