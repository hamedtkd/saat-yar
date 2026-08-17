"use client";

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
import { isPublicRoute, normalizePathname } from "@/lib/navigation";
import { useLocale } from "@/components/i18n/locale-provider";
import { ProductAnalyticsRuntime } from "@/components/analytics/product-analytics-runtime";
import { AppLoadingState } from "@/components/motion/app-loading-state";
import { RouteMotionBoundary } from "@/components/motion/route-motion-boundary";
import { CalendarIntegrationProvider } from "@/components/calendar/calendar-integration-provider";
import { PublicHeader } from "@/components/layout/public-header";

const SaatyarContext = createContext<ReturnType<typeof useSaatyarController> | null>(null);

export function useSaatyarContext() {
  const context = useContext(SaatyarContext);
  if (!context) throw new Error("useSaatyarContext must be used within SaatyarShell");
  return context;
}

export function SaatyarShell({ children }: { children: React.ReactNode }) {
  const { calendar, direction, t } = useLocale();
  const controller = useSaatyarController(calendar);
  const pathname = usePathname() || "/today";
  const { ready, selectedDate, setSelectedDate, data } = controller;
  const mode = data.settings.mode;

  if (!controller.ready)
    return <AppLoadingState label={t("app.loading")} logoLabel={t("app.logoLabel")} pathname={pathname} />;

  const { setData } = controller;
  const normalizedPath = normalizePathname(pathname);
  const onboardingRoute = normalizedPath === "/onboarding";
  const publicRoute = isPublicRoute(normalizedPath);

  return (
    <SaatyarContext.Provider value={controller}>
      <CalendarIntegrationProvider onToast={controller.setToast}>
        <ThemeRuntime appearance={data.settings.appearance} />
        <ProductAnalyticsRuntime pathname={pathname} saveError={Boolean(controller.saveError)} />
        <RouteGuard
          mode={mode}
          pathname={pathname}
          ready={ready}
          onboarded={data.settings.onboarded}
        />

        {onboardingRoute || publicRoute ? (
          <>
            <SkipLink />
            <main className="min-h-screen w-full min-w-0 overflow-x-clip bg-[var(--page)] px-2.5 py-3 sm:px-5 sm:py-5" dir={direction}>
              {controller.toast && <AppToast message={controller.toast} />}
              {publicRoute && (
                <PublicHeader
                  appearance={data.settings.appearance}
                  onThemeModeChange={(appearanceMode) => setData((previous) => ({ ...previous, settings: { ...previous.settings, appearance: { ...previous.settings.appearance, mode: appearanceMode } } }))}
                />
              )}
              <div id="main-content" role="main" tabIndex={-1} className="mx-auto mt-3 w-full min-w-0 max-w-5xl overflow-x-clip sm:mt-5">
                <RouteMotionBoundary pathname={pathname}>{children}</RouteMotionBoundary>
              </div>
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
                "dashboard-shell min-h-screen w-full min-w-0 overflow-x-clip bg-[var(--page)] p-2 pb-28 sm:p-3 sm:pb-28 xl:px-0 xl:pb-3 [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[11px] [&_label]:font-semibold [&_label]:text-[var(--text-muted)] [&_button]:cursor-pointer [&_svg.lucide]:h-[18px] [&_svg.lucide]:w-[18px] [&_svg.lucide]:stroke-[1.85]",
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
                  "shell-main-offset mx-auto w-full min-w-0 max-w-[var(--shell-content-max)] px-1 pb-6 pt-4 sm:px-3 sm:pt-5 lg:px-5",
                )}
              >
                <RouteMotionBoundary pathname={pathname}>{children}</RouteMotionBoundary>
              </div>

              <div className="shell-main-offset w-full min-w-0"><AppFooter online={controller.online} /></div>
              <MobileBottomNav mode={data.settings.mode} currentPath={pathname} />
            </main>
          </UnsavedNavigationProvider>
        )}
      </CalendarIntegrationProvider>
    </SaatyarContext.Provider>
  );
}
