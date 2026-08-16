import type { AppData } from "@/lib/types";

export type WeeklyChartProps = {
  data: AppData;
  selectedDate: string;
};

export type WeeklyChartItem = {
  dateKey: string;
  day: string;
  dayFull: string;
  dateLabel: string;
  minutes: number;
  holiday: boolean;
  holidayLabel: string;
  leave: boolean;
  selected: boolean;
};

export type WeeklyChartSummary = {
  data: WeeklyChartItem[];
  hasData: boolean;
  totalMinutes: number;
  averageMinutes: number;
  bestDay: WeeklyChartItem | null;
};
