import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { fa } from "@/lib/format";

const STEP_LABELS = ["خوش‌آمدید", "نوع استفاده", "برنامه کاری", "ذخیره‌سازی"];

export function StepsProgress({ step }: { step: number }) {
  return (
    <div
      className={cn(
        "mx-auto mb-[42px] grid grid-cols-4 [&>div]:relative [&>div]:grid [&>div]:place-items-center [&>div]:gap-[7px] [&>div]:text-[#6c7d89] [&>div:not(:last-child)]:after:absolute [&>div:not(:last-child)]:after:right-1/2 [&>div:not(:last-child)]:after:top-[19px] [&>div:not(:last-child)]:after:-z-[1] [&>div:not(:last-child)]:after:h-[3px] [&>div:not(:last-child)]:after:w-full [&>div:not(:last-child)]:after:bg-[#e3e9ea] [&_span]:grid [&_span]:h-10 [&_span]:w-10 [&_span]:place-items-center [&_span]:rounded-full [&_span]:border [&_span]:border-[#dfe7e9] [&_span]:bg-white [&_span]:text-[#102a3a] [&_.active]:text-[#079b60] [&_.active_span]:border-[#079b60] [&_.active_span]:bg-[#079b60] [&_.active_span]:text-white [&_.done_span]:border-[#079b60] [&_.done_span]:bg-[#079b60] [&_.done_span]:text-white max-[620px]:mb-6 max-[620px]:[&_small]:hidden",
      )}
      aria-label="مراحل راه‌اندازی"
    >
      {STEP_LABELS.map((label, index) => {
        const number = index + 1;
        const stateClass = step === number ? "active" : step > number ? "done" : "";

        return (
          <div className={stateClass} key={label}>
            <span>{step > number ? <Check /> : fa.format(number)}</span>
            <small>{label}</small>
          </div>
        );
      })}
    </div>
  );
}
