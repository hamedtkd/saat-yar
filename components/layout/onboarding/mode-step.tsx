import { BriefcaseBusiness, CalendarDays, LayoutDashboard, Rocket } from "lucide-react";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import type { AppData, Mode } from "@/lib/types";
import type { SystemMessageKey } from "@/lib/i18n/system";
import { Button } from "@/components/ui/button";
import { ModeOption } from "./mode-option";
import { StepShell } from "./step-shell";
import type { SetSetting } from "./types";

const MODES: Array<{ id: Mode; icon: typeof CalendarDays; title: SystemMessageKey; points: SystemMessageKey[] }> = [
  { id: "employee", icon: CalendarDays, title: "Employee", points: ["Clock in and out", "Leave and overtime", "Monthly reports"] },
  { id: "freelancer", icon: BriefcaseBusiness, title: "Freelancer", points: ["Clients and projects", "Billable timer", "Income reports"] },
  { id: "hybrid", icon: LayoutDashboard, title: "Hybrid", points: ["Both workspaces", "Quick switching", "Separate reports"] },
];

export function ModeStep({ settings, setSetting, onFastSetup }: { settings: AppData["settings"]; setSetting: SetSetting; onFastSetup: () => void }) {
  const { s } = useSystemUi();
  return (
    <StepShell>
      <h1>{s("Set Saatyar up for your work")}</h1>
      <p>{s("Choose how you use Saatyar. You can change this later in Settings.")}</p>
      <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1 max-[620px]:gap-3">
        {MODES.map((mode) => <ModeOption key={mode.id} id={mode.id} icon={mode.icon} title={s(mode.title)} points={mode.points.map((point) => s(point))} selected={settings.mode === mode.id} onSelect={(id) => setSetting("mode", id)} />)}
      </div>
      <div className="mx-auto mt-5 flex w-full max-w-[820px] flex-col gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_24%,var(--border))] bg-[var(--accent-soft)] p-4 text-start sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <strong className="inline-flex items-center gap-2 text-sm text-[var(--text)]"><Rocket aria-hidden="true" className="size-4 text-[var(--accent-strong)]" /> {s("Fast setup")}</strong>
          <p className="m-0 text-[10px] leading-5 text-[var(--text-muted)]">{s("Use the recommended defaults and start now. Schedule, payroll, appearance, and import stay editable later.")}</p>
        </div>
        <Button type="button" variant="secondary" onClick={onFastSetup} data-onboarding-fast-setup className="shrink-0">{s("Use fast setup")}</Button>
      </div>
    </StepShell>
  );
}
