import { BarChart3, Info } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { duration } from "@/lib/format";
import { cn } from "@/lib/cn";
export function WeeklyChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <aside className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "flex flex-col p-[22px] max-[620px]:p-[14px]")}>
      <PanelHead icon={<BarChart3 />} title="کارکرد هفتگی" />
      <div className={cn("my-[25px] grid h-[270px] grid-cols-7 items-end gap-2 [&>div]:grid [&>div]:h-full [&>div]:grid-rows-[25px_1fr_20px] [&>div]:gap-[5px] [&>div]:text-center [&_span]:text-[9px] [&_span]:text-[#6c7d89] [&_small]:text-[9px] [&_small]:text-[#6c7d89] [&_i]:flex [&_i]:h-full [&_i]:items-end [&_i]:justify-center [&_i]:rounded-lg [&_i]:bg-[#f1f6f4] [&_i]:p-[3px] [&_b]:block [&_b]:w-full [&_b]:rounded-md [&_b]:bg-gradient-to-b [&_b]:from-[#31b47e] [&_b]:to-[#16875b] max-[900px]:h-[210px]")}>{values.map((value, index) => <div key={index}><span>{duration(value)}</span><i><b style={{ height: `${Math.max(4, value / max * 100)}%` }} /></i><small>{["ش", "ی", "د", "س", "چ", "پ", "ج"][index]}</small></div>)}</div>
      <p className={cn("mt-3 flex items-start gap-[7px] text-[10px] leading-[1.8] text-[#6c7d89] [&_svg]:mt-0.5 [&_svg]:w-[14px] [&_svg]:flex-none")}><Info />نمودار از رکوردهای همین ماه محاسبه می‌شود و داده مشتق‌شده جداگانه ذخیره نمی‌گردد.</p>
    </aside>
  );
}
