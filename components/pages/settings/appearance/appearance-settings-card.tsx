"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Download, Palette, RotateCcw, Shuffle, X } from "lucide-react";
import { useSystemUi } from "@/components/i18n/use-system-ui";
import { ColorField } from "@/components/common/color-field";
import { FilePickerButton } from "@/components/common/file-drop-field";
import { Button } from "@/components/ui/button";
import { useAppearanceStudio } from "@/hooks/settings/use-appearance-studio";
import { defaultSettings } from "@/lib/constants";
import { parseAppearancePreset, serializeAppearancePreset } from "@/lib/appearance-settings";
import { APPEARANCE_FONT_OPTIONS, HEADING_FONT_OPTIONS, appearanceFontStack, ensureAppearanceFonts } from "@/lib/appearance-fonts";
import { isHexColor, themePresets } from "@/lib/theme";
import { cn } from "@/lib/cn";
import type {
  AppData,
  AppearanceSettings,
  DensityScale,
  HeadingFont,
  InterfaceFont,
  NeutralTone,
  RadiusScale,
  SidebarAccent,
  SidebarStyle,
  SidebarWidth,
  SurfaceStyle,
  ThemeMode,
  ThemePreset,
} from "@/lib/types";
import type { SystemMessageKey } from "@/lib/i18n/system";
import { AppearanceSelectControl } from "./appearance-select-control";
import { ThemePreview } from "./theme-preview";

const modeLabels: Record<ThemeMode, SystemMessageKey> = { light: "Light", dark: "Dark", system: "System" };
const presetLabels: Record<ThemePreset, SystemMessageKey> = { spotify: "Turquoise", emerald: "Green", ocean: "Blue", violet: "Violet", sunset: "Sunset", custom: "Custom" };
const toneLabels: Record<NeutralTone, SystemMessageKey> = { slate: "Slate", zinc: "Zinc", stone: "Stone", sand: "Sand", paper: "Paper", pearl: "Pearl", sage: "Sage", clay: "Clay" };
const densityLabels: Record<DensityScale, SystemMessageKey> = { compact: "Compact density", comfortable: "Comfortable", spacious: "Spacious" };
const radiusLabels: Record<RadiusScale, SystemMessageKey> = { none: "No radius", compact: "Compact", balanced: "Balanced", rounded: "Rounded", extra: "Extra rounded" };
const surfaceLabels: Record<SurfaceStyle, SystemMessageKey> = { neutral: "Neutral", tinted: "Soft tint", contrast: "High contrast" };
const sidebarStyleLabels: Record<SidebarStyle, SystemMessageKey> = { soft: "Soft", solid: "Solid", outline: "Outline" };
const sidebarAccentLabels: Record<SidebarAccent, SystemMessageKey> = { subtle: "Subtle", filled: "Filled" };
const sidebarWidthLabels: Record<SidebarWidth, SystemMessageKey> = { compact: "Compact menu", default: "Default width", wide: "Wide menu" };
const fontGroupLabels = {
  core: "Core fonts",
  sans: "Sans serif fonts",
  mono: "Monospace fonts",
  serif: "Serif fonts",
  persian: "Persian fonts",
} as const satisfies Record<string, SystemMessageKey>;

const randomItem = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]!;

type Props = { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void };

