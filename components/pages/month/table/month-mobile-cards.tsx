import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duration, faDigits, jalali } from "@/lib/format";
import { MonthBalanceBadge } from "./month-balance-badge";
import { toMonthRecordView } from "./month-table-utils";
import type { MonthTableProps } from "./types";

function Stat({ label, value, dir }: { label: string; value: string; dir?: "ltr" }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2.5">
      <span className="block text-[9px] text-[#6c7d89]">{label}</span>
      <strong dir={dir} className="mt-1 block text-sm font-extrabold text-[#102a3a]">
        {value}
      </strong>
    </div>
  );
}

export function MonthMobileCards({ records, settings, onEdit }: MonthTableProps) {
  return (
    <div className="grid gap-3 p-4 md:hidden">
      {records.map((record) => {
        const { item, worked, totalRest, balance } = toMonthRecordView(
          record,
          settings,
        );

        return (
          <article
            key={item.date}
            className="rounded-2xl border border-[#e2ebe8] bg-[#fbfdfc] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="block text-sm font-extrabold text-[#102a3a]">
                  {jalali(item.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </strong>
                {item.note && (
                  <p className="mt-1 truncate text-[10px] text-[#6c7d89]">
                    {item.note}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0 rounded-xl"
                onClick={() => onEdit(item.date)}
                aria-label={`ویرایش رکورد ${item.date}`}
              >
                <Edit3 className="size-4" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat label="ورود" value={faDigits(item.start || "—")} dir="ltr" />
              <Stat label="خروج" value={faDigits(item.end || "—")} dir="ltr" />
              <Stat label="کارکرد" value={duration(worked)} />
              <Stat label="ناهار و وقفه" value={duration(totalRest)} />
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e2ebe8] bg-white px-3 py-2.5">
              <span className="text-[10px] font-semibold text-[#526b75]">تراز روز</span>
              <MonthBalanceBadge balance={balance} compact />
            </div>
          </article>
        );
      })}
    </div>
  );
}
