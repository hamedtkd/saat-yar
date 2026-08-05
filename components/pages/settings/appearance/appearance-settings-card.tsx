"use client";

import { Check, Palette, RotateCcw } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { defaultSettings } from "@/lib/constants";
import { isHexColor, themePresets } from "@/lib/theme";
import type { AppData, AppearanceSettings, RadiusScale, ThemeMode, ThemePreset } from "@/lib/types";

const modeLabels: Record<ThemeMode, string> = { light: "روشن", dark: "تاریک", system: "سیستم" };
const presetLabels: Record<ThemePreset, string> = { spotify: "Spotify", emerald: "زمردی", ocean: "اقیانوسی", violet: "بنفش", sunset: "غروب", custom: "سفارشی" };
const radiusLabels: Record<RadiusScale, string> = { compact: "فشرده", balanced: "متعادل", rounded: "گرد" };

type Props = { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void };
export function AppearanceSettingsCard({ data, setData, setToast }: Props) {
  const appearance = data.settings.appearance;
  const update = (patch: Partial<AppearanceSettings>) => setData((prev) => ({ ...prev, settings: { ...prev.settings, appearance: { ...prev.settings.appearance, ...patch } } }));
  return <SurfaceCard as="section" className="col-span-full grid gap-5 p-5 md:p-6">
    <header className="flex items-center justify-between gap-3"><div><h2 className="m-0 flex items-center gap-2 text-base font-extrabold"><Palette /> ظاهر و رنگ‌بندی</h2><p className="mt-1 text-xs text-[var(--text-muted)]">تم روشن، تاریک یا سیستم و رنگ اصلی ساعت‌یار را انتخاب کن.</p></div><Button variant="ghost" size="sm" onClick={() => { update(defaultSettings.appearance); setToast("ظاهر پیش‌فرض بازگردانده شد"); }}><RotateCcw /> بازنشانی</Button></header>
    <fieldset className="grid gap-2"><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">حالت نمایش</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(modeLabels) as ThemeMode[]).map((mode) => <button key={mode} type="button" onClick={() => update({ mode })} className={cn("min-h-11 rounded-[var(--control-radius)] border px-3 text-sm font-bold", appearance.mode === mode ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] bg-[var(--surface-2)]")}>{modeLabels[mode]}</button>)}</div></fieldset>
    <fieldset className="grid gap-2"><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">پالت رنگ</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{(Object.keys(presetLabels) as ThemePreset[]).map((preset) => { const color = preset === "custom" ? appearance.accent : themePresets[preset]; return <button key={preset} type="button" onClick={() => update({ preset, accent: color })} className={cn("relative grid min-h-16 place-items-center gap-1 rounded-[var(--control-radius)] border bg-[var(--surface-2)] p-2 text-[11px] font-bold", appearance.preset === preset ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--border)]")}><span className="size-6 rounded-full border border-white/20" style={{ backgroundColor: color }} />{presetLabels[preset]}{appearance.preset === preset && <Check className="absolute left-1.5 top-1.5 size-3.5 text-[var(--accent-strong)]" />}</button>; })}</div></fieldset>
    {appearance.preset === "custom" && <label className="max-w-xs">رنگ سفارشی<input type="color" value={isHexColor(appearance.accent) ? appearance.accent : "#1ed760"} onChange={(event) => update({ accent: event.target.value })} className="h-12 w-full rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-1" /></label>}
    <fieldset className="grid gap-2"><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">گردی گوشه‌ها</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(radiusLabels) as RadiusScale[]).map((radius) => <button key={radius} type="button" onClick={() => update({ radius })} className={cn("min-h-11 border px-3 text-sm font-bold", radius === "compact" ? "rounded-lg" : radius === "balanced" ? "rounded-xl" : "rounded-2xl", appearance.radius === radius ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "border-[var(--border)] bg-[var(--surface-2)]")}>{radiusLabels[radius]}</button>)}</div></fieldset>
  </SurfaceCard>;
}
