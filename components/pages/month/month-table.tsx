import { CalendarDays, Edit3, FileSpreadsheet } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { calc } from "@/lib/time-engine";
import { duration, faDigits, jalali } from "@/lib/format";
import type { WorkRecord } from "@/lib/types";
import { cn } from "@/lib/cn";

export function MonthTable({ records, dailyTarget, onEdit }: { records: WorkRecord[]; dailyTarget: number; onEdit: (date: string) => void }) {
  return (
    <section className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "min-w-0 p-[13px]", "mb-[18px]")}>
      <PanelHead icon={<FileSpreadsheet />} title="جزئیات روزانه" />
      <div className={cn("w-full overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px] [&_th]:h-[39px] [&_th]:whitespace-nowrap [&_th]:border-y [&_th]:border-[#edf1f2] [&_th]:bg-[#fbfcfc] [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-semibold [&_th]:text-[#536975] [&_td]:min-h-[46px] [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf1f2] [&_td]:px-3 [&_td]:py-[9px] [&_td]:text-[#2e4856] [&_td_strong]:flex [&_td_strong]:items-center [&_td_strong]:gap-[7px] [&_td_strong]:text-[11px] [&_td_strong]:text-[#102a3a] [&_td_strong>i]:h-[7px] [&_td_strong>i]:w-[7px] [&_td_strong>i]:rounded-full [&_td_small]:mt-[3px] [&_td_small]:block [&_td_small]:text-[9px] [&_td_small]:text-[#6c7d89] [&_td_input]:min-w-[175px]")}><table><thead><tr><th>تاریخ</th><th>ورود</th><th>خروج</th><th>کارکرد</th><th>وقفه</th><th>تراز</th><th>یادداشت</th><th>ویرایش</th></tr></thead><tbody>
        {records.map((item) => {
          const result = calc(item, dailyTarget);
          return <tr key={item.date}><td>{jalali(item.date, { day: "numeric", month: "long" })}</td><td>{faDigits(item.start || "—")}</td><td>{faDigits(item.end || "—")}</td><td>{duration(result.worked)}</td><td>{duration(result.breakMinutes + item.lunchMinutes)}</td><td className={cn(result.balance >= 0 ? "text-[#079b60]" : "text-[#e54845]")}>{duration(result.balance, true)}</td><td>{item.note || "—"}</td><td><Button variant="outline" size="icon" onClick={() => onEdit(item.date)}><Edit3 /></Button></td></tr>;
        })}
        {records.length === 0 && <tr><td colSpan={8}><EmptyState icon={<CalendarDays />} title="برای این ماه رکوردی نیست" description="از صفحه امروز، شروع و پایان روز را ثبت کن." /></td></tr>}
      </tbody></table></div>
    </section>
  );
}
