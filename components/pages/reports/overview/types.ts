import type { AppData, ReportFilter, TimeEntry, WorkRecord } from "@/lib/types";

export type MonthStats = {
  worked: number;
  target: number;
  balance: number;
  breaks: number;
};

export type ReportsPageProps = {
  data: AppData;
  monthRecords: WorkRecord[];
  monthStats: MonthStats;
  filters: ReportFilter;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilter>>;
  entries: TimeEntry[];
  reportBillable: number;
  reportIncome: number;
  exportReport: (kind: "excel" | "csv") => void;
  financialsHidden: boolean;
};
