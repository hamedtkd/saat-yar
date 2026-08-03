import type { Mode, Settings, TimeEntry, WorkRecord } from "@/lib/types";

export type MonthStats = {
  worked: number;
  target: number;
  balance: number;
  breaks: number;
};

export type ReportChartsProps = {
  mode: Mode;
  entries: TimeEntry[];
  reportBillable: number;
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  settings: Settings;
};

export type FreelancerChartItem = {
  key: string;
  day: string;
  fullDate: string;
  minutes: number;
  income: number;
};

export type EmployeeChartItem = {
  key: string;
  day: string;
  fullDate: string;
  worked: number;
  target: number;
  balance: number;
};

export type DonutItem = {
  name: string;
  value: number;
  color: string;
};
