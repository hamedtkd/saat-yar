"use client";

import { CalendarRange, Umbrella } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { cn } from "@/lib/cn";
import type { AppData, LeaveEntry } from "@/lib/types";
import { LeaveDesktopTable } from "./table/leave-desktop-table";
import { LeaveMobileCards } from "./table/leave-mobile-cards";

type LeaveTableProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
};

export function LeaveTable({ data, setData, setDraft }: LeaveTableProps) {
  const { b, number } = useBusinessUi();
  const handleEdit = (entry: LeaveEntry) => setDraft({ ...entry });
  const handleDelete = (entry: LeaveEntry) => {
    if (!window.confirm(b("leave.table.confirmDelete"))) return;
    setData((previous) => ({ ...previous, leaves: previous.leaves.filter((item) => item.id !== entry.id) }));
  };

  return (
    <SurfaceCard as="article" className="min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <PanelHead icon={<Umbrella />} title={b("leave.table.title")} />
        {data.leaves.length > 0 && (
          <span className={cn("inline-flex items-center gap-1.5", "rounded-full bg-[var(--accent-soft)]", "px-3 py-1.5", "text-[10px] font-bold text-[var(--text-muted)]")}>
            <CalendarRange className="size-3.5 text-[var(--accent-strong)]" />
            {b("leave.table.count", { count: number(data.leaves.length) })}
          </span>
        )}
      </div>
      {data.leaves.length > 0 ? (
        <>
          <LeaveDesktopTable entries={data.leaves} onEdit={handleEdit} onDelete={handleDelete} />
          <LeaveMobileCards entries={data.leaves} onEdit={handleEdit} onDelete={handleDelete} />
        </>
      ) : (
        <div className="p-4 sm:p-5"><EmptyState icon={<Umbrella />} title={b("leave.table.emptyTitle")} description={b("leave.table.emptyDescription")} /></div>
      )}
    </SurfaceCard>
  );
}
