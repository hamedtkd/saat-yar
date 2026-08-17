import type { Mode, Tab } from "./types.ts";

export const TAB_ROUTES: Record<Tab, string> = {
  today: "/today",
  month: "/month",
  leave: "/leave",
  reports: "/reports",
  clients: "/clients",
  projects: "/projects",
  invoices: "/invoices",
  settings: "/settings",
};

export const ALLOWED_TABS: Record<Mode, Tab[]> = {
  employee: ["today", "month", "leave", "reports", "settings"],
  freelancer: ["today", "clients", "projects", "invoices", "reports", "settings"],
  hybrid: ["today", "month", "leave", "reports", "clients", "projects", "invoices", "settings"],
};

export const LAST_ROUTE_STORAGE_KEY = "saatyar:last-route";

export const SUPPLEMENTAL_ROUTES = ["/about", "/help", "/privacy", "/terms", "/import"] as const;
export const PUBLIC_ROUTES = ["/about", "/help", "/privacy", "/terms"] as const;

export function isSupplementalRoute(pathname: string) {
  return SUPPLEMENTAL_ROUTES.includes(normalizePathname(pathname) as (typeof SUPPLEMENTAL_ROUTES)[number]);
}

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(normalizePathname(pathname) as (typeof PUBLIC_ROUTES)[number]);
}

export function normalizePathname(pathname: string) {
  return pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
}

export function getPathTab(pathname: string): Tab | null {
  const normalized = normalizePathname(pathname);
  if (normalized === "/settings" || normalized.startsWith("/settings/")) return "settings";
  return (Object.keys(TAB_ROUTES) as Tab[]).find((tab) => TAB_ROUTES[tab] === normalized) ?? null;
}

export function getTabHref(tab: Tab) {
  return TAB_ROUTES[tab];
}

export function getFirstAllowedTab(mode: Mode) {
  return ALLOWED_TABS[mode][0];
}

export function isTabAllowed(mode: Mode, tab: Tab) {
  return ALLOWED_TABS[mode].includes(tab);
}
