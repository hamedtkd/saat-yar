import { BarChart3, WalletCards } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { duration, entryMinutes, fa } from "@/lib/format";
import type { TimeEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ReportCharts({ entries, reportBillable }: { entries: TimeEntry[]; reportBillable: number }) {
  const weekValues = [12, 18, 20, 19, 14, 3, 0];
  const allMinutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const ratio = Math.round(reportBillable / Math.max(1, allMinutes) * 100);
  return (
    <section className={cn("mb-[14px] grid grid-cols-[minmax(0,1.7fr)_minmax(280px,.55fr)] gap-[14px] max-[900px]:grid-cols-1")}>
      <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "min-h-[310px] p-[18px]")}><PanelHead icon={<BarChart3 />} title="روند زمان و درآمد هفتگی" /><div className={cn("flex h-[215px] items-end justify-around gap-3 border-b border-[#dfe7e9] bg-[repeating-linear-gradient(to_top,transparent_0_44px,#eef2f2_45px)] px-4 pb-0 pt-5 [&>div]:relative [&>div]:flex [&>div]:h-full [&>div]:flex-1 [&>div]:items-end [&>div]:justify-center [&>div]:gap-[5px] [&_i]:min-h-1 [&_i]:w-[14px] [&_i]:rounded-t max-[620px]:gap-1 max-[620px]:px-0 max-[620px]:[&_i]:w-[9px] max-[620px]:[&_span]:-rotate-[35deg]")}>{weekValues.map((value, index) => <div key={index}><i className={cn("bg-gradient-to-b from-[#3d83ec] to-[#276bd5]")} style={{ height: `${value * 6}px` }} /><i className={cn("bg-gradient-to-b from-[#17ae6e] to-[#078b57]")} style={{ height: `${Math.max(8, value * 4)}px` }} /><span className="absolute top-[calc(100%+8px)] whitespace-nowrap text-[9px] text-[#6c7d89]">{["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"][index]}</span></div>)}</div><small className={cn("mt-7 block text-center text-[#6c7d89]")}>ارتفاع سبز زمان و آبی درآمد نسبی هر روز را نشان می‌دهد.</small></article>
      <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "grid place-items-center [&_.panel-head]:w-full [&_ul]:mt-[15px] [&_ul]:w-full [&_ul]:list-none [&_ul]:p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-[7px] [&_li]:p-[5px] [&_li]:text-[10px] [&_li]:text-[#6c7d89] [&_li_i]:h-[7px] [&_li_i]:w-[7px] [&_li_i]:rounded-full [&_li_strong]:mr-auto [&_li_strong]:text-[#102a3a]")}><PanelHead icon={<WalletCards />} title="خلاصه صورتحساب" /><div className={cn("relative grid h-[154px] w-[154px] place-content-center rounded-full bg-[conic-gradient(#079b60_var(--billable),#f5d994_0)] after:absolute after:inset-[18px] after:rounded-full after:bg-white after:content-[''] [&_strong]:relative [&_strong]:z-[1] [&_strong]:text-center [&_strong]:text-[27px] [&_span]:relative [&_span]:z-[1] [&_span]:text-center [&_span]:text-[9px] [&_span]:text-[#6c7d89]")} style={{ "--billable": `${ratio * 3.6}deg` } as React.CSSProperties}><strong>{fa.format(ratio)}٪</strong><span>قابل صورتحساب</span></div><ul><li><i className={cn("bg-[#079b60]")} /> قابل صورتحساب <strong>{duration(reportBillable)}</strong></li><li><i className={cn("bg-[#f2ca6f]")} /> غیرقابل صورتحساب <strong>{duration(Math.max(0, allMinutes - reportBillable))}</strong></li></ul></article>
    </section>
  );
}
