export type WeeklyChartProps = {
  values: number[];
};

export type WeeklyChartItem = {
  day: string;
  dayFull: string;
  minutes: number;
};

export type WeeklyChartSummary = {
  data: WeeklyChartItem[];
  hasData: boolean;
  totalMinutes: number;
  averageMinutes: number;
  bestDay: WeeklyChartItem | null;
};
