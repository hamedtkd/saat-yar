import { Check, Moon, Palette, Sun, Monitor } from "lucide-react";

import { cn } from "@/lib/cn";
import { updateOnboardingAppearance } from "@/lib/onboarding-settings";
import { themePresets } from "@/lib/theme";
import type { AppData, ThemeMode, ThemePreset } from "@/lib/types";
import { StepShell } from "./step-shell";
import type { UpdateSettings } from "./types";

const modeOptions: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: "system", label: "سیستم", icon: Monitor },
  { id: "light", label: "روشن", icon: Sun },
  { id: "dark", label: "تاریک", icon: Moon },
];

const presetOptions: Array<{ id: Exclude<ThemePreset, "custom">; label: string }> = [
  { id: "spotify", label: "فیروزه‌ای" },
  { id: "emerald", label: "سبز" },
  { id: "ocean", label: "آبی" },
  { id: "violet", label: "بنفش" },
  { id: "sunset", label: "غروب" },
];

export function AppearanceStep({ settings, updateSettings }: { settings: AppData["settings"]; updateSettings: UpdateSettings }) {
  const currentPreset = settings.appearance.preset === "custom" ? "spotify" : settings.appearance.preset;
  return (
    <StepShell>
      <div className="mx-auto mb-7 max-w-[650px] text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Palette /></span>
        <h1>ظاهر ساعت‌یار را انتخاب کن</h1>
        <p>تغییرات همین لحظه روی صفحه دیده می‌شوند؛ بعداً رنگ سفارشی، سطح کارت و گردی گوشه‌ها هم در تنظیمات در دسترس است.</p>
      </div>

      <div className="mx-auto grid max-w-[820px] gap-5 text-right">
        <fieldset>
          <legend className="mb-2 text-[11px] font-extrabold text-[var(--text)]">حالت نمایش</legend>
          <div className="grid grid-cols-3 gap-2">
            {modeOptions.map(({ id, label, icon: Icon }) => {
              const active = settings.appearance.mode === id;
              return <button key={id} type="button" aria-pressed={active} onClick={() => updateSettings((current) => updateOnboardingAppearance(current, { mode: id }))} className={cn("flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-3 text-[11px] font-extrabold transition", active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]")}><Icon className="size-4" />{label}{active && <Check className="size-3.5" />}</button>;
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[11px] font-extrabold text-[var(--text)]">رنگ اصلی</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {presetOptions.map(({ id, label }) => {
              const active = currentPreset === id;
              return <button key={id} type="button" data-onboarding-theme={id} aria-pressed={active} onClick={() => updateSettings((current) => updateOnboardingAppearance(current, { preset: id }))} className={cn("grid min-h-20 place-items-center gap-2 rounded-2xl border p-3 text-[10px] font-extrabold transition", active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]")}><span className="size-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: themePresets[id] }} />{label}</button>;
            })}
          </div>
        </fieldset>
      </div>
    </StepShell>
  );
}
