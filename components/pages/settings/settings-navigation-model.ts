import {
  Bell,
  CalendarClock,
  CalendarDays,
  Calculator,
  Download,
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

export type SettingsNavGroupId = "settings-general" | "settings-data" | "settings-work" | "settings-about";

export type SettingsNavItem = {
  id: string;
  label: string;
  group: string;
  groupId: SettingsNavGroupId;
  icon: LucideIcon;
  keywords: string;
};

export const settingsNavItems: readonly SettingsNavItem[] = [
  { id: "settings-onboarding", label: "راه‌اندازی اولیه", group: "عمومی و ظاهر", groupId: "settings-general", icon: RotateCcw, keywords: "onboarding راه اندازی اولیه شروع دوباره wizard" },
  { id: "settings-profile", label: "پروفایل و نام", group: "عمومی و ظاهر", groupId: "settings-general", icon: UserRound, keywords: "نام پروفایل حساب کاربر خوشامدگویی" },
  { id: "settings-appearance", label: "ظاهر و تم", group: "عمومی و ظاهر", groupId: "settings-general", icon: Palette, keywords: "تم دارک روشن رنگ ظاهر پوسته" },
  { id: "settings-behavior", label: "رفتار ذخیره", group: "عمومی و ظاهر", groupId: "settings-general", icon: Save, keywords: "ذخیره خودکار autosave draft" },

  { id: "settings-health", label: "سلامت داده", group: "داده و پشتیبان", groupId: "settings-data", icon: HeartPulse, keywords: "سلامت تعارض تب sync همگام سازی" },
  { id: "settings-recycle", label: "سطل بازیابی", group: "داده و پشتیبان", groupId: "settings-data", icon: Trash2, keywords: "حذف بازیابی recycle رکورد" },
  { id: "settings-storage", label: "فضای ذخیره‌سازی", group: "داده و پشتیبان", groupId: "settings-data", icon: HardDrive, keywords: "storage persistence فضا حافظه" },
  { id: "settings-recovery", label: "Recovery محلی", group: "داده و پشتیبان", groupId: "settings-data", icon: LifeBuoy, keywords: "recovery snapshot بازیابی ذخیره" },
  { id: "settings-backup", label: "گرفتن پشتیبان", group: "داده و پشتیبان", groupId: "settings-data", icon: Download, keywords: "backup پشتیبان خروجی export json" },
  { id: "settings-restore", label: "بازیابی فایل", group: "داده و پشتیبان", groupId: "settings-data", icon: Upload, keywords: "import restore فایل بازیابی ورودی csv excel wizard ورود داده" },
  { id: "settings-device-transfer", label: "انتقال بین دستگاه‌ها", group: "داده و پشتیبان", groupId: "settings-data", icon: Smartphone, keywords: "qr webrtc انتقال دستگاه موبایل لپ تاپ sync" },

  { id: "settings-work-schedule", label: "برنامه کاری", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: CalendarClock, keywords: "ساعت شروع پایان هدف برنامه کار" },
  { id: "settings-holidays", label: "تعطیلات و استثناها", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: CalendarDays, keywords: "تعطیل holiday تقویم استثنا" },
  { id: "settings-payroll", label: "روش محاسبه حقوق", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: Calculator, keywords: "حقوق payroll ماهانه ساعتی روزکاری اضافه کاری کسر کار" },
  { id: "settings-payroll-components", label: "مزایا و کسورات", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: WalletCards, keywords: "مزایا کسورات پاداش مالی حقوق" },
  { id: "settings-notifications", label: "اعلان‌ها و یادآورها", group: "برنامه کاری و حقوق", groupId: "settings-work", icon: Bell, keywords: "اعلان notification یادآور وقفه پایان کار" },

  { id: "settings-danger", label: "بازنشانی داده", group: "ایمنی", groupId: "settings-about", icon: ShieldAlert, keywords: "حذف reset بازنشانی خطر حساس" },
] as const;

export const settingsNavGroups = [
  { id: "settings-general", label: "عمومی و ظاهر" },
  { id: "settings-data", label: "داده و پشتیبان" },
  { id: "settings-work", label: "برنامه کاری و حقوق" },
  { id: "settings-about", label: "ایمنی" },
] as const satisfies readonly { id: SettingsNavGroupId; label: string }[];

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
