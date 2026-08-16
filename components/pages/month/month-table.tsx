"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { SurfaceCard } from "@/components/common/surface-card";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { MonthDesktopTable } from "./table/month-desktop-table";
import { MonthMobileCards } from "./table/month-mobile-cards";
import { MonthTableHeader } from "./table/month-table-header";
import { sortMonthRecords } from "./table/month-table-utils";
import type { MonthTableProps, MonthTableSort } from "./table/types";

export function MonthTable(props: MonthTableProps) {
  const { t } = useLocaleUi();
  const [sort, setSort] = useState<MonthTableSort>({ key: "date", direction: "desc" });
  const records = useMemo(() => sortMonthRecords(props.records, props.settings, sort), [props.records, props.settings, sort]);
  const sortedProps = { ...props, records, sort, onSortChange: setSort };

  return (
    <SurfaceCard as="section" data-month-record-table className="mb-5 min-w-0 overflow-hidden p-0">
      <MonthTableHeader recordCount={records.length} sort={sort} onSortChange={setSort} />
      {records.length > 0 ? (
        <><MonthDesktopTable {...sortedProps} /><MonthMobileCards {...sortedProps} /></>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState icon={<CalendarDays />} title={t("month.table.empty")} description={t("month.table.emptyHint")} />
        </div>
      )}
    </SurfaceCard>
  );
}
