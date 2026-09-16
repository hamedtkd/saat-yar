import {
  isHexColor,
  resolveAccent,
  resolveAccentTokens,
  themePresets,
} from "./theme.ts";
import { translateSystem } from "./i18n/system.ts";
import { BODY_FONT_VALUES, HEADING_FONT_VALUES, appearanceFontStack } from "./appearance-fonts.ts";
import type { Locale } from "./i18n/locales.ts";
import type {
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
} from "./types.ts";

export type ResolvedThemeMode = Exclude<ThemeMode, "system">;

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  mode: "system",
  preset: "violet",
  accent: "#8b5cf6",
  neutralTone: "slate",
  bodyFont: "vazirmatn",
  headingFont: "vazirmatn",
  density: "comfortable",
  radius: "rounded",
  surface: "tinted",
  sidebarStyle: "soft",
  sidebarAccent: "filled",
  sidebarWidth: "default",
};

export const APPEARANCE_PRESET_VERSION = 1;
export const APPEARANCE_PRESET_KIND = "saatyar-appearance";

const themeModes: ThemeMode[] = ["light", "dark", "system"];
const themePresetsList: ThemePreset[] = ["spotify", "emerald", "ocean", "violet", "sunset", "custom"];
const neutralTones: NeutralTone[] = ["slate", "zinc", "stone", "sand", "paper", "pearl", "sage", "clay"];
const interfaceFonts: InterfaceFont[] = [...BODY_FONT_VALUES];
const headingFonts: HeadingFont[] = [...HEADING_FONT_VALUES];
const densityScales: DensityScale[] = ["compact", "comfortable", "spacious"];
const radiusScales: RadiusScale[] = ["none", "compact", "balanced", "rounded", "extra"];
const surfaceStyles: SurfaceStyle[] = ["neutral", "tinted", "contrast"];
const sidebarStyles: SidebarStyle[] = ["soft", "solid", "outline"];
const sidebarAccents: SidebarAccent[] = ["subtle", "filled"];
const sidebarWidths: SidebarWidth[] = ["compact", "default", "wide"];

const radiusTokens: Record<RadiusScale, { card: string; control: string; controlSm: string; micro: string }> = {
  none: { card: "0px", control: "0px", controlSm: "0px", micro: "0px" },
  compact: { card: "14px", control: "10px", controlSm: "6px", micro: "3px" },
  balanced: { card: "18px", control: "12px", controlSm: "8px", micro: "4px" },
  rounded: { card: "24px", control: "15px", controlSm: "10px", micro: "5px" },
  extra: { card: "32px", control: "20px", controlSm: "14px", micro: "7px" },
};

const densityTokens: Record<DensityScale, { controlHeight: string; controlHeightSm: string; spaceUnit: string }> = {
  compact: { controlHeight: "38px", controlHeightSm: "32px", spaceUnit: "0.82" },
  comfortable: { controlHeight: "44px", controlHeightSm: "36px", spaceUnit: "1" },
  spacious: { controlHeight: "50px", controlHeightSm: "40px", spaceUnit: "1.14" },
};

const sidebarWidthTokens: Record<SidebarWidth, { shell: string; offset: string; preview: string }> = {
  compact: { shell: "216px", offset: "232px", preview: "132px" },
  default: { shell: "248px", offset: "264px", preview: "150px" },
  wide: { shell: "288px", offset: "304px", preview: "178px" },
};

type PreviewColors = {
  page: string;
  surface1: string;
  surface2: string;
  text: string;
  muted: string;
  border: string;
};

