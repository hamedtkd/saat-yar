"use client";

import { Palette, RotateCcw } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultSettings } from "@/lib/constants";
import { isHexColor, themePresets } from "@/lib/theme";
import type { AppData, AppearanceSettings, RadiusScale, SurfaceStyle, ThemeMode, ThemePreset } from "@/lib/types";
import { AppearanceOption } from "./appearance-option";
import { ThemePreview } from "./theme-preview";

const modeLabels: Record<ThemeMode, string> = { light: "روشن", dark: "تاریک", system: "سیستم" };
const presetLabels: Record<ThemePreset, string> = { spotify: "Spotify", emerald: "زمردی", ocean: "اقیانوسی", violet: "بنفش", sunset: "غروب", custom: "سفارشی" };
const radiusLabels: Record<RadiusScale, string> = { compact: "فشرده", balanced: "متعادل", rounded: "گرد" };
const surfaceLabels: Record<SurfaceStyle, string> = { neutral: "خنثی", tinted: "رنگی ملایم", contrast: "پرکنتراست" };

type Props = { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; setToast: (message: string) => void };
export function AppearanceSettingsCard({ data, setData, setToast }: Props) {
  const appearance = data.settings.appearance;
  const update = (patch: Partial<AppearanceSettings>) => setData((prev) => ({ ...prev, settings: { ...prev.settings, appearance: { ...prev.settings.appearance, ...patch } } }));
  return <SurfaceCard as="section" className="col-span-full grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_320px] md:p-6">
    <div className="grid gap-5">
      <header className="flex items-start justify-between gap-3"><div><h2 className="m-0 flex items-center gap-2 text-base font-extrabold"><Palette /> ظاهر و رنگ‌بندی</h2><p className="mt-1 text-xs text-[var(--text-muted)]">تم، رنگ اصلی، سطح کارت‌ها و گردی رابط را شخصی‌سازی کن.</p></div><Button variant="ghost" size="sm" onClick={() => { update(defaultSettings.appearance); setToast("ظاهر پیش‌فرض بازگردانده شد"); }}><RotateCcw /> بازنشانی</Button></header>
      <fieldset><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">حالت نمایش</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(modeLabels) as ThemeMode[]).map((mode) => <AppearanceOption key={mode} active={appearance.mode === mode} label={modeLabels[mode]} onClick={() => update({ mode })} />)}</div></fieldset>
      <fieldset><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">پالت رنگ</legend><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{(Object.keys(presetLabels) as ThemePreset[]).map((preset) => { const color = preset === "custom" ? appearance.accent : themePresets[preset]; return <AppearanceOption key={preset} active={appearance.preset === preset} label={presetLabels[preset]} onClick={() => update({ preset, accent: color })} className="grid min-h-20 place-items-center"><span className="size-7 rounded-full border border-[var(--border)]" style={{ backgroundColor: color }} /></AppearanceOption>; })}</div></fieldset>
      {appearance.preset === "custom" && <label className="grid max-w-sm gap-2 text-xs font-bold text-[var(--text-muted)]">رنگ سفارشی<div className="grid grid-cols-[56px_1fr] gap-2"><input aria-label="انتخاب رنگ سفارشی" type="color" value={isHexColor(appearance.accent) ? appearance.accent : "#1ed760"} onChange={(event) => update({ accent: event.target.value })} className="h-11 w-14 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-1" /><Input dir="ltr" value={appearance.accent} onChange={(event) => isHexColor(event.target.value) && update({ accent: event.target.value })} /></div></label>}
      <fieldset><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">سطح کارت‌ها</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(surfaceLabels) as SurfaceStyle[]).map((surface) => <AppearanceOption key={surface} active={appearance.surface === surface} label={surfaceLabels[surface]} onClick={() => update({ surface })} />)}</div></fieldset>
      <fieldset><legend className="mb-2 text-xs font-bold text-[var(--text-muted)]">گردی گوشه‌ها</legend><div className="grid grid-cols-3 gap-2">{(Object.keys(radiusLabels) as RadiusScale[]).map((radius) => <AppearanceOption key={radius} active={appearance.radius === radius} label={radiusLabels[radius]} onClick={() => update({ radius })} className={radius === "compact" ? "rounded-lg" : radius === "balanced" ? "rounded-xl" : "rounded-2xl"} />)}</div></fieldset>
    </div>
    <div className="md:sticky md:top-24 md:self-start"><ThemePreview /></div>
  </SurfaceCard>;
}
