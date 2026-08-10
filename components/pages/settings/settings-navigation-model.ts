import {
  Bell,
  CalendarClock,
  CalendarDays,
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

export type SettingsNavGroupId = "settings-general" | "settings-data" | "settings-work" | "settings-about";

export type SettingsNavItem = {
  id: string;
  label: string;
  labelKey: MessageKey;
  group: string;
  groupId: SettingsNavGroupId;
  icon: LucideIcon;
  keywords: string;
};

export const settingsNavItems: readonly SettingsNavItem[] = [
  { id: "settings-onboarding", label: "راه‌اندازی اولیه", labelKey: "settings.nav.onboarding", group: "عمومی و ظاهر", groupId: "settings-general", icon: RotateCcw, keywords: "onboarding setup راه اندازی اولیه شروع دوباره wizard" },
  { id: "settings-profile", label: "پروفایل و نام", labelKey: "settings.nav.profile", group: "عمومی و ظاهر", groupId: "settings-general", icon: UserRound, keywords: "name profile نام پروفایل حساب کاربر خوشامدگویی" },
  { id: "settings-language", label: "زبان و جهت", labelKey: "settings.language.nav", group: "عمومی و ظاهر", groupId: "settings-general", icon: Globe2, keywords: "language locale english persian rtl ltr زبان فارسی انگلیسی جهت" },
  { id: "settings-appearance", label: "ظاهر و تم", labelKey: "settings.nav.appearance", group: "عمومی و ظاهر", groupId: "settings-general", icon: Palette, keywords: "theme dark light appearance تم دارک روشن رنگ ظاهر پوسته" },
  { id: "settings-behavior", label: "رفتار ذخیره", labelKey: "settings.nav.behavior", group: "عمومی و ظاهر", groupId: "settings-general", icon: Save, keywords: "save autosave draft ذخیره خودکار" },

  { id: "settings-health", label: "سلامت داده", labelKey: "settings.nav.health", group: "داده و پشتیبان", groupId: "settings-data", icon: HeartPulse, keywords: "data health conflict sync سلامت تعارض تب همگام سازی" },
  { id: "settings-recycle", label: "سطل بازیابی", labelKey: "settings.nav.recycle", group: "داده و پشتیبان", groupId: "settings-data", icon: Trash2, keywords: "delete restore recycle حذف بازیابی رکورد" },
  { id: "settings-storage", label: "فضای ذخیره‌سازی", labelKey: "settings.nav.storage", group: "داده و پشتیبان", groupId: "settings-data", icon: HardDrive, keywords: "storage persistence فضا حافظه" },
  { id: "settings-recovery", label: "Recovery محلی", labelKey: "settings.nav.recovery", group: "داده و پشتیبان", groupId: "settings-data", icon: LifeBuoy, keywords: "recovery snapshot بازیابی ذخیره" },
  { id: "settings-backup", label: "گرفتن پشتیبان", labelKey: "settings.nav.backup", group: "داده و پشتیبان", groupId: "settings-data", icon: Download, keywords: "backup export json پشتیبان خروجی" },
  { id: "settings-restore", label: "بازیابی فایل", labelKey: "settings.nav.restore", group: "داده و پشتیبان", groupId: "settings-data", icon: Upload, keywords: "import restore csv excel فایل بازیابی ورودی wizard ورود داده" },
  { id: "settings-device-transfer", label: "انتقال بین دستگاه‌ها", labelKey: "settings.nav.transfer", group: "داده و پشتیبان", groupId: "settings-data", icon: Smartphone, keywords: "qr webrtc transfer device انتقال دستگاه موبایل لپ تاپ sync" },

  { id: "settings-work-schedule", label: "برنامه کاری", labelKey: "settings.nav.schedule", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: CalendarClock, keywords: "schedule hours ساعت شروع پایان هدف برنامه کار" },
  { id: "settings-holidays", label: "تعطیلات و استثناها", labelKey: "settings.nav.holidays", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: CalendarDays, keywords: "holiday override تعطیل تقویم استثنا" },
  { id: "settings-payroll", label: "روش محاسبه حقوق", labelKey: "settings.nav.payroll", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: Calculator, keywords: "payroll salary monthly hourly daily حقوق ماهانه ساعتی روزکاری اضافه کاری کسر کار" },
  { id: "settings-payroll-components", label: "مزایا و کسورات", labelKey: "settings.nav.payrollComponents", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: WalletCards, keywords: "benefits deductions مزایا کسورات پاداش مالی حقوق" },
  { id: "settings-notifications", label: "اعلان‌ها و یادآورها", labelKey: "settings.nav.notifications", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: Bell, keywords: "notification reminder اعلان یادآور وقفه پایان کار" },

  { id: "settings-danger", label: "بازنشانی داده", labelKey: "settings.nav.danger", group: "ایمنی", groupId: "settings-about", icon: ShieldAlert, keywords: "reset delete danger حذف بازنشانی خطر حساس" },
] as const;

export const settingsNavGroups = [
  { id: "settings-general", label: "عمومی و ظاهر", labelKey: "settings.general.title" },
  { id: "settings-data", label: "داده و پشتیبان", labelKey: "settings.data.title" },
  { id: "settings-work", label: "برنامه کاری و حقوق", labelKey: "settings.work.title" },
  { id: "settings-about", label: "ایمنی", labelKey: "settings.safety.eyebrow" },
] as const satisfies readonly { id: SettingsNavGroupId; label: string; labelKey: MessageKey }[];

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
