import type { ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PanelHead } from "@/components/common/panel-head";
import { duration, fa } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ChartShell } from "./chart-shell";
import { DonutTooltip } from "./chart-tooltips";
import type { DonutItem } from "./types";

export function DonutSummary({ icon, title, description, data, ratio, ratioLabel, footerLabel, footerValue, footerTone = "neutral" }: {
  icon: ReactNode;
  title: string;
  description: string;
  data: DonutItem[];
  ratio: number;
  ratioLabel: string;
  footerLabel: string;
  footerValue: string;
  footerTone?: "positive" | "negative" | "neutral";
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <ChartShell>
      <PanelHead icon={icon} title={title} />
      <p className="mb-2 text-[10px] leading-6 text-[var(--text-muted)]">{description}</p>
      <div className="relative h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip content={<DonutTooltip />} /><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={64} outerRadius={88} startAngle={90} endAngle={-270} paddingAngle={total > 0 ? 3 : 0} cornerRadius={8} stroke="none">{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="-translate-y-1 text-center"><strong className="block text-3xl font-black text-[var(--text)]">{fa.format(ratio)}٪</strong><span className="mt-1 block text-[9px] text-[var(--text-muted)]">{ratioLabel}</span></div></div>
      </div>
      <div className="mt-1 grid gap-2">{data.map((item) => <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-3 py-2.5"><span className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]"><i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><strong dir="ltr" className="text-xs font-extrabold text-[var(--text)]">{duration(item.value)}</strong></div>)}</div>
      <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3"><span className="text-[10px] font-semibold text-[var(--text-muted)]">{footerLabel}</span><strong dir="ltr" className={cn("text-sm font-extrabold", footerTone === "positive" && "text-[var(--accent-strong)]", footerTone === "negative" && "text-[var(--danger)]", footerTone === "neutral" && "text-[var(--text)]")}>{footerValue}</strong></div>
    </ChartShell>
  );
}
