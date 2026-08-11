"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUnsavedNavigation } from "@/components/layout/navigation/unsaved-navigation-provider";
import { cn } from "@/lib/cn";
import type { AppearanceSettings, Mode, ThemeMode } from "@/lib/types";
import { HeaderActions } from "./app-header/header-actions";
import { getRouteNavItem } from "./app-header/nav-items";
import { ProfileMenu } from "./app-header/profile-menu";
import { useLocale } from "@/components/i18n/locale-provider";

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
  const { t } = useLocale();
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

  const navigateToSettings = (hash: string) => {
    requestNavigation(() => router.push(`/settings#${hash}`));
  };

  return (
    <header
      className={cn(
        "shell-main-offset sticky top-2 z-50 mx-auto flex min-h-[62px] max-w-[var(--shell-content-max)] items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] px-3.5 py-2 shadow-[0_6px_20px_rgba(0,0,0,.035)] backdrop-blur-xl sm:px-4",
        "max-[640px]:min-h-[58px] max-[640px]:rounded-[18px] max-[640px]:px-2.5 max-[640px]:py-1.5",
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <RouteIcon aria-hidden="true" className="size-[18px]" />
        </span>
        <div className="min-w-0 max-[520px]:hidden">
          <p className="hidden text-[9px] font-semibold text-[var(--text-muted)] sm:block">{t("app.personalWorkspace")}</p>
          <strong className="block max-w-[82px] truncate text-[11px] text-[var(--text)] sm:max-w-[140px] sm:text-[12px]">{t(routeItem.labelKey)}</strong>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <HeaderActions
          mode={props.mode}
          saveState={props.saveState}
          financialsHidden={props.financialsHidden}
          onModeChange={changeMode}
          onToggleFinancials={props.onToggleFinancials}
          appearance={props.appearance}
          onThemeModeChange={props.onThemeModeChange}
        />
        <ProfileMenu
          name={props.name}
          mode={props.mode}
          onNavigate={navigateToSettings}
          onExport={props.onExport}
        />
      </div>
    </header>
  );
}
