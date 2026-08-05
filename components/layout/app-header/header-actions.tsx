import { CheckCircle2, Download, Eye, EyeOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WorkspaceSwitcher } from "./workspace-switcher";

type Props = { mode: Mode; saveState: "idle" | "saving" | "saved" | "error"; financialsHidden: boolean; onModeChange: (mode: Mode) => void; onToggleFinancials: () => void; onExport: () => void; onSettings: () => void; appearance: AppearanceSettings; onThemeModeChange: (mode: ThemeMode) => void };
export function HeaderActions(props: Props) {
  return <div className={cn("flex items-center justify-end gap-[9px]", "max-[900px]:[&>button:last-child]:h-11 max-[900px]:[&>button:last-child]:w-11 max-[900px]:[&>button:last-child]:overflow-hidden max-[900px]:[&>button:last-child]:px-0 max-[900px]:[&>button:last-child]:text-[0px]", "max-[620px]:[&>button:first-of-type]:hidden")}>
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold [&_svg]:h-[15px] [&_svg]:w-[15px] max-[1180px]:hidden", props.saveState === "error" ? "text-red-600" : "text-[var(--accent-strong)]")} role="status" aria-live="polite"><CheckCircle2 aria-hidden="true" />{props.saveState === "saving" ? "در حال ذخیره" : props.saveState === "error" ? "خطای ذخیره" : "ذخیره خودکار"}</span>
    <WorkspaceSwitcher mode={props.mode} onChange={props.onModeChange} />
    <ThemeToggle mode={props.appearance.mode} onChange={props.onThemeModeChange} />
    <Button className="min-w-11" variant="outline" size="icon" onClick={props.onToggleFinancials} aria-label={props.financialsHidden ? "نمایش اطلاعات مالی" : "مخفی کردن اطلاعات مالی"}>{props.financialsHidden ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</Button>
    <Button className="min-w-11" variant="outline" size="icon" onClick={props.onExport} aria-label="دانلود پشتیبان"><Download aria-hidden="true" /></Button>
    <Button variant="outline" onClick={props.onSettings} className="justify-center" aria-label="باز کردن تنظیمات"><Settings aria-hidden="true" /><span className="hidden lg:block">تنظیمات</span></Button>
  </div>;
}
