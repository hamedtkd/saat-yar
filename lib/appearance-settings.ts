import {
  isHexColor,
  resolveAccent,
  resolveAccentTokens,
  themePresets,
} from "./theme.ts";
import type {
  AppearanceSettings,
  RadiusScale,
  SurfaceStyle,
  ThemeMode,
  ThemePreset,
} from "./types.ts";

export type ResolvedThemeMode = Exclude<ThemeMode, "system">;

type PreviewColors = {
  page: string;
  surface1: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
};

const themeModes: ThemeMode[] = ["light", "dark", "system"];
const themePresetsList: ThemePreset[] = ["spotify", "emerald", "ocean", "violet", "sunset", "custom"];
const radiusScales: RadiusScale[] = ["compact", "balanced", "rounded"];
const surfaceStyles: SurfaceStyle[] = ["neutral", "tinted", "contrast"];

const radiusTokens: Record<RadiusScale, { card: string; control: string }> = {
  compact: { card: "14px", control: "10px" },
  balanced: { card: "18px", control: "12px" },
  rounded: { card: "24px", control: "15px" },
};

const baseColors: Record<ResolvedThemeMode, PreviewColors> = {
  light: {
    page: "#f6f8fb",
    surface1: "#ffffff",
    surface2: "#f8fafc",
    text: "#111827",
    muted: "#64748b",
    border: "#dbe3ec",
  },
  dark: {
    page: "#081016",
    surface1: "#0d161d",
    surface2: "#121d25",
    text: "#f8fafc",
    muted: "#94a3b8",
    border: "rgb(255 255 255 / 10%)",
  },
};

const surfaceOverrides: Record<
  ResolvedThemeMode,
  Partial<Record<SurfaceStyle, Partial<PreviewColors>>>
> = {
  light: {
    neutral: { page: "#f7f8fa", surface2: "#f3f5f8" },
    contrast: { page: "#eef3f8", surface1: "#ffffff", surface2: "#e9eff6", border: "#cbd6e2" },
  },
  dark: {
    neutral: { page: "#090d11", surface1: "#10161b", surface2: "#151c22" },
    contrast: { page: "#05090d", surface1: "#0b1218", surface2: "#121f29", border: "rgb(255 255 255 / 15%)" },
  },
};

export function cloneAppearanceSettings(value: AppearanceSettings): AppearanceSettings {
  return { ...value };
}

export function validateAppearanceSettings(value: AppearanceSettings): string | null {
  if (!themeModes.includes(value.mode)) return "حالت نمایش انتخاب‌شده معتبر نیست.";
  if (!themePresetsList.includes(value.preset)) return "پالت رنگ انتخاب‌شده معتبر نیست.";
  if (!radiusScales.includes(value.radius)) return "گردی گوشه‌های انتخاب‌شده معتبر نیست.";
  if (!surfaceStyles.includes(value.surface)) return "سطح کارت‌های انتخاب‌شده معتبر نیست.";
  if (value.preset === "custom" && !isHexColor(value.accent)) {
    return "رنگ سفارشی باید یک کد شش‌رقمی مانند #06b6d4 باشد.";
  }
  return null;
}

export function normalizeAppearanceSettings(value: AppearanceSettings): AppearanceSettings {
  const accent = value.preset === "custom"
    ? value.accent.toLowerCase()
    : themePresets[value.preset];
  return { ...value, accent };
}

function resolvePreviewColors(
  mode: ResolvedThemeMode,
  surface: SurfaceStyle,
): PreviewColors {
  const base = baseColors[mode];
  const override = surfaceOverrides[mode][surface];
  return {
    page: override?.page ?? base.page,
    surface1: override?.surface1 ?? base.surface1,
    surface2: override?.surface2 ?? base.surface2,
    text: override?.text ?? base.text,
    muted: override?.muted ?? base.muted,
    border: override?.border ?? base.border,
  };
}

export function createAppearancePreviewTokens(
  value: AppearanceSettings,
  resolvedMode: ResolvedThemeMode,
): Record<string, string> {
  const safeValue = value.preset === "custom" && !isHexColor(value.accent)
    ? { ...value, accent: themePresets.spotify }
    : value;
  const accent = resolveAccent(safeValue);
  const accentTokens = resolveAccentTokens(accent, resolvedMode);
  const colors = resolvePreviewColors(resolvedMode, value.surface);
  const radius = radiusTokens[value.radius];

  return {
    "--accent": accentTokens.accent,
    "--accent-fill": accentTokens.fill,
    "--accent-foreground": accentTokens.foreground,
    "--accent-strong": accentTokens.strong,
    "--accent-soft": `color-mix(in srgb, ${accentTokens.accent} 14%, transparent)`,
    "--page": colors.page,
    "--surface-1": colors.surface1,
    "--surface-2": colors.surface2,
    "--text": colors.text,
    "--text-muted": colors.muted,
    "--border": colors.border,
    "--card-radius": radius.card,
    "--control-radius": radius.control,
    colorScheme: resolvedMode,
  };
}
