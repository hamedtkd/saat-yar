"use client";

import { useCallback } from "react";
import { Palette, RotateCcw } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { SurfaceCard } from "@/components/common/surface-card";
import { ColorField } from "@/components/common/color-field";
import { Button } from "@/components/ui/button";
import { EditableCardActions } from "@/components/pages/settings/editing/editable-card-actions";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { defaultSettings } from "@/lib/constants";
import { normalizeAppearanceSettings, validateAppearanceSettings } from "@/lib/appearance-settings";
import { isHexColor, themePresets } from "@/lib/theme";
import type { AppData, AppearanceSettings, RadiusScale, SurfaceStyle, ThemeMode, ThemePreset } from "@/lib/types";
import type { SystemMessageKey } from "@/lib/i18n/system";
import { AppearanceOption } from "./appearance-option";
import { ThemePreview } from "./theme-preview";

const modeLabels: Record<ThemeMode, SystemMessageKey> = { light: "Light", dark: "Dark", system: "System" };
const presetLabels: Record<ThemePreset, SystemMessageKey> = { spotify: "Turquoise", emerald: "Green", ocean: "Blue", violet: "Violet", sunset: "Sunset", custom: "Custom" };
const radiusLabels: Record<RadiusScale, SystemMessageKey> = { compact: "Compact", balanced: "Balanced", rounded: "Rounded" };
const surfaceLabels: Record<SurfaceStyle, SystemMessageKey> = { neutral: "Neutral", tinted: "Soft tint", contrast: "High contrast" };

type Props = { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void };

export function AppearanceSettingsCard({ data, setData, setToast }: Props) {
  const { locale, s } = useSystemUi();
  const persistAppearance = useCallback((appearance: AppearanceSettings) => {
    setData((previous) => ({ ...previous, settings: { ...previous.settings, appearance } }));
    setToast(s("Appearance and colors were saved."));
  }, [s, setData, setToast]);
  const editor = useSettingsDraft({ value: data.settings.appearance, autoSave: data.settings.autoSaveSettings, label: s("Appearance and colors"), prepare: normalizeAppearanceSettings, onSave: persistAppearance });
  const appearance = editor.draft;
  const validationError = validateAppearanceSettings(appearance, locale);
  const update = (patch: Partial<AppearanceSettings>) => {
    const next = { ...appearance, ...patch };
    if (data.settings.autoSaveSettings && validateAppearanceSettings(next, locale)) return;
    editor.update(next);
  };
  const selectPreset = (preset: ThemePreset) => {
    const accent = preset === "custom" ? (isHexColor(appearance.accent) ? appearance.accent : themePresets.spotify) : themePresets[preset];
    update({ preset, accent });
  };
  const resetDraft = () => {
    editor.update({ ...defaultSettings.appearance });
    if (!data.settings.autoSaveSettings) setToast(s("Default appearance was placed in the draft."));
  };

  return (
    <SurfaceCard id="settings-appearance" as="section" className="col-span-full scroll-mt-24 grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_320px] md:p-6">
      <div className="grid gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="m-0 flex items-center gap-2 text-base font-extrabold"><Palette /> {s("Appearance and colors")}</h2><p className="mt-1 text-xs text-[var(--text-muted)]">{s("Customize theme, accent color, card surfaces, and corner radius.")}</p></div><div className="flex flex-wrap items-center justify-end gap-2"><Button type="button" variant="ghost" size="sm" disabled={!editor.editing} onClick={resetDraft}><RotateCcw /> {s("Reset")}</Button><EditableCardActions editing={editor.manualEditing} dirty={editor.dirty && !validationError} autoSave={data.settings.autoSaveSettings} onEdit={editor.beginEdit} onSave={editor.save} onCancel={editor.cancel} /></div></header>
        <fieldset disabled={!editor.editing}><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">{s("Display mode")}</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(modeLabels) as ThemeMode[]).map((mode) => <AppearanceOption key={mode} active={appearance.mode === mode} label={s(modeLabels[mode])} disabled={!editor.editing} onClick={() => update({ mode })} />)}</div></fieldset>
        <fieldset disabled={!editor.editing}><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">{s("Color palette")}</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{(Object.keys(presetLabels) as ThemePreset[]).map((preset) => { const color = preset === "custom" ? appearance.accent : themePresets[preset]; return <AppearanceOption key={preset} active={appearance.preset === preset} label={s(presetLabels[preset])} disabled={!editor.editing} onClick={() => selectPreset(preset)} className="grid min-h-20 place-items-center"><span className="size-7 rounded-full border border-[var(--border)]" style={{ backgroundColor: isHexColor(color) ? color : themePresets.spotify }} /></AppearanceOption>; })}</div></fieldset>
        {appearance.preset === "custom" && <label className="grid max-w-sm gap-2 text-xs font-bold text-[var(--text-muted)]">{s("Custom color")}<ColorField value={appearance.accent} fallback={themePresets.spotify} disabled={!editor.editing} invalid={Boolean(validationError)} onChange={(accent) => update({ accent })} /></label>}
        <fieldset disabled={!editor.editing}><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">{s("Card surfaces")}</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(surfaceLabels) as SurfaceStyle[]).map((surface) => <AppearanceOption key={surface} active={appearance.surface === surface} label={s(surfaceLabels[surface])} disabled={!editor.editing} onClick={() => update({ surface })} />)}</div></fieldset>
        <fieldset disabled={!editor.editing}><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">{s("Corner radius")}</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(radiusLabels) as RadiusScale[]).map((radius) => <AppearanceOption key={radius} active={appearance.radius === radius} label={s(radiusLabels[radius])} disabled={!editor.editing} onClick={() => update({ radius })} className={radius === "compact" ? "rounded-lg" : radius === "balanced" ? "rounded-xl" : "rounded-2xl"} />)}</div></fieldset>
        {editor.editing && validationError && <p className="text-[10px] font-semibold text-[var(--danger)]" role="alert">{validationError}</p>}
      </div>
      <div className="md:sticky md:top-24 md:self-start"><ThemePreview appearance={appearance} /><p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">{s("The preview is isolated inside this card. In manual-save mode, the whole app appearance changes only after you save.")}</p></div>
    </SurfaceCard>
  );
}
