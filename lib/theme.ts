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

type Rgb = { r: number; g: number; b: number };

function hexToRgb(value: string): Rgb {
  const safe = isHexColor(value) ? value : themePresets.spotify;
  return {
    r: Number.parseInt(safe.slice(1, 3), 16),
    g: Number.parseInt(safe.slice(3, 5), 16),
    b: Number.parseInt(safe.slice(5, 7), 16),
  };
}

function channelLuminance(channel: number) {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function readableAccentForeground(accent: string) {
  const { r, g, b } = hexToRgb(accent);
  const luminance = 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
  return luminance > 0.24 ? "#07130c" : "#ffffff";
}

function mixChannel(source: number, target: number, amount: number) {
  return Math.round(source + (target - source) * amount);
}

function toHex(channel: number) {
  return channel.toString(16).padStart(2, "0");
}

export function accentStrong(accent: string, theme: "light" | "dark") {
  const { r, g, b } = hexToRgb(accent);
  const target = theme === "dark" ? 255 : 0;
  const amount = theme === "dark" ? 0.28 : 0.34;
  return `#${toHex(mixChannel(r, target, amount))}${toHex(mixChannel(g, target, amount))}${toHex(mixChannel(b, target, amount))}`;
}

export function resolveAccentTokens(accent: string, theme: "light" | "dark") {
  return {
    accent,
    foreground: readableAccentForeground(accent),
    strong: accentStrong(accent, theme),
  };
}
