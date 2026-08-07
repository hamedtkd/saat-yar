"use client";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "@/components/common/brand";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { cn } from "@/lib/cn";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { HeaderActions } from "./app-header/header-actions";

type Props = { name: string; mode: Mode; pathname?: string; onModeChange: (mode: Mode) => void; onExport: () => void; financialsHidden: boolean; onToggleFinancials: () => void; saveState: "idle" | "saving" | "saved" | "error"; appearance: AppearanceSettings; onThemeModeChange: (mode: ThemeMode) => void };
export function AppHeader(props: Props) {
  const router = useRouter();
  const { requestNavigation } = useUnsavedNavigation();
  const currentPath = usePathname() || props.pathname || "/today";
  const changeMode = (mode: Mode) => {
    const needsRedirect =
      (mode === "employee" && ["/clients", "/projects", "/invoices"].includes(currentPath)) ||
      (mode === "freelancer" && ["/month", "/leave"].includes(currentPath));
    if (!needsRedirect) return props.onModeChange(mode);
    requestNavigation(() => {
      props.onModeChange(mode);
      router.push("/today");
    });
  };
  return <header className={cn("sticky top-3 z-30 flex min-h-[60px] items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-4 py-2 shadow-[0_6px_20px_rgba(0,0,0,.035)] backdrop-blur-xl xl:mr-[264px]", "max-[640px]:top-2 max-[640px]:min-h-14 max-[640px]:rounded-2xl max-[640px]:px-3 max-[640px]:py-1.5")}> 
    <div className="xl:hidden"><Brand subtitle={props.name ? `فضای شخصی ${props.name}` : "ساعت‌یار"} /></div>
    <div className="hidden items-center gap-3 xl:flex"><span className="grid size-10 place-items-center rounded-[14px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] text-sm font-black text-[var(--accent-strong)]">{(props.name || "س").trim().slice(0, 1)}</span><div><p className="text-[10px] font-semibold text-[var(--text-muted)]">فضای کاری شخصی</p><strong className="text-sm text-[var(--text)]">{props.name || "کاربر ساعت‌یار"}</strong></div></div>
    <HeaderActions mode={props.mode} saveState={props.saveState} financialsHidden={props.financialsHidden} onModeChange={changeMode} onToggleFinancials={props.onToggleFinancials} onExport={props.onExport} onSettings={() => requestNavigation(() => router.push("/settings"))} appearance={props.appearance} onThemeModeChange={props.onThemeModeChange} />
  </header>;
}
