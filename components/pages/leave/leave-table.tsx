import { CalendarRange, Edit3, Trash2, Umbrella } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { duration, fa, jalali } from "@/lib/format";
import type { AppData, LeaveEntry } from "@/lib/types";

type LeaveTableProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
};

function getLeaveTypeLabel(type: LeaveEntry["type"]) {
  if (type === "full") {
    return "روز کامل";
  }

  if (type === "half") {
    return "نیم‌روز";
  }

  return "ساعتی";
}

function getLeaveDurationLabel(entry: LeaveEntry) {
  if (entry.type === "hourly") {
    return duration(entry.minutes);
  }

  if (entry.type === "half") {
    return "نیم‌روز";
  }

  return "یک روز";
}

function formatLeaveDate(value: string) {
  return jalali(value, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LeaveTable({ data, setData, setDraft }: LeaveTableProps) {
  function handleEdit(entry: LeaveEntry) {
    setDraft({
      ...entry,
    });
  }

  function handleDelete(entry: LeaveEntry) {
    const accepted = window.confirm("این مرخصی حذف شود؟");

    if (!accepted) {
      return;
    }

    setData((previous) => ({
      ...previous,
      leaves: previous.leaves.filter((item) => item.id !== entry.id),
    }));
  }

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl",
        "border border-[#dfe7e9]",
        "bg-white/95",
        "shadow-[0_12px_38px_rgba(17,45,55,0.055)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <PanelHead icon={<Umbrella />} title="تاریخچه مرخصی‌ها" />

        {data.leaves.length > 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              "rounded-full bg-[#f1f7f5]",
              "px-3 py-1.5",
              "text-[10px] font-bold text-[#526b75]",
            )}
          >
            <CalendarRange className="size-3.5 text-[#079b60]" />
            {fa.format(data.leaves.length)} مورد
          </span>
        )}
      </div>

      {data.leaves.length > 0 ? (
        <>
          <div className="hidden w-full overflow-x-auto px-4 pb-4 pt-3 md:block sm:px-5 sm:pb-5">
            <table className="w-full min-w-[820px] border-collapse text-[11px]">
              <thead>
                <tr>
                  {["بازه مرخصی", "نوع", "مدت", "توضیح", "عملیات"].map(
                    (heading) => (
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
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {data.leaves.map((entry) => {
                  const sameDate = entry.startDate === entry.endDate;

                  return (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-[#fbfdfc]"
                    >
                      <td className="border-b border-[#edf1f2] px-3 py-3">
                        <div className="grid gap-1">
                          <strong className="text-[11px] text-[#102a3a]">
                            {sameDate
                              ? formatLeaveDate(entry.startDate)
                              : `${formatLeaveDate(
                                  entry.startDate,
                                )} تا ${formatLeaveDate(entry.endDate)}`}
                          </strong>

                          {!sameDate && (
                            <small className="text-[9px] text-[#6c7d89]">
                              مرخصی چندروزه
                            </small>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                        <StatusBadge success>
                          {getLeaveTypeLabel(entry.type)}
                        </StatusBadge>
                      </td>

                      <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                        <strong className="font-extrabold text-[#102a3a]">
                          {getLeaveDurationLabel(entry)}
                        </strong>
                      </td>

                      <td className="max-w-[280px] border-b border-[#edf1f2] px-3 py-3 text-[#2e4856]">
                        <span
                          className="block truncate"
                          title={entry.note || undefined}
                        >
                          {entry.note || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap border-b border-[#edf1f2] px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-10 rounded-xl"
                            onClick={() => handleEdit(entry)}
                            aria-label="ویرایش مرخصی"
                          >
                            <Edit3 className="size-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="size-10 rounded-xl"
                            onClick={() => handleDelete(entry)}
                            aria-label="حذف مرخصی"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {data.leaves.map((entry) => {
              const sameDate = entry.startDate === entry.endDate;

              return (
                <article
                  key={entry.id}
                  className={cn(
                    "rounded-2xl border border-[#e2ebe8]",
                    "bg-[#fbfdfc] p-4",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-extrabold text-[#102a3a]">
                          {getLeaveTypeLabel(entry.type)}
                        </strong>

                        <StatusBadge success>
                          {getLeaveDurationLabel(entry)}
                        </StatusBadge>
                      </div>

                      <p className="mt-2 text-[10px] leading-6 text-[#6c7d89]">
                        {sameDate
                          ? formatLeaveDate(entry.startDate)
                          : `${formatLeaveDate(
                              entry.startDate,
                            )} تا ${formatLeaveDate(entry.endDate)}`}
                      </p>
                    </div>

                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf9f4] text-[#079b60]">
                      <Umbrella className="size-5" />
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <div
                      className={cn(
                        "flex items-center justify-between gap-4",
                        "rounded-xl border border-[#e7efed]",
                        "bg-white px-3 py-3",
                      )}
                    >
                      <span className="text-[10px] text-[#6c7d89]">شروع</span>

                      <strong className="text-xs font-extrabold text-[#102a3a]">
                        {formatLeaveDate(entry.startDate)}
                      </strong>
                    </div>

                    {!sameDate && (
                      <div
                        className={cn(
                          "flex items-center justify-between gap-4",
                          "rounded-xl border border-[#e7efed]",
                          "bg-white px-3 py-3",
                        )}
                      >
                        <span className="text-[10px] text-[#6c7d89]">
                          پایان
                        </span>

                        <strong className="text-xs font-extrabold text-[#102a3a]">
                          {formatLeaveDate(entry.endDate)}
                        </strong>
                      </div>
                    )}

                    <div
                      className={cn(
                        "flex items-center justify-between gap-4",
                        "rounded-xl border border-[#e7efed]",
                        "bg-white px-3 py-3",
                      )}
                    >
                      <span className="text-[10px] text-[#6c7d89]">مدت</span>

                      <strong className="text-xs font-extrabold text-[#102a3a]">
                        {getLeaveDurationLabel(entry)}
                      </strong>
                    </div>
                  </div>

                  {entry.note && (
                    <div className="mt-3 rounded-xl border border-[#e7efed] bg-white px-3 py-3">
                      <span className="block text-[9px] text-[#6c7d89]">
                        توضیح
                      </span>

                      <p className="mt-1 text-[11px] leading-6 text-[#2e4856]">
                        {entry.note}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit3 className="size-4" />
                      ویرایش
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      className="h-11 rounded-xl"
                      onClick={() => handleDelete(entry)}
                    >
                      <Trash2 className="size-4" />
                      حذف
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState
            icon={<Umbrella />}
            title="مرخصی‌ای ثبت نشده"
            description="اولین مرخصی را از فرم کناری ثبت کن."
          />
        </div>
      )}
    </article>
  );
}
