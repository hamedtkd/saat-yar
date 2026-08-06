"use client";

import { useCallback } from "react";
import { Palette, RotateCcw } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditableCardActions } from "@/components/pages/settings/editing/editable-card-actions";
import { useSettingsDraft } from "@/hooks/settings/use-settings-draft";
import { defaultSettings } from "@/lib/constants";
import {
  normalizeAppearanceSettings,
  validateAppearanceSettings,
} from "@/lib/appearance-settings";
import { isHexColor, themePresets } from "@/lib/theme";
import type {
  AppData,
  AppearanceSettings,
  RadiusScale,
  SurfaceStyle,
  ThemeMode,
  ThemePreset,
} from "@/lib/types";
import { AppearanceOption } from "./appearance-option";
import { ThemePreview } from "./theme-preview";

const modeLabels: Record<ThemeMode, string> = {
  light: "روشن",
  dark: "تاریک",
  system: "سیستم",
};
const presetLabels: Record<ThemePreset, string> = {
  spotify: "Spotify",
  emerald: "زمردی",
  ocean: "اقیانوسی",
  violet: "بنفش",
  sunset: "غروب",
  custom: "سفارشی",
};
const radiusLabels: Record<RadiusScale, string> = {
  compact: "فشرده",
  balanced: "متعادل",
  rounded: "گرد",
};
const surfaceLabels: Record<SurfaceStyle, string> = {
  neutral: "خنثی",
  tinted: "رنگی ملایم",
  contrast: "پرکنتراست",
};

type Props = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setToast: (message: string) => void;
};

export function AppearanceSettingsCard({ data, setData, setToast }: Props) {
  const persistAppearance = useCallback((appearance: AppearanceSettings) => {
    setData((previous) => ({
      ...previous,
      settings: { ...previous.settings, appearance },
    }));
    setToast("ظاهر و رنگ‌بندی ذخیره شد.");
  }, [setData, setToast]);

  const editor = useSettingsDraft({
    value: data.settings.appearance,
    autoSave: data.settings.autoSaveSettings,
    label: "ظاهر و رنگ‌بندی",
    prepare: normalizeAppearanceSettings,
    onSave: persistAppearance,
  });
  const appearance = editor.draft;
  const validationError = validateAppearanceSettings(appearance);

  const update = (patch: Partial<AppearanceSettings>) => {
    const next = { ...appearance, ...patch };
    if (data.settings.autoSaveSettings && validateAppearanceSettings(next)) return;
    editor.update(next);
  };

  const selectPreset = (preset: ThemePreset) => {
    const accent = preset === "custom"
      ? (isHexColor(appearance.accent) ? appearance.accent : themePresets.spotify)
      : themePresets[preset];
    update({ preset, accent });
  };

  const resetDraft = () => {
    editor.update({ ...defaultSettings.appearance });
    if (!data.settings.autoSaveSettings) {
      setToast("ظاهر پیش‌فرض در پیش‌نویس قرار گرفت.");
    }
  };

  return (
    <SurfaceCard
      as="section"
      className="col-span-full grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_320px] md:p-6"
    >
      <div className="grid gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-base font-extrabold">
              <Palette /> ظاهر و رنگ‌بندی
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              تم، رنگ اصلی، سطح کارت‌ها و گردی رابط را شخصی‌سازی کن.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!editor.editing}
              onClick={resetDraft}
            >
              <RotateCcw /> بازنشانی
            </Button>
            <EditableCardActions
              editing={editor.manualEditing}
              dirty={editor.dirty && !validationError}
              autoSave={data.settings.autoSaveSettings}
              onEdit={editor.beginEdit}
              onSave={editor.save}
              onCancel={editor.cancel}
            />
          </div>
        </header>

        <fieldset disabled={!editor.editing}>
          <legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">حالت نمایش</legend>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(modeLabels) as ThemeMode[]).map((mode) => (
              <AppearanceOption
                key={mode}
                active={appearance.mode === mode}
                label={modeLabels[mode]}
                disabled={!editor.editing}
                onClick={() => update({ mode })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset disabled={!editor.editing}>
          <legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">پالت رنگ</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(Object.keys(presetLabels) as ThemePreset[]).map((preset) => {
              const color = preset === "custom" ? appearance.accent : themePresets[preset];
              return (
                <AppearanceOption
                  key={preset}
                  active={appearance.preset === preset}
                  label={presetLabels[preset]}
                  disabled={!editor.editing}
                  onClick={() => selectPreset(preset)}
                  className="grid min-h-20 place-items-center"
                >
                  <span
                    className="size-7 rounded-full border border-[var(--border)]"
                    style={{ backgroundColor: isHexColor(color) ? color : themePresets.spotify }}
                  />
                </AppearanceOption>
              );
            })}
          </div>
        </fieldset>

        {appearance.preset === "custom" && (
          <label className="grid max-w-sm gap-2 text-xs font-bold text-[var(--text-muted)]">
            رنگ سفارشی
            <div className="grid grid-cols-[56px_1fr] gap-2">
              <input
                aria-label="انتخاب رنگ سفارشی"
                type="color"
                disabled={!editor.editing}
                value={isHexColor(appearance.accent) ? appearance.accent : themePresets.spotify}
                onChange={(event) => update({ accent: event.target.value })}
                className="h-11 w-14 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-1 disabled:cursor-not-allowed disabled:opacity-55"
              />
              <Input
                dir="ltr"
                disabled={!editor.editing}
                value={appearance.accent}
                aria-invalid={Boolean(validationError)}
                onChange={(event) => update({ accent: event.target.value })}
              />
            </div>
          </label>
        )}

        <fieldset disabled={!editor.editing}>
          <legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">سطح کارت‌ها</legend>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(surfaceLabels) as SurfaceStyle[]).map((surface) => (
              <AppearanceOption
                key={surface}
                active={appearance.surface === surface}
                label={surfaceLabels[surface]}
                disabled={!editor.editing}
                onClick={() => update({ surface })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset disabled={!editor.editing}>
          <legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">گردی گوشه‌ها</legend>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(radiusLabels) as RadiusScale[]).map((radius) => (
              <AppearanceOption
                key={radius}
                active={appearance.radius === radius}
                label={radiusLabels[radius]}
                disabled={!editor.editing}
                onClick={() => update({ radius })}
                className={radius === "compact" ? "rounded-lg" : radius === "balanced" ? "rounded-xl" : "rounded-2xl"}
              />
            ))}
          </div>
        </fieldset>

        {editor.editing && validationError && (
          <p className="text-[10px] font-semibold text-[var(--danger)]" role="alert">
            {validationError}
          </p>
        )}
      </div>

      <div className="md:sticky md:top-24 md:self-start">
        <ThemePreview appearance={appearance} />
        <p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">
          پیش‌نمایش داخل این کارت مستقل است؛ در حالت ذخیره دستی، ظاهر کل برنامه فقط بعد از ذخیره تغییر می‌کند.
        </p>
      </div>
    </SurfaceCard>
  );
}
