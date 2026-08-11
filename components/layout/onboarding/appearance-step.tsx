import { Check, Moon, Palette, Sun, Monitor } from "lucide-react";

import { useSystemUi } from "@/components/i18n/use-system-ui";
import { cn } from "@/lib/cn";
import { updateOnboardingAppearance } from "@/lib/onboarding-settings";
import { themePresets } from "@/lib/theme";
import type { AppData, ThemeMode, ThemePreset } from "@/lib/types";
import type { SystemMessageKey } from "@/lib/i18n/system";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

const modeOptions: Array<{ id: ThemeMode; label: SystemMessageKey; icon: typeof Sun }> = [
  { id: "system", label: "System", icon: Monitor }, { id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon },
];
const presetOptions: Array<{ id: Exclude<ThemePreset, "custom">; label: SystemMessageKey }> = [
  { id: "spotify", label: "Turquoise" }, { id: "emerald", label: "Green" }, { id: "ocean", label: "Blue" }, { id: "violet", label: "Violet" }, { id: "sunset", label: "Sunset" },
];

export function AppearanceStep({ settings, updateSettings }: { settings: AppData["settings"]; updateSettings: UpdateSettings }) {
  const { s } = useSystemUi();
  const currentPreset = settings.appearance.preset === "custom" ? "spotify" : settings.appearance.preset;
  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[650px] text-center"><span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Palette /></span><h1>{s("Choose Saatyar appearance")}</h1><p>{s("Changes appear immediately. Custom colors, card surfaces, and corner radius remain available in Settings.")}</p></div>
      <div className="mx-auto grid max-w-[820px] gap-5 text-start">
        <fieldset><legend className="mb-2 text-[11px] font-extrabold text-[var(--text)]">{s("Display mode")}</legend><div className="grid grid-cols-3 gap-2">{modeOptions.map(({ id, label, icon: Icon }) => { const active = settings.appearance.mode === id; return <button key={id} type="button" aria-pressed={active} onClick={() => updateSettings((current) => updateOnboardingAppearance(current, { mode: id }))} className={cn("flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-3 text-[11px] font-extrabold transition", active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]")}><Icon className="size-4" />{s(label)}{active && <Check className="size-3.5" />}</button>; })}</div></fieldset>
        <fieldset><legend className="mb-2 text-[11px] font-extrabold text-[var(--text)]">{s("Primary color")}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{presetOptions.map(({ id, label }) => { const active = currentPreset === id; return <button key={id} type="button" data-onboarding-theme={id} aria-pressed={active} onClick={() => updateSettings((current) => updateOnboardingAppearance(current, { preset: id }))} className={cn("grid min-h-20 place-items-center gap-2 rounded-2xl border p-3 text-[10px] font-extrabold transition", active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]")}><span className="size-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: themePresets[id] }} />{s(label)}</button>; })}</div></fieldset>
      </div>
    </StepShell>
  );
}