export function AppearanceSettingsCard({ data, setData, setToast }: Props) {
  const { direction, locale, s } = useSystemUi();
  const language = locale.startsWith("fa") ? "fa" : "en";
  const [hoverPreview, setHoverPreview] = useState<Partial<AppearanceSettings> | null>(null);
  const persistAppearance = useCallback((appearance: AppearanceSettings) => {
    setData((previous) => ({ ...previous, settings: { ...previous.settings, appearance } }));
    setToast(s("Appearance and colors were saved."));
  }, [s, setData, setToast]);
  const studio = useAppearanceStudio({ value: data.settings.appearance, locale, label: s("Appearance Studio"), onApply: persistAppearance });
  const appearance = studio.draft;
  const previewAppearance = useMemo(() => ({ ...appearance, ...(hoverPreview ?? {}) }), [appearance, hoverPreview]);
  const preview = (patch: Partial<AppearanceSettings>) => () => setHoverPreview(patch);
  const clearPreview = () => setHoverPreview(null);

  const selectPreset = (preset: ThemePreset) => {
    const accent = preset === "custom" ? (isHexColor(appearance.accent) ? appearance.accent : themePresets.spotify) : themePresets[preset];
    studio.update({ preset, accent });
  };
  const presetPatch = (preset: ThemePreset): Partial<AppearanceSettings> => ({ preset, accent: preset === "custom" ? appearance.accent : themePresets[preset] });

  const resetDraft = () => {
    studio.replaceDraft({ ...defaultSettings.appearance });
    clearPreview();
    setToast(s("Default appearance was placed in the draft."));
  };
  const shuffleDraft = () => {
    const preset = randomItem(["spotify", "emerald", "ocean", "violet", "sunset"] as const);
    studio.replaceDraft({
      ...appearance,
      preset,
      accent: themePresets[preset],
      neutralTone: randomItem(["slate", "zinc", "stone", "sand", "paper", "pearl", "sage", "clay"] as const),
      bodyFont: randomItem(APPEARANCE_FONT_OPTIONS).value as InterfaceFont,
      headingFont: randomItem(HEADING_FONT_OPTIONS).value as HeadingFont,
      density: randomItem(["compact", "comfortable", "spacious"] as const),
      radius: randomItem(["none", "compact", "balanced", "rounded", "extra"] as const),
      surface: randomItem(["neutral", "tinted", "contrast"] as const),
      sidebarStyle: randomItem(["soft", "solid", "outline"] as const),
      sidebarAccent: randomItem(["subtle", "filled"] as const),
      sidebarWidth: randomItem(["compact", "default", "wide"] as const),
    });
    clearPreview();
  };
  const downloadPreset = () => {
    const url = URL.createObjectURL(new Blob([serializeAppearancePreset(appearance)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "saatyar-appearance.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const copyPreset = async () => {
    try {
      await navigator.clipboard.writeText(serializeAppearancePreset(appearance));
      setToast(s("Appearance preset copied."));
    } catch {
      downloadPreset();
      setToast(s("Appearance preset was exported."));
    }
  };
  const importPreset = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 64 * 1024) return setToast(s("The selected appearance preset is invalid."));
    const imported = parseAppearancePreset(await file.text());
    if (!imported) setToast(s("The selected appearance preset is invalid."));
    else {
      studio.replaceDraft(imported);
      clearPreview();
      setToast(s("Imported appearance was placed in the draft."));
    }
  };

  const selectOptions = <T extends string>(labels: Record<T, SystemMessageKey>, patch: (value: T) => Partial<AppearanceSettings>) =>
    (Object.keys(labels) as T[]).map((value) => ({ value, label: s(labels[value]), preview: preview(patch(value)) }));

  const bodyFontOptions = APPEARANCE_FONT_OPTIONS.map((font) => ({
    value: font.value as InterfaceFont,
    label: font.label,
    group: s(fontGroupLabels[font.group]),
    leading: <span aria-hidden="true" className="grid min-w-6 place-items-center text-[10px] font-bold" style={{ fontFamily: appearanceFontStack(font.value as InterfaceFont, language) }}>{language === "fa" ? "\u0622" : "Aa"}</span>,
    preview: () => {
      ensureAppearanceFonts(font.value as InterfaceFont, appearance.headingFont);
      setHoverPreview({ bodyFont: font.value as InterfaceFont });
    },
  }));
  const headingFontOptions = HEADING_FONT_OPTIONS.map((font) => ({
    value: font.value as HeadingFont,
    label: font.label,
    group: s(fontGroupLabels[font.group]),
    leading: <span aria-hidden="true" className="grid min-w-6 place-items-center text-[10px] font-bold" style={{ fontFamily: appearanceFontStack(font.value as HeadingFont, language) }}>{language === "fa" ? "\u0622" : "Aa"}</span>,
    preview: () => {
      ensureAppearanceFonts(appearance.bodyFont, font.value as HeadingFont);
      setHoverPreview({ headingFont: font.value as HeadingFont });
    },
  }));

  return (
    <section data-appearance-studio dir="ltr" className="grid min-w-0 gap-4 lg:grid-cols-[310px_minmax(0,1fr)] xl:grid-cols-[326px_minmax(0,1fr)]">
      <aside data-appearance-controls dir={direction} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--surface-shadow)] lg:max-h-[calc(100dvh-116px)] lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-3.5 py-3">
            <div className="min-w-0">
              <strong className="flex items-center gap-2 text-[12px]" style={{ fontFamily: "var(--app-heading-font)" }}><Palette className="size-4 text-[var(--accent-strong)]" /> {s("Appearance Studio")}</strong>
              <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[var(--text-muted)]">{s("Personalize color, typography, density, surfaces, radius, and navigation. Changes remain a draft until you apply them.")}</p>
            </div>
            <span aria-label={studio.dirty ? s("You have unsaved changes") : s("Autosave")} className={cn("mt-1 size-2 shrink-0 rounded-full", studio.dirty ? "bg-[var(--warning)]" : "bg-[var(--success)]")} />
          </div>

          <div className="grid gap-3 p-3.5">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={resetDraft}><RotateCcw /> {s("Reset")}</Button>
              <Button type="button" variant="outline" size="sm" onClick={shuffleDraft}><Shuffle /> {s("Shuffle")}</Button>
            </div>

            <AppearanceSelectControl label={s("Display mode")} value={appearance.mode} options={selectOptions(modeLabels, (mode) => ({ mode }))} onChange={(mode) => studio.update({ mode })} onPreviewEnd={clearPreview} />

            <div className="grid gap-1.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)]">{s("Color palette")}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(presetLabels) as ThemePreset[]).map((preset) => {
                  const color = preset === "custom" ? appearance.accent : themePresets[preset];
                  return (
                    <button
                      key={preset}
                      type="button"
                      aria-label={s(presetLabels[preset])}
                      aria-pressed={appearance.preset === preset}
                      onClick={() => selectPreset(preset)}
                      onPointerEnter={preview(presetPatch(preset))}
                      onPointerLeave={clearPreview}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-[var(--control-radius)] border bg-[var(--surface-1)] px-2 text-[9px] font-bold transition-colors",
                        appearance.preset === preset ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]",
                      )}
                    >
                      <span className="size-4 shrink-0 rounded-full border border-[color-mix(in_srgb,var(--text)_12%,transparent)]" style={{ backgroundColor: isHexColor(color) ? color : themePresets.spotify }} />
                      <span className="truncate">{s(presetLabels[preset])}</span>
                    </button>
                  );
                })}
              </div>
              {appearance.preset === "custom" && <ColorField value={appearance.accent} fallback={themePresets.spotify} invalid={Boolean(studio.validationError)} onChange={(accent) => studio.update({ accent })} />}
            </div>

            <AppearanceSelectControl label={s("Neutral tone")} value={appearance.neutralTone} options={selectOptions(toneLabels, (neutralTone) => ({ neutralTone }))} onChange={(neutralTone) => studio.update({ neutralTone })} onPreviewEnd={clearPreview} />
            <AppearanceSelectControl label={s("Heading font")} value={appearance.headingFont} options={headingFontOptions} onChange={(headingFont) => { ensureAppearanceFonts(appearance.bodyFont, headingFont); studio.update({ headingFont }); }} onPreviewEnd={clearPreview} />
            <AppearanceSelectControl label={s("Body font")} value={appearance.bodyFont} options={bodyFontOptions} onChange={(bodyFont) => { ensureAppearanceFonts(bodyFont, appearance.headingFont); studio.update({ bodyFont }); }} onPreviewEnd={clearPreview} />
            <AppearanceSelectControl label={s("Corner radius")} value={appearance.radius} options={selectOptions(radiusLabels, (radius) => ({ radius }))} onChange={(radius) => studio.update({ radius })} onPreviewEnd={clearPreview} />
            <AppearanceSelectControl label={s("Interface density")} value={appearance.density} options={selectOptions(densityLabels, (density) => ({ density }))} onChange={(density) => studio.update({ density })} onPreviewEnd={clearPreview} />
            <AppearanceSelectControl label={s("Card surfaces")} value={appearance.surface} options={selectOptions(surfaceLabels, (surface) => ({ surface }))} onChange={(surface) => studio.update({ surface })} onPreviewEnd={clearPreview} />

            <div className="border-t border-[var(--border)] pt-2 text-[9px] font-black uppercase tracking-[.08em] text-[var(--text-muted)]">{s("Navigation")}</div>
            <AppearanceSelectControl label={s("Sidebar style")} value={appearance.sidebarStyle} options={selectOptions(sidebarStyleLabels, (sidebarStyle) => ({ sidebarStyle }))} onChange={(sidebarStyle) => studio.update({ sidebarStyle })} onPreviewEnd={clearPreview} />
            <AppearanceSelectControl label={s("Active menu item")} value={appearance.sidebarAccent} options={selectOptions(sidebarAccentLabels, (sidebarAccent) => ({ sidebarAccent }))} onChange={(sidebarAccent) => studio.update({ sidebarAccent })} onPreviewEnd={clearPreview} />
            <AppearanceSelectControl label={s("Sidebar width")} value={appearance.sidebarWidth} options={selectOptions(sidebarWidthLabels, (sidebarWidth) => ({ sidebarWidth }))} onChange={(sidebarWidth) => studio.update({ sidebarWidth })} onPreviewEnd={clearPreview} />

            {studio.validationError && <p className="text-[9px] font-semibold text-[var(--danger)]" role="alert">{studio.validationError}</p>}

            <div className="grid grid-cols-3 gap-1 border-t border-[var(--border)] pt-3">
              <Button type="button" variant="ghost" size="sm" className="px-1" onClick={() => { void copyPreset(); }}><Copy /> <span className="sr-only sm:not-sr-only">{s("Copy preset")}</span></Button>
              <Button type="button" variant="ghost" size="sm" className="px-1" onClick={downloadPreset}><Download /> <span className="sr-only sm:not-sr-only">{s("Export preset")}</span></Button>
              <FilePickerButton accept="application/json,.json" title={s("Import preset")} onFile={importPreset} className="px-1"><span className="sr-only sm:not-sr-only">{s("Import preset")}</span></FilePickerButton>
            </div>
          </div>

          <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-1)_94%,transparent)] p-3 backdrop-blur-xl">
            <Button type="button" size="sm" disabled={!studio.dirty || Boolean(studio.validationError)} onClick={studio.apply}><Check /> {s("Apply changes")}</Button>
            <Button type="button" size="sm" variant="outline" disabled={!studio.dirty} onClick={() => { studio.discard(); clearPreview(); }}><X /> {s("Discard changes")}</Button>
          </div>
        </div>
      </aside>

      <div data-appearance-preview dir={direction} className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <div><strong className="block text-[11px]">{s("Draft preview")}</strong><small className="text-[9px] text-[var(--text-muted)]">{s("Hover previews stay inside this panel. Clicking an option previews it across Saatyar, but it is not persisted until you apply changes.")}</small></div>
        </div>
        <ThemePreview appearance={previewAppearance} />
      </div>
    </section>
  );
}
