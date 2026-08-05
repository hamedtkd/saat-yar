import { cn } from "@/lib/cn";
import { duration } from "@/lib/format";
import type { WeeklyChartItem } from "./types";

type TooltipPayloadItem = {
  value?: number;
  payload?: WeeklyChartItem;
};

type WeeklyTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
};

export function WeeklyTooltip({ active, payload }: WeeklyTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  const minutes = payload[0]?.value ?? 0;

  return (
    <div
      dir="rtl"
      className={cn(
        "min-w-40 rounded-xl border border-[#dfe7e9] bg-white/98 p-3",
        "shadow-[0_16px_45px_rgba(17,45,55,0.16)] backdrop-blur-xl",
      )}
    >
      <strong className="block text-xs font-extrabold text-[#102a3a]">
        {item?.dayFull}
      </strong>
      <div className="mt-2 flex items-center justify-between gap-6">
        <span className="flex items-center gap-2 text-[11px] text-[#526b75]">
          <i className="size-2 rounded-full bg-[#079b60]" />
          کارکرد
        </span>
        <strong dir="ltr" className="text-xs font-extrabold text-[#102a3a]">
          {duration(minutes)}
        </strong>
      </div>
    </div>
  );
}
