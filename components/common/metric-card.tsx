import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type MetricTone = "green" | "blue" | "amber" | "purple";

export function MetricCard({ icon, label, value, suffix, tone = "green" }: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  suffix?: string;
  tone?: MetricTone;
}) {
  return (
    <article className={cn(
      "flex min-h-28 items-center gap-4 rounded-[15px] border border-[#dfe7e9] bg-white/95 px-[23px] py-[18px] shadow-[0_10px_35px_rgba(17,45,55,.055)] max-[620px]:min-h-24 [&>div]:grid [&>div]:min-w-0 [&>div]:gap-0.5 [&_small]:text-[11px] [&_small]:text-[#6c7d89] [&_strong]:whitespace-nowrap [&_strong]:text-[clamp(21px,2vw,30px)] [&_strong]:text-[#102a3a] [&>div>span]:text-[10px] [&>div>span]:text-[#6c7d89]",
      tone === "blue" && "[&>span:first-child]:bg-[#edf3ff] [&>span:first-child]:text-[#276bd5]",
      tone === "amber" && "[&>span:first-child]:bg-[#fff6e5] [&>span:first-child]:text-[#eaa21b]",
      tone === "purple" && "[&>span:first-child]:bg-[#f4efff] [&>span:first-child]:text-[#7a58b8]",
    )}>
      <span className="grid h-[52px] w-[52px] flex-none place-items-center rounded-full bg-[#edf9f4] text-[#079b60] [&_svg]:h-[26px] [&_svg]:w-[26px]">{icon}</span>
      <div><small>{label}</small><strong>{value}</strong>{suffix && <span>{suffix}</span>}</div>
    </article>
  );
}
