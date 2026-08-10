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
  return <div className="mx-auto mb-10 grid max-w-[1080px] grid-cols-7 max-[760px]:mb-6" aria-label={s("Setup steps")} data-onboarding-progress-mode={mode}>{labels.map((label, index) => { const number = index + 1; const active = step === number; const done = step > number; return <div key={`${number}-${label}`} className={cn("relative grid place-items-center gap-2 text-[var(--text-muted)]", (active || done) && "text-[var(--accent-strong)]", "[&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:start-1/2 [&:not(:last-child)]:after:top-[17px] [&:not(:last-child)]:after:-z-[1] [&:not(:last-child)]:after:h-px [&:not(:last-child)]:after:w-full [&:not(:last-child)]:after:bg-[var(--border)]")}><span className={cn("grid size-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[11px] text-[var(--text)]", (active || done) && "border-[var(--accent)] bg-[var(--accent-fill)] text-[var(--accent-foreground)]")}>{done ? <Check aria-hidden="true" className="size-4" /> : digits(number)}</span><small className="text-[9px] max-[760px]:hidden">{s(label)}</small></div>; })}</div>;
}
