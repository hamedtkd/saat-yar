const DEFAULT_TIME = "00:00";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export type TimeValidationResult =
  | { valid: true; value: string }
  | { valid: false; error: string };

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    if (persianIndex >= 0) return String(persianIndex);
    return String(ARABIC_DIGITS.indexOf(digit));
  });
}

export function parseTimeInput(rawValue: string): TimeValidationResult {
  const value = toEnglishDigits(rawValue).trim().replace(/٫|\./g, ":");
  if (!value) return { valid: false, error: "لطفاً یک زمان وارد کنید." };

  const parts = value.split(":");
  if (parts.length > 2 || parts.some((part) => !/^\d{1,2}$/.test(part))) {
    return { valid: false, error: "فرمت ساعت باید مانند ۰۸:۳۰ باشد." };
  }

  const hour = Number(parts[0]);
  const minute = parts.length === 1 ? 0 : Number(parts[1]);
  if (hour < 0 || hour > 23) return { valid: false, error: "ساعت باید بین ۰۰ تا ۲۳ باشد." };
  if (minute < 0 || minute > 59) return { valid: false, error: "دقیقه باید بین ۰۰ تا ۵۹ باشد." };

  return {
    valid: true,
    value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function normalizeTime(value: string): string {
  const parsed = parseTimeInput(value);
  return parsed.valid ? parsed.value : DEFAULT_TIME;
}

export const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
export const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
