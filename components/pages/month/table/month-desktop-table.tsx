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
                  "h-11 whitespace-nowrap border-y border-[var(--border)]",
                  "bg-[var(--surface-2)] px-3 py-2 text-right font-semibold text-[var(--text-muted)]",
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
                className="transition-colors hover:bg-[var(--surface-2)]"
              >
                <td className="border-b border-[var(--border)] px-3 py-3">
                  <div className="grid gap-1">
                    <strong className="text-[11px] text-[var(--text)]">
                      {jalali(item.date, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </strong>
                    {item.holiday && (
                      <span className="text-[9px] font-semibold text-[var(--danger)]">
                        روز تعطیل
                      </span>
                    )}
                  </div>
                </td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  {faDigits(item.start || "—")}
                </td>
                <td dir="ltr" className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  {faDigits(item.end || "—")}
                </td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3">
                  <strong className="font-extrabold text-[var(--text)]">
                    {duration(worked)}
                  </strong>
                </td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  <div className="grid gap-1">
                    <span>{duration(totalRest)}</span>
                    <small className="text-[9px] text-[var(--text-muted)]">ناهار و وقفه</small>
                  </div>
                </td>
                <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-3">
                  <MonthBalanceBadge balance={balance} />
                </td>
                <td className="max-w-[260px] border-b border-[var(--border)] px-3 py-3 text-[var(--text)]">
                  <span className="block truncate" title={item.note || undefined}>
                    {item.note || "—"}
                  </span>
                </td>
                <td className="border-b border-[var(--border)] px-3 py-3">
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
