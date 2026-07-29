import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calc } from "@/lib/time-engine";
import { duration, fa, jalaliMonthCells, localDateKey } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData } from "@/lib/types";

export function MonthCalendar({ data, selectedDate, setSelectedDate, monthRecordCount, dailyTarget, moveMonth }: {
  data: AppData;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  monthRecordCount: number;
  dailyTarget: number;
  moveMonth: (amount: number) => void;
}) {
  const cells = jalaliMonthCells(selectedDate);
  const monthLabel = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "long" }).format(new Date(`${selectedDate}T12:00:00`));
  return (
    <article className={tw("panel", "month-calendar")}>
      <div className={tw("month-calendar-head")}><Button variant="outline" size="icon" onClick={() => moveMonth(-1)} aria-label="ماه قبل"><ChevronRight /></Button><div><h2>{monthLabel}</h2><span>{fa.format(monthRecordCount)} روز دارای رکورد</span></div><Button variant="outline" size="icon" onClick={() => moveMonth(1)} aria-label="ماه بعد"><ChevronLeft /></Button></div>
      <div className={tw("month-weekdays")}>{["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className={tw("month-cells")}>{cells.map((cell) => {
        const item = data.records[cell.key];
        const hasLeave = data.leaves.some((entry) => entry.startDate <= cell.key && entry.endDate >= cell.key);
        const result = item ? calc(item, dailyTarget) : null;
        const status = hasLeave ? "leave" : item?.holiday ? "holiday" : item?.end ? (result && result.balance >= 0 ? "complete" : "deficit") : item?.start ? "partial" : "";
        return <button key={cell.key} type="button" className={tw(!cell.inMonth && "outside", cell.key === localDateKey() && "today", status)} onClick={() => setSelectedDate(cell.key)}><span>{fa.format(cell.day)}</span>{item && <small>{duration(result?.worked ?? 0)}</small>}{status && <i aria-hidden="true" />}</button>;
      })}</div>
      <div className={tw("calendar-legend")}><span><i className={tw("complete")} /> کامل</span><span><i className={tw("deficit")} /> کسری</span><span><i className={tw("leave")} /> مرخصی</span><span><i className={tw("holiday")} /> تعطیل</span></div>
    </article>
  );
}
