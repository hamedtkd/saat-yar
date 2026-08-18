import { Check } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { cn } from "@/lib/cn";
import type { SystemMessageKey } from "@/lib/i18n/system";
import type { Mode } from "@/lib/types";

const MODE_LABELS: Record<Mode, SystemMessageKey[]> = {
  employee: ["Welcome", "Workspace", "Work schedule", "Payroll", "Appearance", "Data privacy", "Import data"],
  freelancer: ["Welcome", "Workspace", "Client", "Project name", "Appearance", "Data privacy", "Import data"],
  hybrid: ["Welcome", "Workspace", "Work schedule", "Combined income", "Appearance", "Data privacy", "Import data"],
};

export function StepsProgress({ step, mode }: { step: number; mode: Mode }) {
  const { s, digits } = useSystemUi();
  const labels = MODE_LABELS[mode];
  return (
    <div className="mx-auto mb-10 flex w-full max-w-[1120px] items-start" aria-label={s("Setup steps")} data-onboarding-progress-mode={mode}>
      {labels.map((label, index) => {
        const number = index + 1;
        const active = step === number;
        const done = step > number;
        return (
          <div key={`${number}-${label}`} className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
            {index > 0 && <span aria-hidden="true" className={cn("absolute end-1/2 top-[18px] h-px w-full bg-[var(--border)]", step > index && "bg-[var(--accent)]")} />}
            <span className={cn("relative z-[1] grid size-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--page)] text-[11px] font-black text-[var(--text-muted)] shadow-[0_0_0_6px_var(--page)] transition", (active || done) && "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)]", active && "ring-4 ring-[var(--accent-soft)]")}>{done ? <Check aria-hidden="true" className="size-4" /> : digits(number)}</span>
            <small className={cn("max-w-[110px] text-[9px] font-bold leading-4 text-[var(--text-muted)] max-[760px]:hidden", active && "text-[var(--accent-strong)]")}>{s(label)}</small>
          </div>
        );
      })}
    </div>
  );
}
