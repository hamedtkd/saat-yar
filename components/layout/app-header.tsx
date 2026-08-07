"use client";

import { usePathname, useRouter } from "next/navigation";
import { Brand } from "@/components/common/brand";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { cn } from "@/lib/cn";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { HeaderActions } from "./app-header/header-actions";
import { getRouteNavItem } from "./app-header/nav-items";

type Props = {
  name: string;
  mode: Mode;
  pathname?: string;
  onModeChange: (mode: Mode) => void;
  onExport: () => void;
  financialsHidden: boolean;
  onToggleFinancials: () => void;
  saveState: "idle" | "saving" | "saved" | "error";
  appearance: AppearanceSettings;
  onThemeModeChange: (mode: ThemeMode) => void;
};

export function AppHeader(props: Props) {
  const router = useRouter();
  const { requestNavigation } = useUnsavedNavigation();
  const currentPath = usePathname() || props.pathname || "/today";
  const routeItem = getRouteNavItem(currentPath);
  const RouteIcon = routeItem.icon;

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

  return (
    <header
      className={cn(
        "shell-main-offset sticky top-2 z-30 mx-auto flex min-h-[62px] max-w-[1510px] items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-3.5 py-2 shadow-[0_6px_20px_rgba(0,0,0,.035)] backdrop-blur-xl sm:px-4",
        "max-[640px]:min-h-[58px] max-[640px]:rounded-[18px] max-[640px]:px-2.5 max-[640px]:py-1.5",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="xl:hidden">
          <Brand subtitle={props.name ? `فضای شخصی ${props.name}` : "ساعت‌یار"} />
        </div>
        <div className="hidden min-w-0 items-center gap-2.5 xl:flex">
          <span className="grid size-9 place-items-center rounded-[12px] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <RouteIcon aria-hidden="true" className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-[var(--text-muted)]">فضای کاری شخصی</p>
            <strong className="block truncate text-sm text-[var(--text)]">{routeItem.label}</strong>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <HeaderActions
          mode={props.mode}
          saveState={props.saveState}
          financialsHidden={props.financialsHidden}
          onModeChange={changeMode}
          onToggleFinancials={props.onToggleFinancials}
          onExport={props.onExport}
          onSettings={() => requestNavigation(() => router.push("/settings"))}
          appearance={props.appearance}
          onThemeModeChange={props.onThemeModeChange}
        />
        <div className="hidden h-10 items-center gap-2.5 rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-1)] px-2.5 xl:flex">
          <span className="grid size-7 place-items-center rounded-[9px] bg-[var(--surface-accent)] text-xs font-black text-[var(--accent-strong)]">
            {(props.name || "س").trim().slice(0, 1)}
          </span>
          <div className="max-w-[120px] leading-tight">
            <strong className="block truncate text-xs text-[var(--text)]">{props.name || "کاربر ساعت‌یار"}</strong>
            <span className="text-[9px] font-semibold text-[var(--text-muted)]">حساب شخصی</span>
          </div>
        </div>
      </div>
    </header>
  );
}
