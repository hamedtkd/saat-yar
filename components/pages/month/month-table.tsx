import { CalendarDays, Edit3, FileSpreadsheet } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { calc } from "@/lib/time-engine";
import { duration, faDigits, jalali } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { WorkRecord } from "@/lib/types";

export function MonthTable({ records, dailyTarget, onEdit }: { records: WorkRecord[]; dailyTarget: number; onEdit: (date: string) => void }) {
  return (
    <section className={tw("panel", "table-panel", "month-table")}>
      <PanelHead icon={<FileSpreadsheet />} title="جزئیات روزانه" />
      <div className={tw("table-wrap")}><table><thead><tr><th>تاریخ</th><th>ورود</th><th>خروج</th><th>کارکرد</th><th>وقفه</th><th>تراز</th><th>یادداشت</th><th>ویرایش</th></tr></thead><tbody>
        {records.map((item) => {
          const result = calc(item, dailyTarget);
          return <tr key={item.date}><td>{jalali(item.date, { day: "numeric", month: "long" })}</td><td>{faDigits(item.start || "—")}</td><td>{faDigits(item.end || "—")}</td><td>{duration(result.worked)}</td><td>{duration(result.breakMinutes + item.lunchMinutes)}</td><td className={tw(result.balance >= 0 ? "positive" : "negative")}>{duration(result.balance, true)}</td><td>{item.note || "—"}</td><td><Button variant="outline" size="icon" onClick={() => onEdit(item.date)}><Edit3 /></Button></td></tr>;
        })}
        {records.length === 0 && <tr><td colSpan={8}><EmptyState icon={<CalendarDays />} title="برای این ماه رکوردی نیست" description="از صفحه امروز، شروع و پایان روز را ثبت کن." /></td></tr>}
      </tbody></table></div>
    </section>
  );
}
