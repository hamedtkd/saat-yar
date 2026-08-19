import { normalizeLocalizedNumberText } from "../lib/localized-number.ts";

function toFiniteNumber(value: string) {
  const normalized = normalizeLocalizedNumberText(value);
  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function browserInputValuesEquivalent(actual: string, expected: string) {
  if (actual === expected) return true;
  const actualNumber = toFiniteNumber(actual);
  const expectedNumber = toFiniteNumber(expected);
  return actualNumber != null && expectedNumber != null && actualNumber === expectedNumber;
}
