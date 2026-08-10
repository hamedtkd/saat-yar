"use client";

import { BrandMark } from "@/components/common/brand-mark";
import { AppToast } from "@/components/common/app-toast";
import { usePathname } from "next/navigation";
import { createContext, Suspense, useContext } from "react";
import { SkipLink } from "@/components/common/skip-link";
import { ThemeRuntime } from "@/components/theme/theme-runtime";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { MultiTabSyncBanner } from "@/components/layout/multi-tab-sync-banner";
import { LiveTimerOwnershipBanner } from "@/components/layout/live-timer-ownership-banner";
import { SidebarNav } from "@/components/layout/navigation/sidebar-nav";
import { MobileBottomNav } from "@/components/layout/navigation/mobile-bottom-nav";
import { PwaExperience } from "@/components/pwa/pwa-experience";
import { UnsavedNavigationProvider } from "@/components/layout/navigation/unsaved-navigation-provider";
import { RouteGuard } from "@/components/layout/navigation/route-guard";
import { RouteSync } from "@/components/layout/route-sync";
import { useSaatyarController } from "@/hooks/use-saatyar-controller";
import { cn } from "@/lib/cn";
import { normalizePathname } from "@/lib/navigation";
import { useLocale } from "@/components/i18n/locale-provider";

const SaatyarContext = createContext<ReturnType<typeof useSaatyarController> | null>(null);

export function useSaatyarContext() {
  const context = useContext(SaatyarContext);
  if (!context) throw new Error("useSaatyarContext must be used within SaatyarShell");
  return context;
}

export function SaatyarShell({ children }: { children: React.ReactNode }) {
  const controller = useSaatyarController();
  const { direction, t } = useLocale();
  const pathname = usePathname() || "/today";
  const { ready, selectedDate, setSelectedDate, data } = controller;
  const mode = data.settings.mode;

  if (!controller.ready)
    return (
      <main
        className={cn(
          "grid min-h-screen place-content-center gap-3 font-extrabold text-[var(--accent-strong)]",
        )}
      >
        <span className="grid w-full place-items-center">
          <BrandMark size={58} label={t("app.logoLabel")} />
        </span>
        {t("app.loading")}
      </main>
    );

  const { setData } = controller;
  const onboardingRoute = normalizePathname(pathname) === "/onboarding";

  return (
    <SaatyarContext.Provider value={controller}>
      <ThemeRuntime appearance={data.settings.appearance} />
      <RouteGuard
        mode={mode}
        pathname={pathname}
        ready={ready}
        onboarded={data.settings.onboarded}
      />

      {onboardingRoute ? (
        <>
          <SkipLink />
          <main id="main-content" role="main" tabIndex={-1} className="min-h-screen bg-[var(--page)]" dir={direction}>
            {controller.toast && <AppToast message={controller.toast} />}
            {children}
          </main>
        </>
      ) : (
        <UnsavedNavigationProvider>
          <Suspense fallback={null}>
            <RouteSync selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </Suspense>
          <SkipLink />
          <main
            className={cn(
              "dashboard-shell min-h-screen w-full bg-[var(--page)] p-2 pb-28 sm:p-3 sm:pb-28 xl:px-0 xl:pb-3 [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[11px] [&_label]:font-semibold [&_label]:text-[var(--text-muted)] [&_button]:cursor-pointer [&_svg.lucide]:h-[18px] [&_svg.lucide]:w-[18px] [&_svg.lucide]:stroke-[1.85]",
            )}
            dir={direction}
          >
            {controller.toast && <AppToast message={controller.toast} />}

            <SidebarNav mode={data.settings.mode} currentPath={pathname} name={data.settings.name} />

            <AppHeader
              name={data.settings.name}
              mode={data.settings.mode}
              pathname={pathname}
              onModeChange={controller.changeMode}
              onExport={controller.exportBackup}
              financialsHidden={controller.financialsHidden}
              onToggleFinancials={() => controller.setFinancialsHidden((value) => !value)}
              saveState={controller.saveState}
              appearance={data.settings.appearance}
              onThemeModeChange={(appearanceMode) => setData((previous) => ({ ...previous, settings: { ...previous.settings, appearance: { ...previous.settings.appearance, mode: appearanceMode } } }))}
            />

            <PwaExperience />

            <LiveTimerOwnershipBanner blocked={controller.liveTimerOwnership.blocked} owner={controller.liveTimerOwnership.owner} onTakeOver={controller.liveTimerOwnership.takeOver} />

            <MultiTabSyncBanner
              pending={controller.externalSyncPending}
              onReload={() => { void controller.reloadExternalData(); }}
              onDismiss={controller.dismissExternalSync}
            />

            <div
              id="main-content"
              role="main"
              tabIndex={-1}
              className={cn(
                "shell-main-offset mx-auto max-w-[var(--shell-content-max)] px-1 pb-6 pt-4 sm:px-3 sm:pt-5 lg:px-5",
              )}
            >
              {children}
            </div>

            <div className="shell-main-offset"><AppFooter online={controller.online} /></div>
            <MobileBottomNav mode={data.settings.mode} currentPath={pathname} />
          </main>
        </UnsavedNavigationProvider>
      )}
    </SaatyarContext.Provider>
  );
}
