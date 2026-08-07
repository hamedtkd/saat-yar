"use client";

import { CheckCircle2 } from "lucide-react";
import { BrandMark } from "@/components/common/brand-mark";
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
import { UnsavedNavigationProvider } from "@/components/layout/navigation/unsaved-navigation-provider";
import { RouteGuard } from "@/components/layout/navigation/route-guard";
import { RouteSync } from "@/components/layout/route-sync";
import { Onboarding } from "@/components/layout/onboarding";
import { useSaatyarController } from "@/hooks/use-saatyar-controller";
import { cn } from "@/lib/cn";

const SaatyarContext = createContext<ReturnType<typeof useSaatyarController> | null>(null);

export function useSaatyarContext() {
  const context = useContext(SaatyarContext);
  if (!context) throw new Error("useSaatyarContext must be used within SaatyarShell");
  return context;
}

export function SaatyarShell({ children }: { children: React.ReactNode }) {
  const controller = useSaatyarController();
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
          <BrandMark size={58} label="لوگوی ساعت‌یار" />
        </span>
        در حال آماده‌سازی ساعت‌یار…
      </main>
    );

  const { setData } = controller;

  return (
    <SaatyarContext.Provider value={controller}>
      <UnsavedNavigationProvider>
      <ThemeRuntime appearance={data.settings.appearance} />
      <RouteGuard mode={mode} pathname={pathname} ready={ready} />
      <Suspense fallback={null}>
        <RouteSync selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </Suspense>
      <SkipLink />
      <main
        className={cn(
          "min-h-screen w-full bg-[var(--page)] p-3 pb-28 xl:pb-3 [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[11px] [&_label]:font-semibold [&_label]:text-[var(--text-muted)] [&_button]:cursor-pointer [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:stroke-[1.85]",
        )}
        dir="rtl"
      >
        {controller.toast && (
          <div
            className={cn(
              "fixed left-1/2 top-[22px] z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--success)_30%,var(--border))] bg-[var(--success-soft)] px-[17px] py-[11px] text-xs font-bold text-[var(--success)] shadow-[0_8px_24px_rgba(17,45,55,.10)]",
            )}
            role="status"
          >
            <CheckCircle2 />
            {controller.toast}
          </div>
        )}

        {!data.settings.onboarded && (
          <Onboarding
            data={data}
            setData={setData}
            step={controller.onboardingStep}
            setStep={controller.setOnboardingStep}
          />
        )}

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
          onThemeModeChange={(mode) => setData((previous) => ({ ...previous, settings: { ...previous.settings, appearance: { ...previous.settings.appearance, mode } } }))}
        />

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
            "mx-auto max-w-[1510px] px-3 pb-6 pt-5 sm:px-5 xl:mr-[264px] xl:px-6",
          )}
        >
          {children}
        </div>

        <div className="xl:mr-[264px]"><AppFooter online={controller.online} /></div>
        <MobileBottomNav mode={data.settings.mode} currentPath={pathname} />
      </main>
      </UnsavedNavigationProvider>
    </SaatyarContext.Provider>
  );
}
