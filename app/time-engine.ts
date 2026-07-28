export type CalculableBreak = {
  start: string;
  end: string;
  paid?: boolean;
  startedAt?: string;
  endedAt?: string;
};
export type CalculableRecord = {
  start: string;
  end: string;
  startedAt?: string;
  endedAt?: string;
  lunchMinutes: number;
  lunchPaid?: boolean;
  breaks: CalculableBreak[];
  leaveMinutes: number;
  leaveType: "none" | "hourly" | "full";
  holiday: boolean;
};

export function timeToMinutes(value: string) {
  if (!value) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(value: number) {
  const safe = Math.max(0, Math.round(value));
  return `${String(Math.floor(safe / 60) % 24).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function addMinutesToTime(value: string, minutes: number) {
  return minutesToTime(timeToMinutes(value) + minutes);
}

export function spanMinutes(start: string, end: string) {
  if (!start || !end) return 0;
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : 24 * 60 - startMinutes + endMinutes;
}

export function calc(record: CalculableRecord, dailyTarget: number, now = new Date()) {
  const breakDuration = (item: CalculableBreak) => {
    if (item.startedAt) {
      const end = item.endedAt ? new Date(item.endedAt).getTime() : now.getTime();
      return Math.max(0, Math.round((end - new Date(item.startedAt).getTime()) / 60_000));
    }
    return spanMinutes(item.start, item.end);
  };
  const breakMinutes = record.breaks.reduce(
    (sum, item) => sum + breakDuration(item),
    0,
  );
  const unpaidBreakMinutes = record.breaks.reduce(
    (sum, item) => sum + (item.paid ? 0 : breakDuration(item)),
    0,
  );
  const liveMinutes = now.getHours() * 60 + now.getMinutes();
  const grossByTimestamp = record.startedAt
    ? Math.max(
        0,
        Math.round(
          ((record.endedAt ? new Date(record.endedAt) : now).getTime() -
            new Date(record.startedAt).getTime()) /
            60_000,
        ),
      )
    : null;
  const gross = !record.start
    ? 0
    : grossByTimestamp !== null
    ? grossByTimestamp
    : record.end
    ? spanMinutes(record.start, record.end)
    : Math.max(0, liveMinutes - timeToMinutes(record.start));
  const unpaidLunch = record.lunchPaid ? 0 : record.lunchMinutes;
  const worked = Math.max(0, gross - unpaidLunch - unpaidBreakMinutes);
  const leave = record.leaveType === "full" ? dailyTarget : record.leaveMinutes;
  const credited = worked + leave;
  const balance = record.holiday ? credited : credited - dailyTarget;
  const plannedExit =
    timeToMinutes(record.start) + dailyTarget + unpaidLunch + unpaidBreakMinutes - leave;
  return { breakMinutes, unpaidBreakMinutes, worked, leave, credited, balance, plannedExit };
}
