import { Clock3, Sparkles } from "lucide-react";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { SetSetting } from "./types";

export function WelcomeStep({ settings, setSetting }: { settings: AppData["settings"]; setSetting: SetSetting }) {
  const { s } = useSystemUi();
  return (
    <StepShell>
      <div className="mx-auto flex max-w-[640px] flex-col items-center pt-10 sm:pt-14">
        <span className={cn("mb-5 grid size-[74px] place-items-center rounded-[24px] border border-[color-mix(in_srgb,var(--accent)_24%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_14px_40px_rgba(0,0,0,.08)] [&_svg]:size-10")}><Clock3 /></span>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-[10px] font-bold text-[var(--accent-strong)]"><Sparkles className="size-3.5" /> {s("Setup takes less than two minutes")}</span>
        <h1>{s("Welcome to Saatyar")}</h1>
        <p className="max-w-[560px]">{s("Set your name, schedule, payroll, and appearance now. Everything stays on this device and can be changed later.")}</p>
        <div className="mt-2 w-full max-w-[560px] rounded-[22px] border border-[var(--dashboard-border)] bg-[linear-gradient(145deg,var(--surface-1),var(--surface-raised))] p-4 text-start shadow-[0_12px_34px_rgba(0,0,0,.06)] sm:p-5">
          <label className="grid gap-2 text-[12px] font-extrabold text-[var(--text)]">
            <span>{s("What should we call you?")}</span>
            <Input data-onboarding-name autoFocus autoComplete="name" placeholder={s("For example, Hamed")} value={settings.name} onChange={(event) => setSetting("name", event.target.value)} className="h-12 rounded-[14px] border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 text-sm font-bold" />
          </label>
          <p className="mb-0 mt-2 text-[10px] leading-5 text-[var(--text-muted)]">{s("This name is only used for your local greeting and profile.")}</p>
        </div>
      </div>
    </StepShell>
  );
}
