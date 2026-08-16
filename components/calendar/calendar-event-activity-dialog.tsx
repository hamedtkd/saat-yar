"use client";

import { useState } from "react";
import { ListPlus } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityKinds } from "@/lib/activity-segments";
import { defaultActivityKindForCalendarEvent } from "@/lib/calendar-integration/activity-import";
import type { ExternalCalendarEvent } from "@/lib/calendar-integration/types";
import type { MessageKey } from "@/lib/i18n";
import type { ActivityKind } from "@/lib/types";

const activityKindLabelKeys: Record<ActivityKind, MessageKey> = {
  "deep-work": "activity.kind.deepWork",
  meeting: "activity.kind.meeting",
  learning: "activity.kind.learning",
  admin: "activity.kind.admin",
  project: "activity.kind.project",
  other: "activity.kind.other",
};

export function CalendarEventActivityDialog({ open, onOpenChange, event, onConfirm }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ExternalCalendarEvent;
  onConfirm: (kind: ActivityKind) => void;
}) {
  const { t, time } = useLocaleUi();
  const [kind, setKind] = useState<ActivityKind>(() => defaultActivityKindForCalendarEvent(event));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[min(92vw,480px)]" style={{ width: "min(92vw,480px)" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ListPlus className="size-5 text-[var(--accent-strong)]" />{t("calendar.google.activityImportTitle")}</DialogTitle>
          <DialogDescription>{t("calendar.google.activityImportDescription")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3"><strong className="block truncate text-[11px] text-[var(--text)]">{event.title || t("calendar.google.busy")}</strong><span className="mt-1 block text-[9px] text-[var(--text-muted)]" dir="ltr">{time(event.start)}–{time(event.end)}</span></div>
          <label className="grid gap-1.5 text-[10px] font-bold text-[var(--text-muted)]"><span>{t("calendar.google.activityKind")}</span><Select value={kind} onValueChange={(value) => setKind(value as ActivityKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{activityKinds.map((item) => <SelectItem key={item} value={item}>{t(activityKindLabelKeys[item])}</SelectItem>)}</SelectContent></Select></label>
          <p className="text-[9px] leading-5 text-[var(--text-muted)]">{t("calendar.google.activityImportSafety")}</p>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button><Button type="button" onClick={() => { onConfirm(kind); onOpenChange(false); }}><ListPlus />{t("calendar.google.activityImportAction")}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
