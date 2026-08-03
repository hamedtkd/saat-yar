import { cn } from "@/lib/cn"; import { duration, money } from "@/lib/format";
import type { EmployeeChartItem, FreelancerChartItem } from "./types";
type FreelancerTooltipPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: number;
  payload?: FreelancerChartItem;
}; type EmployeeTooltipPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: number;
  payload?: EmployeeChartItem;
};
type BillingTooltipPayloadItem = {
  name?: string;
  value?: number;
  payload?: { name: string; value: number; color: string };
};
type FreelancerTooltipProps = { active?: boolean; label?: string; payload?: FreelancerTooltipPayloadItem[] };
type EmployeeTooltipProps = { active?: boolean; label?: string; payload?: EmployeeTooltipPayloadItem[] };
type DonutTooltipProps = { active?: boolean; payload?: BillingTooltipPayloadItem[] };
export function FreelancerWeeklyTooltip({
  active,
  label,
  payload,
}: FreelancerTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const chartItem = payload[0]?.payload;

  const minutes =
    payload.find((item) => item.dataKey === "minutes")
      ?.value ?? 0;

  const income =
    payload.find((item) => item.dataKey === "income")
      ?.value ?? 0;

  return (
    <div
      dir="rtl"
      className={cn(
        "min-w-48 rounded-xl border border-[#dfe7e9]",
        "bg-white/98 p-3",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)]",
        "backdrop-blur-xl",
      )}
    >
      <div className="mb-2 border-b border-[#edf2f3] pb-2">
        <strong className="block text-xs font-extrabold text-[#102a3a]">
          {label}
        </strong>

        {chartItem?.fullDate && (
          <span className="mt-1 block text-[10px] text-[#6c7d89]">
            {chartItem.fullDate}
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.time,
              }}
            />
            زمان ثبت‌شده
          </span>

          <strong
            dir="ltr"
            className="text-xs font-extrabold text-[#102a3a]"
          >
            {duration(minutes)}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.income,
              }}
            />
            درآمد
          </span>

          <strong className="text-xs font-extrabold text-[#102a3a]">
            {money(income)} تومان
          </strong>
        </div>
      </div>
    </div>
  );
}
export function EmployeeDailyTooltip({
  active,
  label,
  payload,
}: EmployeeTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const chartItem = payload[0]?.payload;

  const worked =
    payload.find((item) => item.dataKey === "worked")
      ?.value ?? 0;

  const target =
    payload.find((item) => item.dataKey === "target")
      ?.value ?? 0;

  const balance = worked - target;

  return (
    <div
      dir="rtl"
      className={cn(
        "min-w-48 rounded-xl border border-[#dfe7e9]",
        "bg-white/98 p-3",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)]",
        "backdrop-blur-xl",
      )}
    >
      <div className="mb-2 border-b border-[#edf2f3] pb-2">
        <strong className="block text-xs font-extrabold text-[#102a3a]">
          {label}
        </strong>

        {chartItem?.fullDate && (
          <span className="mt-1 block text-[10px] text-[#6c7d89]">
            {chartItem.fullDate}
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.worked,
              }}
            />
            کارکرد خالص
          </span>

          <strong
            dir="ltr"
            className="text-xs font-extrabold text-[#102a3a]"
          >
            {duration(worked)}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.target,
              }}
            />
            ساعت موظفی
          </span>

          <strong
            dir="ltr"
            className="text-xs font-extrabold text-[#102a3a]"
          >
            {duration(target)}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-[#edf2f3] pt-2">
          <span className="text-[11px] text-[#526b75]">
            تراز روز
          </span>

          <strong
            dir="ltr"
            className={cn(
              "text-xs font-extrabold",
              balance >= 0
                ? "text-[#079b60]"
                : "text-[#e54845]",
            )}
          >
            {duration(balance, true)}
          </strong>
        </div>
      </div>
    </div>
  );
}

export function DonutTooltip({
  active,
  payload,
}: DonutTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div
      dir="rtl"
      className={cn(
        "rounded-xl border border-[#dfe7e9]",
        "bg-white/98 px-3 py-2",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)]",
      )}
    >
      <div className="flex items-center gap-2">
        <i
          className="size-2 rounded-full"
          style={{
            backgroundColor:
              item.payload?.color ??
              CHART_COLORS.billable,
          }}
        />

        <span className="text-[11px] text-[#526b75]">
          {item.name}
        </span>

        <strong
          dir="ltr"
          className="mr-3 text-xs font-extrabold text-[#102a3a]"
        >
          {duration(item.value ?? 0)}
        </strong>
      </div>
    </div>
  );
}

