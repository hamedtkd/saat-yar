"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
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
  settings: "/settings",
};

const allowedTabs: Record<Mode, Tab[]> = {
  employee: ["today", "month", "leave", "reports", "settings"],
  freelancer: ["today", "clients", "projects", "reports", "settings"],
  hybrid: ["today", "month", "leave", "reports", "clients", "projects", "settings"],
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
          "grid min-h-screen place-content-center gap-3 font-extrabold text-[#079b60]",
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
      <main
        className={cn(
          "min-h-screen w-full p-3 max-[900px]:p-[7px] max-[900px]:pb-24 [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[11px] [&_label]:font-semibold [&_label]:text-[#314b58] [&_button]:cursor-pointer [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:stroke-[1.85]",
        )}
        dir="rtl"
      >
        {controller.toast && (
          <div
            className={cn(
              "fixed left-1/2 top-[22px] z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-[#bce2d3] bg-[#effaf5] px-[17px] py-[11px] text-xs font-bold text-[#087f50] shadow-[0_18px_50px_rgba(17,45,55,.16)]",
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

        <AppHeader
          name={data.settings.name}
          mode={data.settings.mode}
          pathname={pathname}
          onModeChange={controller.changeMode}
          onExport={controller.exportBackup}
          financialsHidden={controller.financialsHidden}
          onToggleFinancials={() => controller.setFinancialsHidden((value) => !value)}
        />

        <div
          className={cn(
            "mx-auto max-w-[1510px] px-[26px] pb-[18px] pt-[30px] max-[900px]:px-[10px] max-[900px]:py-[22px]",
          )}
        >
          {children}
        </div>

        <AppFooter online={controller.online} />
      </main>
    </SaatyarContext.Provider>
  );
}
