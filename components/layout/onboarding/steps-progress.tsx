import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { fa } from "@/lib/format";

const STEP_LABELS = ["خوش‌آمدید", "نوع استفاده", "برنامه کاری", "ذخیره‌سازی"];

export function StepsProgress({ step }: { step: number }) {
  return (
    <div className="mx-auto mb-10 grid grid-cols-4 max-[620px]:mb-6" aria-label="مراحل راه‌اندازی">
      {STEP_LABELS.map((label, index) => {
        const number = index + 1;
        const active = step === number;
        const done = step > number;
        return (
          <div key={label} className={cn("relative grid place-items-center gap-2 text-[var(--text-muted)]", (active || done) && "text-[var(--accent-strong)]", "[&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:right-1/2 [&:not(:last-child)]:after:top-[19px] [&:not(:last-child)]:after:-z-[1] [&:not(:last-child)]:after:h-0.5 [&:not(:last-child)]:after:w-full [&:not(:last-child)]:after:bg-[var(--border)]")}>
            <span className={cn("grid size-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text)]", (active || done) && "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)]")}>{done ? <Check aria-hidden="true" /> : fa.format(number)}</span>
            <small className="max-[620px]:hidden">{label}</small>
          </div>
        );
      })}
    </div>
  );
}
