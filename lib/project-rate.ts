export type ProjectRateUnit = "hour" | "day";
export const PROJECT_RATE_DAY_HOURS = 8;

export function projectRateToHourly(amount: number, unit: ProjectRateUnit) {
  const safe = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return Math.round(unit === "day" ? safe / PROJECT_RATE_DAY_HOURS : safe);
}

export function hourlyRateToProjectUnit(hourlyRate: number, unit: ProjectRateUnit) {
  const safe = Number.isFinite(hourlyRate) ? Math.max(0, hourlyRate) : 0;
  return Math.round(unit === "day" ? safe * PROJECT_RATE_DAY_HOURS : safe);
}

export function formatProjectRateAmount(value: number, locale: "fa-IR" | "en") {
  return new Intl.NumberFormat(locale === "fa-IR" ? "fa-IR" : "en-US", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)));
}
