import { FileSpreadsheet } from "lucide-react";
import { PanelHead } from "@/components/common/panel-head";
import { faDigits } from "@/lib/format";

type MonthTableHeaderProps = {
  recordCount: number;
};

export function MonthTableHeader({ recordCount }: MonthTableHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
      <PanelHead icon={<FileSpreadsheet />} title="جزئیات روزانه" />

      {recordCount > 0 && (
        <span className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">
          {faDigits(String(recordCount))} روز ثبت‌شده
        </span>
      )}
    </div>
  );
}
