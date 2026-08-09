const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function latinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

export function normalizeImportText(value: string) {
  return latinDigits(value).trim().replace(/\s+/g, " ");
}

export function normalizeKey(value: string) {
  return normalizeImportText(value).toLocaleLowerCase("fa-IR").replace(/[يى]/g, "ی").replace(/ك/g, "ک");
}

export function parseImportNumber(value: string) {
  const normalized = normalizeImportText(value)
    .replace(/[٬,،\s]/g, "")
    .replace(/٫/g, ".");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function parseImportBoolean(value: string, fallback = false) {
  const normalized = normalizeKey(value);
  if (!normalized) return fallback;
  if (["1", "true", "yes", "y", "بله", "بلی", "آری", "فعال"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "خیر", "نه", "غیرفعال"].includes(normalized)) return false;
  return fallback;
}

function div(a: number, b: number) { return Math.trunc(a / b); }
function mod(a: number, b: number) { return a - Math.trunc(a / b) * b; }

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
    + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;
  if (jy < jp || jy >= breaks[breaks.length - 1]) throw new Error("Jalali year is outside the supported range.");
  for (let index = 1; index < breaks.length; index += 1) {
    const jm = breaks[index];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function jalaliToGregorian(jy: number, jm: number, jd: number) {
  const calendar = jalCal(jy);
  const jdn = g2d(calendar.gy, 3, calendar.march)
    + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  return d2g(jdn);
}

function isValidGregorian(gy: number, gm: number, gd: number) {
  const date = new Date(Date.UTC(gy, gm - 1, gd));
  return date.getUTCFullYear() === gy && date.getUTCMonth() === gm - 1 && date.getUTCDate() === gd;
}

export function parseImportDate(value: string) {
  const normalized = normalizeImportText(value).replace(/[/.]/g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  const [, yearRaw, monthRaw, dayRaw] = match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (year >= 1200 && year < 1700) {
    if (month < 1 || month > 12 || day < 1) return null;
    try {
      const calendar = jalCal(year);
      const maxDay = month <= 6 ? 31 : month <= 11 ? 30 : calendar.leap === 0 ? 30 : 29;
      if (day > maxDay) return null;
      const { gy, gm, gd } = jalaliToGregorian(year, month, day);
      if (!isValidGregorian(gy, gm, gd)) return null;
      return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
    } catch { return null; }
  }
  if (!isValidGregorian(year, month, day)) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseImportTime(value: string) {
  const normalized = normalizeImportText(value);
  if (!normalized) return "";
  const match = normalized.match(/^(\d{1,2}):?(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
