"use client";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "@/components/common/brand";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { HeaderActions } from "./app-header/header-actions";
import { HeaderNav } from "./app-header/header-nav";

type Props = { name: string; mode: Mode; pathname?: string; onModeChange: (mode: Mode) => void; onExport: () => void; financialsHidden: boolean; onToggleFinancials: () => void; saveState: "idle" | "saving" | "saved" | "error" };
export function AppHeader(props: Props) {
  const router = useRouter();
  const currentPath = usePathname() || props.pathname || "/today";
  const changeMode = (mode: Mode) => {
    props.onModeChange(mode);
    if (mode === "employee" && ["/clients", "/projects", "/invoices"].includes(currentPath)) router.push("/today");
    if (mode === "freelancer" && ["/month", "/leave"].includes(currentPath)) router.push("/today");
  };
  return <header className={cn("sticky top-[10px] z-40 grid min-h-[72px] grid-cols-[280px_1fr_330px] items-center gap-[18px] rounded-2xl border border-[#dfe7e9] bg-white/95 px-6 shadow-[0_7px_26px_rgba(30,65,74,0.04)] backdrop-blur-2xl", "max-[1180px]:grid-cols-[220px_1fr_auto] max-[1180px]:px-[15px] max-[900px]:static max-[900px]:grid-cols-[1fr_auto] max-[900px]:[backdrop-filter:none] max-[620px]:min-h-16 max-[620px]:rounded-[13px] max-[620px]:px-[10px]")}>
    <Brand subtitle={props.name ? `فضای شخصی ${props.name}` : "حساب کار، بدون حساب‌وکتاب"} />
    <HeaderNav mode={props.mode} currentPath={currentPath} />
    <HeaderActions mode={props.mode} saveState={props.saveState} financialsHidden={props.financialsHidden} onModeChange={changeMode} onToggleFinancials={props.onToggleFinancials} onExport={props.onExport} onSettings={() => router.push("/settings")} />
  </header>;
}
