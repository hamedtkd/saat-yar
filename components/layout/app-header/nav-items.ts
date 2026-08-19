import { BarChart3, CalendarDays, CircleHelp, Folder, LayoutDashboard, ReceiptText, Settings, Umbrella, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MessageKey } from "@/lib/i18n";
import type { Mode, Tab } from "@/lib/types";
import { getPathTab, getTodayHref } from "@/lib/navigation";

type NavItem = {
  id: Tab;
  labelKey: MessageKey;
  icon: LucideIcon;
  href: string;
};

export const appNavItems: readonly NavItem[] = [
  { id: "today" as Tab, labelKey: "nav.today", icon: CalendarDays, href: "/today" },
  { id: "month" as Tab, labelKey: "nav.month", icon: LayoutDashboard, href: "/month" },
  { id: "clients" as Tab, labelKey: "nav.clients", icon: Users, href: "/clients" },
  { id: "projects" as Tab, labelKey: "nav.projects", icon: Folder, href: "/projects" },
  { id: "invoices" as Tab, labelKey: "nav.invoices", icon: ReceiptText, href: "/invoices" },
  { id: "leave" as Tab, labelKey: "nav.leave", icon: Umbrella, href: "/leave" },
  { id: "reports" as Tab, labelKey: "nav.reports", icon: BarChart3, href: "/reports" },
];

export const settingsNavItem = { id: "settings", labelKey: "nav.settings" as MessageKey, icon: Settings, href: "/settings" } as const;
export const aboutNavItem = { id: "about", labelKey: "nav.about" as MessageKey, icon: CircleHelp, href: "/about" } as const;

const mobilePrimaryIds: Record<Mode, string[]> = {
  employee: ["today", "month", "leave", "reports"],
  freelancer: ["today", "clients", "projects", "reports"],
  hybrid: ["today", "month", "projects", "reports"],
};

export function getVisibleNavItems(mode: Mode) {
  return appNavItems
    .filter((item) => {
      if (mode === "employee") return !["clients", "projects", "invoices"].includes(item.id);
      if (mode === "freelancer") return !["month", "leave"].includes(item.id);
      return true;
    })
    .map((item) => item.id === "today" ? { ...item, href: getTodayHref(mode) } : item);
}

export function getMobilePrimaryNavItems(mode: Mode) {
  const visible = getVisibleNavItems(mode);
  const wanted = mobilePrimaryIds[mode];
  return wanted.flatMap((id) => visible.filter((item) => item.id === id));
}

export function getRouteNavItem(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === settingsNavItem.href || normalized.startsWith(`${settingsNavItem.href}/`)) return settingsNavItem;
  if (normalized === aboutNavItem.href) return aboutNavItem;
  const tab = getPathTab(normalized);
  return appNavItems.find((item) => item.id === tab) ?? appNavItems[0];
}
