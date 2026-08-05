import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { duration, faDigits, jalali } from "@/lib/format";
import { MonthBalanceBadge } from "./month-balance-badge";
import { toMonthRecordView } from "./month-table-utils";
import type { MonthTableProps } from "./types";

const HEADINGS = [
  "تاریخ",
  "ورود",
  "خروج",
  "کارکرد",
  "وقفه",
  "تراز",
  "یادداشت",
  "ویرایش",
];

export function MonthDesktopTable({
  records,
  settings,
  onEdit,
}: MonthTableProps) {
  return (
    <div className="hidden w-full overflow-x-auto px-4 pb-4 pt-3 md:block sm:px-5 sm:pb-5">
      <table className="w-full min-w-[920px] border-collapse text-[11px]">
        <thead>
          <tr>
            {HEADINGS.map((heading) => (
              <th
                key={heading}
                className={cn(
                  "h-11 whitespace-nowrap border-y border-[#edf1f2]",
                  "bg-[#fbfcfc] px-3 py-2 text-right font-semibold text-[#536975]",
                )}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {records.map((record) => {
            const { item, worked, totalRest, balance } = toMonthRecordView(
              record,
              settings,
            );

            return (
              <tr
                key={item.date}
                className="transition-colors hover:bg-[#fbfdfc]"
              >
                <td className="border-b border-[#edf1f2] px-3 py-3">
                  <div className="grid gap-1">
                    <strong className="text-[11px] text-[#102a3a]">
                      {jalali(item.date, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </strong>
                    {item.holiday && (
                      <span className="text-[9px] font-semibold text-[#e54845]">
                        روز تعطیل
                      </span>
                    )}
                  </div>
                </td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  {faDigits(item.start || "—")}
                </td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  {faDigits(item.end || "—")}
                </td>
                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                  <strong className="font-extrabold text-[#102a3a]">
                    {duration(worked)}
                  </strong>
                </td>
                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  <div className="grid gap-1">
                    <span>{duration(totalRest)}</span>
                    <small className="text-[9px] text-[#6c7d89]">ناهار و وقفه</small>
                  </div>
                </td>
                <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                  <MonthBalanceBadge balance={balance} />
                </td>
                <td className="max-w-[260px] border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                  <span className="block truncate" title={item.note || undefined}>
                    {item.note || "—"}
                  </span>
                </td>
                <td className="border-b border-[#edf1f2] px-3 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-xl"
                    onClick={() => onEdit(item.date)}
                    aria-label={`ویرایش رکورد ${item.date}`}
                  >
                    <Edit3 className="size-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
