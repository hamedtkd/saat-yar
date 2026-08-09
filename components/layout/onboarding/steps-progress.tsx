import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { fa } from "@/lib/format";
import type { Mode } from "@/lib/types";

const MODE_LABELS: Record<Mode, string[]> = {
  employee: ["خوش‌آمدید", "نوع استفاده", "برنامه کاری", "حقوق", "ظاهر", "حریم داده", "ورود داده"],
  freelancer: ["خوش‌آمدید", "نوع استفاده", "مشتری", "پروژه", "ظاهر", "حریم داده", "ورود داده"],
  hybrid: ["خوش‌آمدید", "نوع استفاده", "برنامه کاری", "درآمد ترکیبی", "ظاهر", "حریم داده", "ورود داده"],
};

export function StepsProgress({ step, mode }: { step: number; mode: Mode }) {
  const labels = MODE_LABELS[mode];
  return (
    <div className="mx-auto mb-10 grid max-w-[1080px] grid-cols-7 max-[760px]:mb-6" aria-label="مراحل راه‌اندازی" data-onboarding-progress-mode={mode}>
      {labels.map((label, index) => {
        const number = index + 1;
        const active = step === number;
        const done = step > number;
        return (
          <div key={`${number}-${label}`} className={cn("relative grid place-items-center gap-2 text-[var(--text-muted)]", (active || done) && "text-[var(--accent-strong)]", "[&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:right-1/2 [&:not(:last-child)]:after:top-[17px] [&:not(:last-child)]:after:-z-[1] [&:not(:last-child)]:after:h-px [&:not(:last-child)]:after:w-full [&:not(:last-child)]:after:bg-[var(--border)]")}>
            <span className={cn("grid size-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[11px] text-[var(--text)]", (active || done) && "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)]")}>{done ? <Check aria-hidden="true" className="size-4" /> : fa.format(number)}</span>
            <small className="text-[9px] max-[760px]:hidden">{label}</small>
          </div>
        );
      })}
    </div>
  );
}
