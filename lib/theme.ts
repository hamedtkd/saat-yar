import type { AppearanceSettings, ThemePreset } from "./types.ts";

export const THEME_STORAGE_KEY = "saatyar-appearance";
export const themePresets: Record<Exclude<ThemePreset, "custom">, string> = {
  spotify: "#1ed760",
  emerald: "#10b981",
  ocean: "#0ea5e9",
  violet: "#8b5cf6",
  sunset: "#f97316",
};

export function resolveAccent(settings: AppearanceSettings) {
  return settings.preset === "custom" ? settings.accent : themePresets[settings.preset];
}

export function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
