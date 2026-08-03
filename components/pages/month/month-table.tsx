import {
  CalendarDays,
  Edit3,
  FileSpreadsheet,
} from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  duration,
  faDigits,
  jalali,
} from "@/lib/format";
import { calc } from "@/lib/time-engine";
import type { Settings, WorkRecord } from "@/lib/types";
import { getDailyTargetMinutes } from "@/lib/work-schedule";

type MonthTableProps = {
  records: WorkRecord[];
  settings: Settings;
  onEdit: (date: string) => void;
};

export function MonthTable({
  records,
  settings,
  onEdit,
}: MonthTableProps) {
  return (
    <section
      className={cn(
        "mb-5 min-w-0 overflow-hidden rounded-2xl",
        "border border-[#dfe7e9]",
        "bg-white/95",
        "shadow-[0_12px_38px_rgba(17,45,55,0.055)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <PanelHead
          icon={<FileSpreadsheet />}
          title="جزئیات روزانه"
        />

        {records.length > 0 && (
          <span className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-[10px] font-bold text-[#526b75]">
            {faDigits(String(records.length))} روز ثبت‌شده
          </span>
        )}
      </div>

      {records.length > 0 ? (
        <>
          <div className="hidden w-full overflow-x-auto px-4 pb-4 pt-3 md:block sm:px-5 sm:pb-5">
            <table className="w-full min-w-[920px] border-collapse text-[11px]">
              <thead>
                <tr>
                  {[
                    "تاریخ",
                    "ورود",
                    "خروج",
                    "کارکرد",
                    "وقفه",
                    "تراز",
                    "یادداشت",
                    "ویرایش",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={cn(
                        "h-11 whitespace-nowrap",
                        "border-y border-[#edf1f2]",
                        "bg-[#fbfcfc] px-3 py-2",
                        "text-right font-semibold text-[#536975]",
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.map((item) => {
                  const result = calc(item, getDailyTargetMinutes(item.date, settings));
                  const totalRest =
                    result.breakMinutes + item.lunchMinutes;

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

                      <td
                        dir="ltr"
                        className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]"
                      >
                        {faDigits(item.start || "—")}
                      </td>

                      <td
                        dir="ltr"
                        className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]"
                      >
                        {faDigits(item.end || "—")}
                      </td>

                      <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                        <strong className="font-extrabold text-[#102a3a]">
                          {duration(result.worked)}
                        </strong>
                      </td>

                      <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                        <div className="grid gap-1">
                          <span>{duration(totalRest)}</span>

                          <small className="text-[9px] text-[#6c7d89]">
                            ناهار و وقفه
                          </small>
                        </div>
                      </td>

                      <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex min-w-20 items-center justify-center rounded-full px-2.5 py-1.5",
                            "text-[10px] font-extrabold",
                            result.balance >= 0
                              ? "bg-[#edf9f4] text-[#079b60]"
                              : "bg-[#fff1f0] text-[#e54845]",
                          )}
                        >
                          {duration(result.balance, true)}
                        </span>
                      </td>

                      <td className="max-w-[260px] border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                        <span
                          className="block truncate"
                          title={item.note || undefined}
                        >
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

          <div className="grid gap-3 p-4 md:hidden">
            {records.map((item) => {
              const result = calc(item, getDailyTargetMinutes(item.date, settings));
              const totalRest =
                result.breakMinutes + item.lunchMinutes;

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
                    <div className="rounded-xl bg-white px-3 py-2.5">
                      <span className="block text-[9px] text-[#6c7d89]">
                        ورود
                      </span>
                      <strong
                        dir="ltr"
                        className="mt-1 block text-sm font-extrabold text-[#102a3a]"
                      >
                        {faDigits(item.start || "—")}
                      </strong>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-2.5">
                      <span className="block text-[9px] text-[#6c7d89]">
                        خروج
                      </span>
                      <strong
                        dir="ltr"
                        className="mt-1 block text-sm font-extrabold text-[#102a3a]"
                      >
                        {faDigits(item.end || "—")}
                      </strong>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-2.5">
                      <span className="block text-[9px] text-[#6c7d89]">
                        کارکرد
                      </span>
                      <strong className="mt-1 block text-sm font-extrabold text-[#102a3a]">
                        {duration(result.worked)}
                      </strong>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-2.5">
                      <span className="block text-[9px] text-[#6c7d89]">
                        ناهار و وقفه
                      </span>
                      <strong className="mt-1 block text-sm font-extrabold text-[#102a3a]">
                        {duration(totalRest)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e2ebe8] bg-white px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-[#526b75]">
                      تراز روز
                    </span>

                    <strong
                      dir="ltr"
                      className={cn(
                        "text-sm font-extrabold",
                        result.balance >= 0
                          ? "text-[#079b60]"
                          : "text-[#e54845]",
                      )}
                    >
                      {duration(result.balance, true)}
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState
            icon={<CalendarDays />}
            title="برای این ماه رکوردی نیست"
            description="از صفحه امروز، شروع و پایان روز را ثبت کن."
          />
        </div>
      )}
    </section>
  );
}