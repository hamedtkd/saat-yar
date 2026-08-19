"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { activitySegmentMinutes } from "@/lib/activity-segments";
import { resolveActivityProjectName } from "@/lib/activity-project-context";
import type { MessageKey } from "@/lib/i18n/fa";
import type { ActivityKind, ActivitySegment, Mode, Project, WorkProject } from "@/lib/types";
import { ActivityDurationDialog } from "./activity-duration-dialog";

const labelKeys: Record<ActivityKind, MessageKey> = {
  "deep-work": "activity.kind.deepWork",
  meeting: "activity.kind.meeting",
  learning: "activity.kind.learning",
  admin: "activity.kind.admin",
  project: "activity.kind.project",
  other: "activity.kind.other",
};

export function ActivitySegmentRow({ segment, mode, workProjects, freelanceProjects, onUpdateDuration, onDelete }: {
  segment: ActivitySegment;
  mode: Mode;
  workProjects: WorkProject[];
  freelanceProjects: Project[];
  onUpdateDuration: (segmentId: string, minutes: number) => void;
  onDelete: (segmentId: string) => void;
}) {
  const { duration, t } = useLocaleUi();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const projectName = resolveActivityProjectName(segment, mode, workProjects, freelanceProjects);
  const primary = segment.title || t(labelKeys[segment.kind]);
  const secondary = segment.title ? [t(labelKeys[segment.kind]), projectName].filter(Boolean).join(" · ") : projectName || "";

  return (
    <>
      <div data-recent-activity-segment className="flex min-h-12 min-w-0 items-center gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--dashboard-border)_72%,transparent)] bg-[var(--surface-1)] px-3 py-2.5">
        <span className="grid min-w-0 flex-1 gap-0.5">
          <strong className="truncate text-[10px] text-[var(--text)]">{primary}</strong>
          {secondary && <small className="truncate text-[9px] text-[var(--text-muted)]">{secondary}</small>}
        </span>
        <strong className="shrink-0 text-[10px] tabular-nums text-[var(--text)]">{duration(activitySegmentMinutes(segment))}</strong>
        <span className="flex shrink-0 items-center gap-1">
          <Button type="button" size="icon" variant="ghost" className="size-8" aria-label={t("activity.today.editDuration")} title={t("activity.today.editDuration")} onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="size-8 text-[var(--danger)] hover:bg-[var(--danger-soft)]" aria-label={t("activity.today.delete")} title={t("activity.today.delete")} onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="size-3.5" />
          </Button>
        </span>
      </div>

      <ActivityDurationDialog
        open={editing}
        segment={segment}
        onOpenChange={setEditing}
        onSave={(minutes) => onUpdateDuration(segment.id, minutes)}
      />

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("activity.today.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("activity.today.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="border border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95" onClick={() => onDelete(segment.id)}>
              {t("activity.today.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
