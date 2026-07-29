import { BarChart3, Info } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { duration } from "@/lib/format";
import { tw } from "@/lib/tw";

export function WeeklyChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <aside className={tw("panel", "weekly-chart")}>
      <PanelHead icon={<BarChart3 />} title="کارکرد هفتگی" />
      <div className={tw("weekly-bars")}>{values.map((value, index) => <div key={index}><span>{duration(value)}</span><i><b style={{ height: `${Math.max(4, value / max * 100)}%` }} /></i><small>{["ش", "ی", "د", "س", "چ", "پ", "ج"][index]}</small></div>)}</div>
      <p className={tw("helper")}><Info />نمودار از رکوردهای همین ماه محاسبه می‌شود و داده مشتق‌شده جداگانه ذخیره نمی‌گردد.</p>
    </aside>
  );
}
