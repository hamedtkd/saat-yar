import { CheckCircle2, Download, Eye, EyeOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WorkspaceSwitcher } from "./workspace-switcher";

type Props = { mode: Mode; saveState: "idle" | "saving" | "saved" | "error"; financialsHidden: boolean; onModeChange: (mode: Mode) => void; onToggleFinancials: () => void; onExport: () => void; onSettings: () => void; appearance: AppearanceSettings; onThemeModeChange: (mode: ThemeMode) => void };

export function HeaderActions(props: Props) {
  const saveLabel = props.saveState === "saving" ? "در حال ذخیره" : props.saveState === "error" ? "خطای ذخیره" : "ذخیره شد";
  return <div className="flex min-w-0 items-center justify-end gap-2">
    <span className={props.saveState === "error" ? "hidden text-xs font-bold text-[var(--danger)] lg:inline-flex" : "hidden items-center gap-1.5 text-xs font-bold text-[var(--accent-strong)] lg:inline-flex"} role="status" aria-live="polite"><CheckCircle2 aria-hidden="true" className="size-4" />{saveLabel}</span>
    <WorkspaceSwitcher mode={props.mode} onChange={props.onModeChange} />
    <div className="flex items-center gap-1 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] p-1">
      <ThemeToggle mode={props.appearance.mode} onChange={props.onThemeModeChange} />
      <Button className="size-9 border-0 bg-transparent shadow-none" variant="outline" size="icon" onClick={props.onToggleFinancials} aria-label={props.financialsHidden ? "نمایش اطلاعات مالی" : "مخفی کردن اطلاعات مالی"}>{props.financialsHidden ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>
      <Button className="size-9 border-0 bg-transparent shadow-none max-[520px]:hidden" variant="outline" size="icon" onClick={props.onExport} aria-label="دانلود پشتیبان"><Download aria-hidden="true" /></Button>
      <Button className="size-9 border-0 bg-transparent shadow-none max-[720px]:hidden" variant="outline" size="icon" onClick={props.onSettings} aria-label="باز کردن تنظیمات"><Settings aria-hidden="true" /></Button>
    </div>
  </div>;
}
