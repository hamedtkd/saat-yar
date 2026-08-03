import { jalaliParts } from "./format";
import type { Mode } from "./types";

export type HolidayKind = "official" | "weekly" | "worker" | "manual";

export type HolidayInfo = {
  isHoliday: boolean;
  title?: string;
  kind?: HolidayKind;
  source?: "official-calendar" | "system" | "user";
};

type HolidayDefinition = {
  month: number;
  day: number;
  title: string;
};

const FIXED_OFFICIAL_HOLIDAYS: HolidayDefinition[] = [
  { month: 1, day: 1, title: "نوروز" },
  { month: 1, day: 2, title: "عید نوروز" },
  { month: 1, day: 3, title: "عید نوروز" },
  { month: 1, day: 4, title: "عید نوروز" },
  { month: 1, day: 12, title: "روز جمهوری اسلامی ایران" },
  { month: 1, day: 13, title: "روز طبیعت" },
  { month: 3, day: 14, title: "رحلت امام خمینی" },
  { month: 3, day: 15, title: "قیام پانزده خرداد" },
  { month: 11, day: 22, title: "پیروزی انقلاب اسلامی" },
  { month: 12, day: 29, title: "ملی‌شدن صنعت نفت" },
];

// Official 1405 dates based on the published annual calendar. Friday is handled separately.
const HOLIDAYS_1405: HolidayDefinition[] = [
  { month: 1, day: 24, title: "شهادت امام جعفر صادق (ع)" },
  { month: 3, day: 3, title: "شهادت امام محمد باقر (ع)" },
  { month: 3, day: 6, title: "عید قربان" },
  { month: 3, day: 14, title: "رحلت امام خمینی و عید غدیر" },
  { month: 3, day: 15, title: "قیام پانزده خرداد" },
  { month: 4, day: 3, title: "تاسوعای حسینی" },
  { month: 4, day: 4, title: "عاشورای حسینی" },
  { month: 5, day: 13, title: "اربعین حسینی" },
  { month: 5, day: 21, title: "رحلت پیامبر و شهادت امام حسن مجتبی (ع)" },
  { month: 5, day: 22, title: "شهادت امام رضا (ع)" },
  { month: 5, day: 30, title: "شهادت امام حسن عسکری (ع)" },
  { month: 6, day: 8, title: "ولادت پیامبر و امام جعفر صادق (ع)" },
  { month: 8, day: 22, title: "شهادت حضرت فاطمه زهرا (س)" },
  { month: 10, day: 2, title: "ولادت امام علی (ع)" },
  { month: 10, day: 16, title: "مبعث پیامبر" },
  { month: 11, day: 4, title: "نیمه شعبان" },
  { month: 12, day: 9, title: "شهادت امام علی (ع)" },
  { month: 12, day: 19, title: "عید فطر" },
  { month: 12, day: 20, title: "تعطیل عید فطر" },
];

function matches(definition: HolidayDefinition, month: number, day: number) {
  return definition.month === month && definition.day === day;
}

export function getHolidayInfo(
  dateKey: string,
  options: {
    mode?: Mode;
    manualHoliday?: boolean;
    includeWeeklyHoliday?: boolean;
    includeOfficialHolidays?: boolean;
  } = {},
): HolidayInfo {
  const {
    mode = "employee",
    manualHoliday = false,
    includeWeeklyHoliday = true,
    includeOfficialHolidays = true,
  } = options;

  if (manualHoliday) {
    return { isHoliday: true, title: "تعطیلی ثبت‌شده توسط کاربر", kind: "manual", source: "user" };
  }

  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { isHoliday: false };

  const { year, month, day } = jalaliParts(date);

  if ((mode === "employee" || mode === "hybrid") && month === 2 && day === 11) {
    return { isHoliday: true, title: "روز کارگر", kind: "worker", source: "official-calendar" };
  }

  if (includeWeeklyHoliday && date.getDay() === 5) {
    return { isHoliday: true, title: "تعطیل هفتگی (جمعه)", kind: "weekly", source: "system" };
  }

  if (!includeOfficialHolidays) return { isHoliday: false };

  const annual = year === 1405 ? HOLIDAYS_1405 : [];
  const definition = annual.find((item) => matches(item, month, day))
    ?? FIXED_OFFICIAL_HOLIDAYS.find((item) => matches(item, month, day));

  return definition
    ? { isHoliday: true, title: definition.title, kind: "official", source: "official-calendar" }
    : { isHoliday: false };
}

export function isHoliday(dateKey: string, mode: Mode = "employee") {
  return getHolidayInfo(dateKey, { mode }).isHoliday;
}
