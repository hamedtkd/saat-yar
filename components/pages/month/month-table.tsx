"use client";

import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { MonthDesktopTable } from "./table/month-desktop-table";
import { MonthMobileCards } from "./table/month-mobile-cards";
import { MonthTableHeader } from "./table/month-table-header";
import type { MonthTableProps } from "./table/types";

export function MonthTable(props: MonthTableProps) {
  const { t } = useLocaleUi();
  const { records } = props;
  return (
    <SurfaceCard as="section" className="mb-5 min-w-0 overflow-hidden p-0">
      <MonthTableHeader recordCount={records.length} />
      {records.length > 0 ? (
        <><MonthDesktopTable {...props} /><MonthMobileCards {...props} /></>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState icon={<CalendarDays />} title={t("month.table.empty")} description={t("month.table.emptyHint")} />
        </div>
      )}
    </SurfaceCard>
  );
}
