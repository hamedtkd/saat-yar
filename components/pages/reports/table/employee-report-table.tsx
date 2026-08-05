import { FileSpreadsheet, Filter } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/cn";
import { faDigits } from "@/lib/format";
import { PanelHead } from "@/components/common/panel-head";
import type { Settings, WorkRecord } from "@/lib/types";
import { EmployeeDesktopTable } from "./employee-desktop-table";
import { EmployeeMobileCards } from "./employee-mobile-cards";
import { getDailyTarget, getEmployeeTotals } from "./report-table-shared";

type Props = { monthRecords: WorkRecord[]; settings: Settings; financialsHidden: boolean };
export function EmployeeReportTable({
  monthRecords,
  settings,
  financialsHidden,
}: Props) {
  const dailyTarget = getDailyTarget(settings);

  const totals = getEmployeeTotals(monthRecords, settings, dailyTarget);

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl",
        "border border-[var(--border)]",
        "bg-[var(--surface-glass)]",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <PanelHead icon={<FileSpreadsheet />} title="جزئیات کارکرد روزانه" />

        {monthRecords.length > 0 && (
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)]">
            {faDigits(String(monthRecords.length))} روز ثبت‌شده
          </span>
        )}
      </div>

      {monthRecords.length > 0 ? (
        <>
          <EmployeeDesktopTable
            monthRecords={monthRecords}
            settings={settings}
            dailyTarget={dailyTarget}
            totals={totals}
            financialsHidden={financialsHidden}
          />

          <EmployeeMobileCards
            monthRecords={monthRecords}
            settings={settings}
            dailyTarget={dailyTarget}
            totals={totals}
            financialsHidden={financialsHidden}
          />
        </>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState
            icon={<Filter />}
            title="هنوز کارکردی ثبت نشده است"
            description="با ثبت ورود و خروج، جزئیات روزهای کاری اینجا نمایش داده می‌شود."
          />
        </div>
      )}
    </article>
  );
}

