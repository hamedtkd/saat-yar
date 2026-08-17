import type { Settings, WorkRecord } from "@/lib/types";

export type MonthTableProps = {
  records: WorkRecord[];
  settings: Settings;
  onEdit: (date: string) => void;
};

export type MonthRecordView = {
  item: WorkRecord;
  worked: number;
  totalRest: number;
  balance: number;
};

export type MonthTableSortKey = "date" | "clockIn" | "clockOut" | "worked" | "rest" | "balance";
export type MonthTableSortDirection = "asc" | "desc";

export type MonthTableSort = {
  key: MonthTableSortKey;
  direction: MonthTableSortDirection;
};

export type SortedMonthTableProps = MonthTableProps & {
  sort: MonthTableSort;
  onSortChange: (sort: MonthTableSort) => void;
};
