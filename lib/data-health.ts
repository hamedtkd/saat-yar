import { getRecordStatus } from "./record-health.ts";
import type { WorkRecord } from "./types.ts";

export type DataHealthItem = {
  date: string;
  record: WorkRecord;
  state: "invalid" | "incomplete" | "review";
  label: string;
  messages: string[];
};

export function collectDataHealthItems(records: Record<string, WorkRecord>): DataHealthItem[] {
  return Object.entries(records)
    .flatMap(([date, record]) => {
      const status = getRecordStatus(record);
      if (record.needsReview) {
        return [{ date, record, state: "review" as const, label: "نیازمند بررسی", messages: ["این رکورد به‌صورت خودکار بسته شده و باید بررسی شود."] }];
      }
      if (status.state !== "invalid" && status.state !== "incomplete") return [];
      return [{
        date,
        record,
        state: status.state,
        label: status.label,
        messages: status.issues.map((issue) => issue.message),
      }];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getDataHealthSummary(items: DataHealthItem[]) {
  return {
    total: items.length,
    invalid: items.filter((item) => item.state === "invalid").length,
    incomplete: items.filter((item) => item.state === "incomplete").length,
    review: items.filter((item) => item.state === "review").length,
  };
}
