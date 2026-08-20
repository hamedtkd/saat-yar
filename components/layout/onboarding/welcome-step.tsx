import { ShieldCheck, Sparkles, TimerReset } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { Input } from "@/components/ui/input";
import type { AppData } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { SetSetting } from "./types";

export function WelcomeStep({ settings, setSetting }: { settings: AppData["settings"]; setSetting: SetSetting }) {
  const { s } = useSystemUi();
  return (
    <StepShell>
      <div className="mx-auto flex max-w-[860px] flex-col items-center pt-6 text-center sm:pt-10">
        <span className="mb-4 inline-flex items-center gap-2 text-sm font-black text-[var(--accent-strong)]"><Sparkles className="size-4" />{s("Welcome to Saatyar")}</span>
        <h1 className="max-w-[820px] text-balance">{s("Your first step toward calmer work and clearer income")}</h1>
        <p className="max-w-[720px] text-balance">{s("Set your name, workspace, schedule, income rules, and appearance once. Everything stays on this device and remains editable later.")}</p>
        <div className="mt-5 grid w-full max-w-[760px] gap-4 rounded-[28px] border border-[var(--dashboard-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-1)_94%,transparent),color-mix(in_srgb,var(--surface-raised)_96%,transparent))] p-5 text-start shadow-[0_24px_70px_rgba(0,0,0,.09)] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><TimerReset className="size-5" /></span>
            <div className="grid gap-1"><strong className="text-sm text-[var(--text)]">{s("What should we call you?")}</strong><span className="text-[10px] leading-5 text-[var(--text-muted)]">{s("This name is only used for your local greeting and profile.")}</span></div>
          </div>
          <Input data-onboarding-name autoFocus autoComplete="name" placeholder={s("For example, Hamed")} value={settings.name} onChange={(event) => setSetting("name", event.target.value)} className="h-14 rounded-[18px] border-[var(--dashboard-border)] bg-[var(--surface-2)] px-5 text-base font-black shadow-[0_10px_28px_rgba(0,0,0,.05)]" />
          <div className="flex items-center gap-2 rounded-[16px] border border-[color-mix(in_srgb,var(--success)_22%,var(--border))] bg-[var(--success-soft)] px-3.5 py-3 text-[10px] font-semibold leading-5 text-[var(--text-muted)]"><ShieldCheck className="size-4 shrink-0 text-[var(--success)]" />{s("No account is required. Your setup is saved locally on this device.")}</div>
        </div>
      </div>
    </StepShell>
  );
}
