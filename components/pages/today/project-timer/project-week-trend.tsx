"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BarChart3 } from "lucide-react";

import { DescriptionTooltip } from "@/components/common/description-tooltip";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { MONTH_CHART_THEME } from "@/components/pages/month/weekly-chart/chart-theme";

type TrendItem = { key: string; minutes: number };
type TooltipPayloadItem = { value?: number; payload?: TrendItem };
type TrendTooltipProps = { active?: boolean; payload?: TooltipPayloadItem[] };

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  const { date, duration } = useLocaleUi();
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 shadow-[0_8px_24px_rgba(0,0,0,.14)] backdrop-blur-xl">
      <strong className="block text-[11px] font-extrabold text-[var(--text)]">{date(item.key, { weekday: "long", day: "numeric", month: "short" })}</strong>
      <span className="mt-1 block text-[10px] font-bold text-[var(--accent-strong)]">{duration(item.minutes)}</span>
    </div>
  );
}

export function ProjectWeekTrend({ trend }: { trend: TrendItem[] }) {
  const { date, t } = useLocaleUi();
  const visualData = trend.map((item) => ({ ...item, day: date(item.key, { weekday: "narrow" }) }));

  return (
    <section data-project-week-trend className="mt-3 border-t border-[var(--dashboard-border)] pt-3 max-[359px]:mt-2.5 max-[359px]:pt-2.5">
      <div className="flex items-start justify-between gap-3 max-[359px]:gap-2">
        <div className="grid gap-0.5">
          <strong className="flex items-center gap-2 text-[11px] font-black text-[var(--text)] max-[359px]:text-[10px]">
            <BarChart3 aria-hidden="true" className="size-3.5 text-[var(--accent-strong)]" />
            {t("today.timer.weekTrend")}
          </strong>
          <span className="text-[9px] leading-4 text-[var(--text-muted)] max-[359px]:text-[8px]">{t("today.timer.weekTrendVisibleHint")}</span>
        </div>
        <DescriptionTooltip content={t("today.timer.weekTrendTooltip")} />
      </div>

      <div className="mt-2 h-[68px] w-full min-w-0 max-[359px]:h-[60px] sm:h-[76px]" role="img" aria-label={t("today.timer.weekTrend")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={visualData} margin={{ top: 8, right: 2, bottom: 0, left: 2 }}>
            <CartesianGrid vertical={false} stroke={MONTH_CHART_THEME.grid} strokeDasharray="4 5" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MONTH_CHART_THEME.text, fontSize: 9, fontFamily: "inherit" }}
              tickMargin={6}
            />
            <Tooltip cursor={{ fill: MONTH_CHART_THEME.cursor, radius: 8 }} content={<TrendTooltip />} />
            <Bar dataKey="minutes" fill={MONTH_CHART_THEME.accent} radius={[6, 6, 2, 2]} maxBarSize={24} minPointSize={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
