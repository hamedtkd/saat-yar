import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calc } from "@/lib/time-engine";
import { duration, fa, jalaliMonthCells, localDateKey } from "@/lib/format";
import { getHolidayInfo } from "@/lib/holidays";
import type { AppData } from "@/lib/types";
import { getDailyTargetMinutes } from "@/lib/work-schedule";
import { cn } from "@/lib/cn";

export function MonthCalendar({ data, selectedDate, setSelectedDate, monthRecordCount, moveMonth }: {
  data: AppData;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  monthRecordCount: number;
  moveMonth: (amount: number) => void;
}) {
  const cells = jalaliMonthCells(selectedDate);
  const monthLabel = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "long" }).format(new Date(`${selectedDate}T12:00:00`));
  return (
    <article className={cn("rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[0_18px_55px_rgba(0,0,0,.08)] dark:shadow-[0_20px_70px_rgba(0,0,0,.28)] p-4", "p-[22px] max-[620px]:p-[14px]")}>
      <div className={cn("mb-[18px] grid grid-cols-[auto_1fr_auto] items-center gap-4 [&>div]:text-center [&_h2]:m-0 [&_h2]:text-[19px] [&_span]:mt-1 [&_span]:block [&_span]:text-[11px] [&_span]:text-[var(--text-muted)]")}><Button variant="outline" size="icon" onClick={() => moveMonth(-1)} aria-label="ماه قبل"><ChevronRight /></Button><div><h2>{monthLabel}</h2><span>{fa.format(monthRecordCount)} روز دارای رکورد</span></div><Button variant="outline" size="icon" onClick={() => moveMonth(1)} aria-label="ماه بعد"><ChevronLeft /></Button></div>
      <div className={cn("mb-[7px] grid grid-cols-7 gap-[7px] [&_span]:text-center [&_span]:text-[11px] [&_span]:font-bold [&_span]:text-[var(--text-muted)] max-[620px]:gap-1")}>{["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className={cn("grid grid-cols-7 gap-[7px] [&_button]:relative [&_button]:flex [&_button]:min-h-[68px] [&_button]:flex-col [&_button]:items-start [&_button]:justify-between [&_button]:rounded-[13px] [&_button]:border [&_button]:border-[var(--border)] [&_button]:bg-[var(--surface-2)] [&_button]:p-2 [&_button]:text-[var(--text)] [&_button:hover]:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] [&_button:hover]:bg-[var(--accent-soft)] [&_button.outside]:opacity-30 [&_button.today]:shadow-[inset_0_0_0_2px_var(--accent)] [&_button_small]:text-[9px] [&_button_small]:text-[var(--text-muted)] [&_button>i]:absolute [&_button>i]:left-2 [&_button>i]:top-[9px] [&_button>i]:h-[7px] [&_button>i]:w-[7px] [&_button>i]:rounded-full max-[620px]:gap-1 max-[620px]:[&_button]:min-h-[52px] max-[620px]:[&_button]:p-1.5 max-[620px]:[&_button_small]:hidden")}>{cells.map((cell) => {
        const item = data.records[cell.key];
        const hasLeave = data.leaves.some((entry) => entry.startDate <= cell.key && entry.endDate >= cell.key);
        const holiday = getHolidayInfo(cell.key, {
          mode: data.settings.mode,
          manualHoliday: item?.holiday,
          includeOfficialHolidays: data.settings.autoOfficialHolidays,
          includeWeeklyHoliday: data.settings.autoWeeklyHoliday,
          overrides: data.holidayOverrides,
        });
        const effectiveItem = item ? { ...item, holiday: holiday.isHoliday } : item;
        const result = effectiveItem ? calc(effectiveItem, getDailyTargetMinutes(cell.key, data.settings)) : null;
        const statusClass = hasLeave
          ? "border-[#cbd8fa] bg-[#eef3ff] [&>i]:bg-[#617fd5]"
          : holiday.isHoliday
            ? "border-red-200 bg-red-50 text-red-700 [&>i]:bg-red-500"
            : effectiveItem?.end
              ? result && result.balance >= 0
                ? "border-[#b9e2d2] bg-[var(--accent-soft)] [&>i]:bg-[#19a36c]"
                : "border-[#f0dab5] bg-[#fff8ed] [&>i]:bg-[#e59d2d]"
              : effectiveItem?.start
                ? "border-[#f0dab5] bg-[#fff8ed] [&>i]:bg-[#e59d2d]"
                : "";
        return <button key={cell.key} type="button" title={holiday.title} aria-label={holiday.title ? `${fa.format(cell.day)}، ${holiday.title}` : fa.format(cell.day)} className={cn(!cell.inMonth && "opacity-30", cell.key === localDateKey() && "shadow-[inset_0_0_0_2px_var(--accent)]", cell.key === selectedDate && "ring-2 ring-[var(--accent)] ring-offset-2", statusClass)} aria-pressed={cell.key === selectedDate} onClick={() => setSelectedDate(cell.key)}><span>{fa.format(cell.day)}</span>{item && <small>{duration(result?.worked ?? 0)}</small>}{statusClass && <i aria-hidden="true" />}</button>;
      })}</div>
      <div className={cn("mt-[15px] flex flex-wrap gap-[15px] text-[10px] text-[var(--text-muted)] [&_span]:flex [&_span]:items-center [&_span]:gap-1.5 [&_i]:h-2 [&_i]:w-2 [&_i]:rounded-full max-[620px]:gap-[9px]")}><span><i className="bg-[#19a36c]" /> کامل</span><span><i className="bg-[#e59d2d]" /> کسری</span><span><i className="bg-[#617fd5]" /> مرخصی</span><span><i className="bg-red-500" /> تعطیل</span></div>
    </article>
  );
}
