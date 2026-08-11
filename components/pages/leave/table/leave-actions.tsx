"use client";

import { Edit3, Trash2 } from "lucide-react";
import { useBusinessUi } from "@/components/i18n/use-business-ui";
import { Button } from "@/components/ui/button";
import type { LeaveEntry } from "@/lib/types";

type LeaveActionsProps = {
  entry: LeaveEntry;
  compact?: boolean;
  onEdit: (entry: LeaveEntry) => void;
  onDelete: (entry: LeaveEntry) => void;
};

export function LeaveActions({ entry, compact = false, onEdit, onDelete }: LeaveActionsProps) {
  const { b } = useBusinessUi();
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" className="size-10 rounded-xl" onClick={() => onEdit(entry)} aria-label={b("leave.table.editAria")}>
          <Edit3 className="size-4" />
        </Button>
        <Button type="button" variant="destructive" size="icon" className="size-10 rounded-xl" onClick={() => onDelete(entry)} aria-label={b("leave.table.deleteAria")}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => onEdit(entry)}>
        <Edit3 className="size-4" />
        {b("common.edit")}
      </Button>
      <Button type="button" variant="destructive" className="h-11 rounded-xl" onClick={() => onDelete(entry)}>
        <Trash2 className="size-4" />
        {b("common.delete")}
      </Button>
    </div>
  );
}
