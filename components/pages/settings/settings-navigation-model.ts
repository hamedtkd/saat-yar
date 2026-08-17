import {
  BarChart3,
  Bell,
  CalendarClock,
  CalendarDays,
  CalendarSync,
  Calculator,
  Download,
  Globe2,
  HardDrive,
  HeartPulse,
  LifeBuoy,
  Palette,
  RotateCcw,
  Save,
  ShieldAlert,
  Smartphone,
  Trash2,
  Upload,
  UserRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MessageKey } from "@/lib/i18n";

export type SettingsNavGroupId = "settings-general" | "settings-data" | "settings-integrations" | "settings-work" | "settings-about";

export type SettingsNavItem = {
  id: string;
  labelKey: MessageKey;
  groupId: SettingsNavGroupId;
  icon: LucideIcon;
  keywords: string;
  href: string;
};

export const settingsNavItems: readonly SettingsNavItem[] = [
  { id: "settings-onboarding", labelKey: "settings.nav.onboarding", groupId: "settings-general", icon: RotateCcw, keywords: "onboarding setup initial wizard restart", href: "/settings/profile" },
  { id: "settings-profile", labelKey: "settings.nav.profile", groupId: "settings-general", icon: UserRound, keywords: "name profile account user greeting", href: "/settings/profile" },
  { id: "settings-language", labelKey: "settings.language.nav", groupId: "settings-general", icon: Globe2, keywords: "language locale english persian rtl ltr direction calendar gregorian jalali solar hijri date", href: "/settings/profile" },
  { id: "settings-appearance", labelKey: "settings.nav.appearance", groupId: "settings-general", icon: Palette, keywords: "theme dark light appearance color surface", href: "/settings/appearance" },
  { id: "settings-behavior", labelKey: "settings.nav.behavior", groupId: "settings-general", icon: Save, keywords: "save autosave draft persistence", href: "/settings/profile" },

  { id: "settings-health", labelKey: "settings.nav.health", groupId: "settings-data", icon: HeartPulse, keywords: "data health conflict sync tabs integrity", href: "/settings/sync" },
  { id: "settings-recycle", labelKey: "settings.nav.recycle", groupId: "settings-data", icon: Trash2, keywords: "delete restore recycle records", href: "/settings/data" },
  { id: "settings-storage", labelKey: "settings.nav.storage", groupId: "settings-data", icon: HardDrive, keywords: "storage persistence space memory indexeddb", href: "/settings/data" },
  { id: "settings-recovery", labelKey: "settings.nav.recovery", groupId: "settings-data", icon: LifeBuoy, keywords: "recovery snapshot restore local", href: "/settings/data" },
  { id: "settings-backup", labelKey: "settings.nav.backup", groupId: "settings-data", icon: Download, keywords: "backup export json download", href: "/settings/data" },
  { id: "settings-restore", labelKey: "settings.nav.restore", groupId: "settings-data", icon: Upload, keywords: "import restore csv excel file wizard data", href: "/settings/data" },
  { id: "settings-device-transfer", labelKey: "settings.nav.transfer", groupId: "settings-data", icon: Smartphone, keywords: "qr webrtc transfer device phone laptop sync pairing", href: "/settings/sync" },

  { id: "settings-work-schedule", labelKey: "settings.nav.schedule", groupId: "settings-work", icon: CalendarClock, keywords: "schedule hours start end target work lunch", href: "/settings/work" },
  { id: "settings-calendar-integration", labelKey: "settings.nav.calendarIntegration", groupId: "settings-integrations", icon: CalendarSync, keywords: "google calendar oauth events create edit delete meeting external sync integration", href: "/settings/integrations" },
  { id: "settings-holidays", labelKey: "settings.nav.holidays", groupId: "settings-work", icon: CalendarDays, keywords: "holiday override calendar exception", href: "/settings/work" },
  { id: "settings-payroll", labelKey: "settings.nav.payroll", groupId: "settings-work", icon: Calculator, keywords: "payroll salary monthly hourly daily overtime deficit", href: "/settings/payroll" },
  { id: "settings-payroll-components", labelKey: "settings.nav.payrollComponents", groupId: "settings-work", icon: WalletCards, keywords: "benefits deductions bonus finance payroll", href: "/settings/payroll" },
  { id: "settings-notifications", labelKey: "settings.nav.notifications", groupId: "settings-work", icon: Bell, keywords: "notification reminder break clock out permission", href: "/settings/notifications" },

  { id: "settings-analytics", labelKey: "settings.nav.analytics", groupId: "settings-about", icon: BarChart3, keywords: "analytics privacy consent opt out measurement metrics plausible", href: "/settings/privacy" },
  { id: "settings-danger", labelKey: "settings.nav.danger", groupId: "settings-about", icon: ShieldAlert, keywords: "reset delete danger destructive safety", href: "/settings/privacy" },
] as const;

export const settingsNavGroups = [
  { id: "settings-general", labelKey: "settings.general.title" },
  { id: "settings-data", labelKey: "settings.data.title" },
  { id: "settings-integrations", labelKey: "settings.integrations.title" },
  { id: "settings-work", labelKey: "settings.work.title" },
  { id: "settings-about", labelKey: "settings.safety.eyebrow" },
] as const satisfies readonly { id: SettingsNavGroupId; labelKey: MessageKey }[];

const groupFallbacks = Object.fromEntries(
  settingsNavGroups.map((group) => [group.id, settingsNavItems.find((item) => item.groupId === group.id)?.id]),
) as Record<SettingsNavGroupId, string | undefined>;

export function resolveSettingsNavItem(value: string) {
  if (settingsNavItems.some((item) => item.id === value)) return value;
  return groupFallbacks[value as SettingsNavGroupId] ?? null;
}

export function getSettingsGroupId(itemId: string): SettingsNavGroupId {
  return settingsNavItems.find((item) => item.id === itemId)?.groupId ?? settingsNavGroups[0].id;
}

export function getSettingsGroupItems(groupId: SettingsNavGroupId) {
  return settingsNavItems.filter((item) => item.groupId === groupId);
}
