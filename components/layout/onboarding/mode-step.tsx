import { BriefcaseBusiness, CalendarDays, LayoutDashboard } from "lucide-react";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import type { AppData, Mode } from "@/lib/types";
import type { SystemMessageKey } from "@/lib/i18n/system";
import { ModeOption } from "./mode-option";
import { StepShell } from "./step-shell";
import type { SetSetting } from "./types";

const MODES: Array<{ id: Mode; icon: typeof CalendarDays; title: SystemMessageKey; points: SystemMessageKey[] }> = [
  { id: "employee", icon: CalendarDays, title: "Employee", points: ["Clock in and out", "Leave and overtime", "Monthly reports"] },
  { id: "freelancer", icon: BriefcaseBusiness, title: "Freelancer", points: ["Clients and projects", "Billable timer", "Income reports"] },
  { id: "hybrid", icon: LayoutDashboard, title: "Hybrid", points: ["Both workspaces", "Quick switching", "Separate reports"] },
];

export function ModeStep({ settings, setSetting }: { settings: AppData["settings"]; setSetting: SetSetting }) {
  const { s } = useSystemUi();
  return (
    <StepShell>
      <h1>{s("Set Saatyar up for your work")}</h1>
      <p>{s("Choose how you use Saatyar. You can change this later in Settings.")}</p>
      <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1 max-[620px]:gap-3">
        {MODES.map((mode) => <ModeOption key={mode.id} id={mode.id} icon={mode.icon} title={s(mode.title)} points={mode.points.map((point) => s(point))} selected={settings.mode === mode.id} onSelect={(id) => setSetting("mode", id)} />)}
      </div>
    </StepShell>
  );
}
