const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function normalizeLocalizedNumberText(value: string) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[٬,\s]/g, "")
    .replace(/[٫]/g, ".");
}

export function parseLocalizedNumber(value: string) {
  const normalized = normalizeLocalizedNumberText(value);
  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatEditableNumber(value: number) {
  if (!Number.isFinite(value)) return "۰";
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}
