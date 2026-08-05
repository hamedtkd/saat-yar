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
