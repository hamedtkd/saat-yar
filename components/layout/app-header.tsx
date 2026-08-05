"use client";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "@/components/common/brand";
import { cn } from "@/lib/cn";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { HeaderActions } from "./app-header/header-actions";

type Props = { name: string; mode: Mode; pathname?: string; onModeChange: (mode: Mode) => void; onExport: () => void; financialsHidden: boolean; onToggleFinancials: () => void; saveState: "idle" | "saving" | "saved" | "error"; appearance: AppearanceSettings; onThemeModeChange: (mode: ThemeMode) => void };
export function AppHeader(props: Props) {
  const router = useRouter();
  const currentPath = usePathname() || props.pathname || "/today";
  const changeMode = (mode: Mode) => {
    props.onModeChange(mode);
    if (mode === "employee" && ["/clients", "/projects", "/invoices"].includes(currentPath)) router.push("/today");
    if (mode === "freelancer" && ["/month", "/leave"].includes(currentPath)) router.push("/today");
  };
  return <header className={cn("sticky top-3 z-30 flex min-h-[60px] items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-glass)] px-5 py-2 shadow-[0_6px_20px_rgba(0,0,0,.035)] backdrop-blur-xl xl:mr-[264px]", "max-[640px]:top-2 max-[640px]:min-h-14 max-[640px]:rounded-2xl max-[640px]:px-3 max-[640px]:py-1.5")}>
    <div className="xl:hidden"><Brand subtitle={props.name ? `فضای شخصی ${props.name}` : "ساعت‌یار"} /></div>
    <div className="hidden xl:block"><p className="text-xs font-semibold text-[var(--text-muted)]">فضای کاری شخصی</p><strong className="text-sm text-[var(--text)]">{props.name || "کاربر ساعت‌یار"}</strong></div>
    <HeaderActions mode={props.mode} saveState={props.saveState} financialsHidden={props.financialsHidden} onModeChange={changeMode} onToggleFinancials={props.onToggleFinancials} onExport={props.onExport} onSettings={() => router.push("/settings")} appearance={props.appearance} onThemeModeChange={props.onThemeModeChange} />
  </header>;
}