const toneColors: Record<NeutralTone, Record<ResolvedThemeMode, PreviewColors>> = {
  slate: {
    light: { page: "#f4f6fb", surface1: "#ffffff", surface2: "#f7f9fc", text: "#101828", muted: "#667085", border: "#d8e0ea" },
    dark: { page: "#071017", surface1: "#0d161d", surface2: "#121d25", text: "#f8fafc", muted: "#94a3b8", border: "rgb(255 255 255 / 10%)" },
  },
  zinc: {
    light: { page: "#f6f6f8", surface1: "#ffffff", surface2: "#f3f4f6", text: "#18181b", muted: "#6b7280", border: "#dcdee4" },
    dark: { page: "#0a0a0b", surface1: "#111113", surface2: "#18181b", text: "#fafafa", muted: "#a1a1aa", border: "rgb(255 255 255 / 11%)" },
  },
  stone: {
    light: { page: "#f7f5f1", surface1: "#fffefd", surface2: "#f4f1eb", text: "#1f1a17", muted: "#746b63", border: "#dfd7ce" },
    dark: { page: "#0d0c0b", surface1: "#151311", surface2: "#1c1917", text: "#fafaf9", muted: "#a8a29e", border: "rgb(255 255 255 / 11%)" },
  },
  sand: {
    light: { page: "#faf6ee", surface1: "#fffdf8", surface2: "#f7f0e2", text: "#2b241c", muted: "#7a6a58", border: "#e7ddca" },
    dark: { page: "#100d09", surface1: "#18130e", surface2: "#211a13", text: "#fffaf1", muted: "#b7a48c", border: "rgb(255 247 235 / 12%)" },
  },
  paper: {
    light: { page: "#f8f8f8", surface1: "#ffffff", surface2: "#f5f5f5", text: "#202124", muted: "#68707d", border: "#e1e3e8" },
    dark: { page: "#0b0c0e", surface1: "#121316", surface2: "#181a1e", text: "#f7f7f8", muted: "#a0a4ad", border: "rgb(255 255 255 / 10%)" },
  },
  pearl: {
    light: { page: "#f5f6fa", surface1: "#ffffff", surface2: "#f2f4f8", text: "#172033", muted: "#697386", border: "#d8deea" },
    dark: { page: "#0a0f16", surface1: "#101621", surface2: "#141d29", text: "#f6f8fc", muted: "#9eabc1", border: "rgb(255 255 255 / 11%)" },
  },
  sage: {
    light: { page: "#f3f7f3", surface1: "#ffffff", surface2: "#eef4ef", text: "#16211a", muted: "#64756b", border: "#d2ded5" },
    dark: { page: "#09110d", surface1: "#0f1713", surface2: "#15201a", text: "#f4faf6", muted: "#94a89d", border: "rgb(223 255 234 / 12%)" },
  },
  clay: {
    light: { page: "#f8f3ef", surface1: "#fffefd", surface2: "#f4ece6", text: "#261b15", muted: "#7b695f", border: "#e3d6cd" },
    dark: { page: "#110c09", surface1: "#17110e", surface2: "#1f1713", text: "#fdf8f4", muted: "#b39e92", border: "rgb(255 238 227 / 12%)" },
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? value as T : fallback;
}

export function sanitizeAppearanceSettings(value: unknown): AppearanceSettings {
  const source = isObject(value) ? value : {};
  const preset = oneOf(source.preset, themePresetsList, DEFAULT_APPEARANCE_SETTINGS.preset);
  const rawAccent = typeof source.accent === "string" ? source.accent.toLowerCase() : DEFAULT_APPEARANCE_SETTINGS.accent;
  const accent = preset === "custom" && isHexColor(rawAccent) ? rawAccent : preset === "custom" ? DEFAULT_APPEARANCE_SETTINGS.accent : themePresets[preset];
  return {
    mode: oneOf(source.mode, themeModes, DEFAULT_APPEARANCE_SETTINGS.mode),
    preset,
    accent,
    neutralTone: oneOf(source.neutralTone, neutralTones, DEFAULT_APPEARANCE_SETTINGS.neutralTone),
    bodyFont: oneOf(source.bodyFont, interfaceFonts, DEFAULT_APPEARANCE_SETTINGS.bodyFont),
    headingFont: oneOf(source.headingFont, headingFonts, DEFAULT_APPEARANCE_SETTINGS.headingFont),
    density: oneOf(source.density, densityScales, DEFAULT_APPEARANCE_SETTINGS.density),
    radius: oneOf(source.radius, radiusScales, DEFAULT_APPEARANCE_SETTINGS.radius),
    surface: oneOf(source.surface, surfaceStyles, DEFAULT_APPEARANCE_SETTINGS.surface),
    sidebarStyle: oneOf(source.sidebarStyle, sidebarStyles, DEFAULT_APPEARANCE_SETTINGS.sidebarStyle),
    sidebarAccent: oneOf(source.sidebarAccent, sidebarAccents, DEFAULT_APPEARANCE_SETTINGS.sidebarAccent),
    sidebarWidth: oneOf(source.sidebarWidth, sidebarWidths, DEFAULT_APPEARANCE_SETTINGS.sidebarWidth),
  };
}

export function cloneAppearanceSettings(value: AppearanceSettings): AppearanceSettings {
  return { ...value };
}

export function validateAppearanceSettings(value: AppearanceSettings, locale: Locale = "fa-IR"): string | null {
  if (!themeModes.includes(value.mode)) return translateSystem(locale, "Selected display mode is invalid.");
  if (!themePresetsList.includes(value.preset)) return translateSystem(locale, "Selected color palette is invalid.");
  if (!neutralTones.includes(value.neutralTone)) return translateSystem(locale, "Selected neutral tone is invalid.");
  if (!interfaceFonts.includes(value.bodyFont) || !headingFonts.includes(value.headingFont)) return translateSystem(locale, "Selected font is invalid.");
  if (!densityScales.includes(value.density)) return translateSystem(locale, "Selected density is invalid.");
  if (!radiusScales.includes(value.radius)) return translateSystem(locale, "Selected corner radius is invalid.");
  if (!surfaceStyles.includes(value.surface)) return translateSystem(locale, "Selected card surface is invalid.");
  if (!sidebarStyles.includes(value.sidebarStyle) || !sidebarAccents.includes(value.sidebarAccent) || !sidebarWidths.includes(value.sidebarWidth)) return translateSystem(locale, "Selected navigation style is invalid.");
  if (value.preset === "custom" && !isHexColor(value.accent)) return translateSystem(locale, "Custom color must be a six-digit hex value such as #06b6d4.");
  return null;
}

export function normalizeAppearanceSettings(value: AppearanceSettings): AppearanceSettings {
  return sanitizeAppearanceSettings(value);
}

function resolvePreviewColors(mode: ResolvedThemeMode, tone: NeutralTone, surface: SurfaceStyle): PreviewColors {
  const base = toneColors[tone][mode];
  if (surface === "neutral") return base;
  if (surface === "contrast") {
    return mode === "light"
      ? { ...base, page: `color-mix(in srgb, ${base.page} 76%, ${base.text} 24%)`, surface2: `color-mix(in srgb, ${base.surface2} 88%, ${base.text} 12%)` }
      : { ...base, page: `color-mix(in srgb, ${base.page} 78%, #000000 22%)`, surface2: `color-mix(in srgb, ${base.surface2} 86%, #ffffff 14%)` };
  }
  return base;
}

export function createAppearancePreviewTokens(value: AppearanceSettings, resolvedMode: ResolvedThemeMode, language: "fa" | "en" = "fa"): Record<string, string> {
  const safeValue = sanitizeAppearanceSettings(value);
  const accentTokens = resolveAccentTokens(resolveAccent(safeValue), resolvedMode);
  const colors = resolvePreviewColors(resolvedMode, safeValue.neutralTone, safeValue.surface);
  const radius = radiusTokens[safeValue.radius];
  const density = densityTokens[safeValue.density];
  const sidebarWidth = sidebarWidthTokens[safeValue.sidebarWidth];
  return {
    "--accent": accentTokens.accent,
    "--accent-fill": accentTokens.fill,
    "--accent-foreground": accentTokens.foreground,
    "--accent-strong": accentTokens.strong,
    "--accent-soft": `color-mix(in srgb, ${accentTokens.accent} 14%, transparent)`,
    "--page": safeValue.surface === "tinted" ? `color-mix(in srgb, ${accentTokens.accent} ${resolvedMode === "dark" ? "4.2%" : "1.8%"}, ${colors.page})` : colors.page,
    "--surface-1": colors.surface1,
    "--surface-2": safeValue.surface === "tinted" ? `color-mix(in srgb, ${accentTokens.accent} ${resolvedMode === "dark" ? "4.6%" : "1.4%"}, ${colors.surface2})` : colors.surface2,
    "--surface-raised": `color-mix(in srgb, ${accentTokens.accent} ${resolvedMode === "dark" ? "4.8%" : "2.2%"}, ${colors.surface1})`,
    "--surface-accent": `color-mix(in srgb, ${accentTokens.accent} ${resolvedMode === "dark" ? "8%" : "5.5%"}, ${colors.surface1})`,
    "--dashboard-border": `color-mix(in srgb, ${accentTokens.accent} ${resolvedMode === "dark" ? "9.5%" : "6%"}, ${colors.border})`,
    "--text": colors.text,
    "--text-muted": colors.muted,
    "--border": colors.border,
    "--card-radius": radius.card,
    "--control-radius": radius.control,
    "--control-radius-sm": radius.controlSm,
    "--micro-radius": radius.micro,
    "--control-height": density.controlHeight,
    "--control-height-sm": density.controlHeightSm,
    "--density-space": density.spaceUnit,
    "--surface-shadow": safeValue.surface === "neutral" ? (resolvedMode === "dark" ? "0 8px 22px rgb(0 0 0 / 16%)" : "0 4px 16px rgb(15 23 42 / 3%)") : safeValue.surface === "contrast" ? (resolvedMode === "dark" ? "0 12px 30px rgb(0 0 0 / 24%)" : "0 10px 28px rgb(15 23 42 / 7%)") : (resolvedMode === "dark" ? "0 10px 28px rgb(0 0 0 / 16%)" : "0 8px 24px rgb(15 23 42 / 4%)"),
    "--app-body-font": appearanceFontStack(safeValue.bodyFont, language),
    "--app-body-font-fa": appearanceFontStack(safeValue.bodyFont, "fa"),
    "--app-heading-font": appearanceFontStack(safeValue.headingFont, language),
    "--app-heading-font-fa": appearanceFontStack(safeValue.headingFont, "fa"),
    "--shell-sidebar-width": sidebarWidth.shell,
    "--shell-content-offset": sidebarWidth.offset,
    "--preview-sidebar-width": sidebarWidth.preview,
    "--sidebar-background": safeValue.sidebarStyle === "soft" ? "linear-gradient(180deg,var(--surface-1),var(--surface-raised))" : safeValue.sidebarStyle === "solid" ? "color-mix(in srgb,var(--accent) 6%,var(--surface-1))" : "var(--surface-1)",
    "--sidebar-border": safeValue.sidebarStyle === "outline" ? "color-mix(in srgb, var(--accent) 30%, var(--border))" : "var(--border)",
    "--sidebar-active-bg": safeValue.sidebarAccent === "filled" ? "var(--accent-fill)" : "var(--surface-accent)",
    "--sidebar-active-fg": safeValue.sidebarAccent === "filled" ? "var(--accent-foreground)" : "var(--accent-strong)",
    "--sidebar-active-icon-bg": safeValue.sidebarAccent === "filled" ? `color-mix(in srgb, ${accentTokens.foreground} 12%, transparent)` : "var(--surface-1)",
    "--sidebar-utility-bg": "var(--surface-accent)",
    "--sidebar-utility-fg": "var(--accent-strong)",
    colorScheme: resolvedMode,
  };
}

function isAppearancePresetSettings(value: unknown): value is AppearanceSettings {
  if (!isObject(value)) return false;
  return themeModes.includes(value.mode as ThemeMode)
    && themePresetsList.includes(value.preset as ThemePreset)
    && typeof value.accent === "string"
    && isHexColor(value.accent)
    && neutralTones.includes(value.neutralTone as NeutralTone)
    && interfaceFonts.includes(value.bodyFont as InterfaceFont)
    && headingFonts.includes(value.headingFont as HeadingFont)
    && densityScales.includes(value.density as DensityScale)
    && radiusScales.includes(value.radius as RadiusScale)
    && surfaceStyles.includes(value.surface as SurfaceStyle)
    && (value.sidebarStyle === undefined || sidebarStyles.includes(value.sidebarStyle as SidebarStyle))
    && (value.sidebarAccent === undefined || sidebarAccents.includes(value.sidebarAccent as SidebarAccent))
    && (value.sidebarWidth === undefined || sidebarWidths.includes(value.sidebarWidth as SidebarWidth));
}

export function serializeAppearancePreset(value: AppearanceSettings): string {
  return JSON.stringify({ kind: APPEARANCE_PRESET_KIND, version: APPEARANCE_PRESET_VERSION, appearance: sanitizeAppearanceSettings(value) }, null, 2);
}

export function parseAppearancePreset(source: string): AppearanceSettings | null {
  try {
    const payload: unknown = JSON.parse(source);
    if (!isObject(payload) || payload.kind !== APPEARANCE_PRESET_KIND || payload.version !== APPEARANCE_PRESET_VERSION) return null;
    if (!isAppearancePresetSettings(payload.appearance)) return null;
    const normalized = sanitizeAppearanceSettings(payload.appearance);
    if (validateAppearanceSettings(normalized, "en")) return null;
    return normalized;
  } catch {
    return null;
  }
}
