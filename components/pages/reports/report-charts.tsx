import { BarChart3, WalletCards } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { duration, entryMinutes, fa } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { TimeEntry } from "@/lib/types";

export function ReportCharts({ entries, reportBillable }: { entries: TimeEntry[]; reportBillable: number }) {
  const weekValues = [12, 18, 20, 19, 14, 3, 0];
  const allMinutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const ratio = Math.round(reportBillable / Math.max(1, allMinutes) * 100);
  return (
    <section className={tw("charts-grid")}>
      <article className={tw("panel", "chart-card")}><PanelHead icon={<BarChart3 />} title="روند زمان و درآمد هفتگی" /><div className={tw("dual-chart")}>{weekValues.map((value, index) => <div key={index}><i className={tw("income")} style={{ height: `${value * 6}px` }} /><i className={tw("time")} style={{ height: `${Math.max(8, value * 4)}px` }} /><span className="absolute top-[calc(100%+8px)] whitespace-nowrap text-[9px] text-[#6c7d89]">{["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"][index]}</span></div>)}</div><small className={tw("chart-note")}>ارتفاع سبز زمان و آبی درآمد نسبی هر روز را نشان می‌دهد.</small></article>
      <article className={tw("panel", "donut-card")}><PanelHead icon={<WalletCards />} title="خلاصه صورتحساب" /><div className={tw("donut")} style={{ "--billable": `${ratio * 3.6}deg` } as React.CSSProperties}><strong>{fa.format(ratio)}٪</strong><span>قابل صورتحساب</span></div><ul><li><i className={tw("green")} /> قابل صورتحساب <strong>{duration(reportBillable)}</strong></li><li><i className={tw("amber")} /> غیرقابل صورتحساب <strong>{duration(Math.max(0, allMinutes - reportBillable))}</strong></li></ul></article>
    </section>
  );
}
