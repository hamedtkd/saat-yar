"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
import { SkipLink } from "@/components/common/skip-link";
import { ThemeRuntime } from "@/components/theme/theme-runtime";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarNav } from "@/components/layout/navigation/sidebar-nav";
import { MobileBottomNav } from "@/components/layout/navigation/mobile-bottom-nav";
import { Onboarding } from "@/components/layout/onboarding";
import { useSaatyarController } from "@/hooks/use-saatyar-controller";
import { cn } from "@/lib/cn";
import type { Mode, Tab } from "@/lib/types";

const SaatyarContext = createContext<ReturnType<typeof useSaatyarController> | null>(null);

const tabRoutes: Record<Tab, string> = {
  today: "/today",
  month: "/month",
  leave: "/leave",
  reports: "/reports",
  clients: "/clients",
  projects: "/projects",
  invoices: "/invoices",
  settings: "/settings",
};

const allowedTabs: Record<Mode, Tab[]> = {
  employee: ["today", "month", "leave", "reports", "settings"],
  freelancer: ["today", "clients", "projects", "invoices", "reports", "settings"],
  hybrid: ["today", "month", "leave", "reports", "clients", "projects", "invoices", "settings"],
};

function getPathTab(pathname: string): Tab | null {
  const cleaned = pathname.split("?")[0].split("#")[0];
  return (Object.keys(tabRoutes) as Tab[]).find((tab) => tabRoutes[tab] === cleaned) ?? null;
}

function getFirstAllowedTab(mode: Mode) {
  return allowedTabs[mode][0];
}

export function useSaatyarContext() {
  const context = useContext(SaatyarContext);
  if (!context) throw new Error("useSaatyarContext must be used within SaatyarShell");
  return context;
}

export function getTabHref(tab: Tab) {
  return tabRoutes[tab];
}

export function SaatyarShell({ children }: { children: React.ReactNode }) {
  const controller = useSaatyarController();
  const pathname = usePathname() || "/today";
  const router = useRouter();
  const pathTab = getPathTab(pathname);

  useEffect(() => {
    if (!controller.ready) return;

    if (!pathTab) {
      router.replace("/today");
      return;
    }

    const currentAllowed = allowedTabs[controller.data.settings.mode];
    if (!currentAllowed.includes(pathTab)) {
      router.replace(getTabHref(getFirstAllowedTab(controller.data.settings.mode)));
    }
  }, [controller.ready, pathTab, controller.data.settings.mode, router]);

  if (!controller.ready)
    return (
      <main
        className={cn(
          "grid min-h-screen place-content-center gap-3 font-extrabold text-[var(--accent-strong)]",
        )}
      >
        <span className="w-full grid place-items-center">
          <Image
            height={44}
            width={44}
            src="/saatyar-logo-green.svg"
            alt="ساعت‌یار"
          />
        </span>
        در حال آماده‌سازی ساعت‌یار…
      </main>
    );

  const { data, setData } = controller;

  return (
    <SaatyarContext.Provider value={controller}>
      <ThemeRuntime appearance={data.settings.appearance} />
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
    </SaatyarContext.Provider>
  );
}
