export function orderWeekForDirection<T>(items: readonly T[], direction: "rtl" | "ltr") {
  return direction === "rtl" ? [...items].reverse() : [...items];
}
