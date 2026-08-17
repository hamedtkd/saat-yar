import {
  Bell,
  CalendarClock,
  CalendarSync,
  Database,
  Link2,
  Palette,
  ShieldCheck,
  Smartphone,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MessageKey } from "@/lib/i18n";

export type SettingsRouteId =
  | "overview"
  | "profile"
  | "appearance"
  | "work"
  | "payroll"
  | "notifications"
  | "integrations"
  | "data"
  | "sync"
  | "privacy";

type SettingsRouteDefinition = {
  id: Exclude<SettingsRouteId, "overview">;
  href: string;
  labelKey: MessageKey;
  descriptionKey: MessageKey;
  icon: LucideIcon;
};

export const settingsRoutes: readonly SettingsRouteDefinition[] = [
  { id: "profile", href: "/settings/profile", labelKey: "settings.nav.profile", descriptionKey: "settings.general.description", icon: UserRound },
  { id: "appearance", href: "/settings/appearance", labelKey: "settings.nav.appearance", descriptionKey: "settings.general.description", icon: Palette },
  { id: "work", href: "/settings/work", labelKey: "settings.nav.schedule", descriptionKey: "settings.work.description", icon: CalendarClock },
  { id: "payroll", href: "/settings/payroll", labelKey: "settings.nav.payroll", descriptionKey: "settings.work.description", icon: WalletCards },
  { id: "notifications", href: "/settings/notifications", labelKey: "settings.nav.notifications", descriptionKey: "settings.work.description", icon: Bell },
  { id: "integrations", href: "/settings/integrations", labelKey: "settings.integrations.title", descriptionKey: "settings.integrations.description", icon: CalendarSync },
  { id: "data", href: "/settings/data", labelKey: "settings.data.title", descriptionKey: "settings.data.description", icon: Database },
  { id: "sync", href: "/settings/sync", labelKey: "settings.nav.transfer", descriptionKey: "settings.data.description", icon: Smartphone },
  { id: "privacy", href: "/settings/privacy", labelKey: "settings.nav.analytics", descriptionKey: "settings.safety.description", icon: ShieldCheck },
] as const;

export function normalizeSettingsPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/settings";
  return normalized === "/settings" ? normalized : normalized;
}

export function getSettingsRoute(pathname: string): SettingsRouteId {
  const normalized = normalizeSettingsPath(pathname);
  if (normalized === "/settings") return "overview";
  return settingsRoutes.find((route) => route.href === normalized)?.id ?? "overview";
}

export function getSettingsRouteDefinition(routeId: SettingsRouteId) {
  return routeId === "overview" ? null : settingsRoutes.find((route) => route.id === routeId) ?? null;
}

export const settingsOverviewIcon = Link2;
