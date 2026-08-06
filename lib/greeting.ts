export type GreetingPeriod = "صبح" | "ظهر" | "عصر" | "شب";

export function getGreetingPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return "صبح";
  if (hour >= 12 && hour < 16) return "ظهر";
  if (hour >= 16 && hour < 20) return "عصر";
  return "شب";
}

export function buildGreeting(name: string, hour = new Date().getHours()) {
  const greeting = `${getGreetingPeriod(hour)} بخیر`;
  const trimmedName = name.trim();
  return trimmedName ? `${greeting}، ${trimmedName}` : greeting;
}
