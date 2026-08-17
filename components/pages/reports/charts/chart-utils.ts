
export const CHART_COLORS = {
  worked: "var(--accent)",
  target: "var(--chart-secondary)",
  overtime: "var(--success)",
  deficit: "var(--danger)",
  time: "var(--accent)",
  income: "var(--chart-secondary)",
  billable: "var(--accent)",
  nonBillable: "var(--warning)",
};

export function localDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function parseLocalDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date(value) : date;
}
