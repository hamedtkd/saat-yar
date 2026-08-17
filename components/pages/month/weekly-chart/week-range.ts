import { shiftDateKey } from "@/lib/format";

function saturdayIndex(dateKey: string) {
  return (new Date(`${dateKey}T12:00:00`).getDay() + 1) % 7;
}

export function getSelectedWeekDateKeys(selectedDate: string) {
  const startDateKey = shiftDateKey(selectedDate, -saturdayIndex(selectedDate));
  return Array.from({ length: 7 }, (_, index) => shiftDateKey(startDateKey, index));
}
