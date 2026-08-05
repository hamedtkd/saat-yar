import { cn } from "@/lib/cn"; import { duration, money } from "@/lib/format";
import type { EmployeeChartItem, FreelancerChartItem } from "./types";
import { CHART_COLORS } from "./chart-utils";
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
        "min-w-48 rounded-xl border border-[var(--border)]",
        "bg-[var(--surface-glass)] p-3",
        "shadow-[0_8px_24px_rgba(0,0,0,.12)]",
        "backdrop-blur-xl",
      )}
    >
      <div className="mb-2 border-b border-[var(--border)] pb-2">
        <strong className="block text-xs font-extrabold text-[var(--text)]">
          {label}
        </strong>
        {chartItem?.fullDate && (
          <span className="mt-1 block text-[10px] text-[var(--text-muted)]">
            {chartItem.fullDate}
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
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
            className="text-xs font-extrabold text-[var(--text)]"
          >
            {duration(minutes)}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <i
              className="size-2 rounded-full"
              style={{
                backgroundColor: CHART_COLORS.income,
              }}
            />
            درآمد
          </span>
          <strong className="text-xs font-extrabold text-[var(--text)]">
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
        "min-w-48 rounded-xl border border-[var(--border)]",
        "bg-[var(--surface-glass)] p-3",
        "shadow-[0_8px_24px_rgba(0,0,0,.12)]",
        "backdrop-blur-xl",
      )}
    >
      <div className="mb-2 border-b border-[var(--border)] pb-2">
        <strong className="block text-xs font-extrabold text-[var(--text)]">
          {label}
        </strong>
        {chartItem?.fullDate && (
          <span className="mt-1 block text-[10px] text-[var(--text-muted)]">
            {chartItem.fullDate}
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
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
            className="text-xs font-extrabold text-[var(--text)]"
          >
            {duration(worked)}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
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
            className="text-xs font-extrabold text-[var(--text)]"
          >
            {duration(target)}
          </strong>
        </div>
        <div className="flex items-center justify-between gap-5 border-t border-[var(--border)] pt-2">
          <span className="text-[11px] text-[var(--text-muted)]">
            تراز روز
          </span>
          <strong
            dir="ltr"
            className={cn(
              "text-xs font-extrabold",
              balance >= 0
                ? "text-[var(--accent-strong)]"
                : "text-[var(--danger)]",
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
        "rounded-xl border border-[var(--border)]",
        "bg-[var(--surface-glass)] px-3 py-2",
        "shadow-[0_8px_24px_rgba(0,0,0,.12)]",
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
        <span className="text-[11px] text-[var(--text-muted)]">
          {item.name}
        </span>
        <strong
          dir="ltr"
          className="mr-3 text-xs font-extrabold text-[var(--text)]"
        >
          {duration(item.value ?? 0)}
        </strong>
      </div>
    </div>
  );
}
