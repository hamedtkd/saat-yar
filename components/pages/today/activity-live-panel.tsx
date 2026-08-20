"use client";

import { Square } from "lucide-react";

import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { Button } from "@/components/ui/button";
import type { MessageKey } from "@/lib/i18n/fa";
import type { ActivityKind, ActivitySegment } from "@/lib/types";
import { ActivityActiveTimer } from "./activity-active-timer";

const labelKeys: Record<ActivityKind, MessageKey> = {
  "deep-work": "activity.kind.deepWork",
  meeting: "activity.kind.meeting",
  learning: "activity.kind.learning",
  admin: "activity.kind.admin",
  project: "activity.kind.project",
  other: "activity.kind.other",
};

function ReadOnlyActivityField({ label, optional, value, liveTitle = false }: { label: string; optional?: string; value: string; liveTitle?: boolean }) {
  return (
    <div data-active-activity-title={liveTitle ? "true" : undefined} className="grid min-w-0 content-start gap-1.5">
      <span className="flex min-h-5 items-center gap-1 whitespace-nowrap text-[11px] font-black text-[var(--text)]">
        <span className="truncate">{label}</span>
        {optional && <small className="shrink-0 text-[9px] font-medium text-[var(--text-muted)]">({optional})</small>}
      </span>
      <span className="flex h-11 min-w-0 items-center rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-1)] px-3 text-[11px] font-bold text-[var(--text)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--accent)_3%,transparent)]">
        <span className="truncate">{value}</span>
      </span>
    </div>
  );
}

export function ActivityLivePanel({
  segment,
  projectName,
  onStop,
}: {
  segment: ActivitySegment;
  projectName?: string;
  onStop: () => void;
}) {
  const { t } = useLocaleUi();
  const typeLabel = t(labelKeys[segment.kind]);

  return (
    <div
      data-active-activity-segment
      className="mt-4 rounded-[18px] border border-[color-mix(in_srgb,var(--accent)_24%,var(--dashboard-border))] bg-[var(--surface-2)] p-3 min-[360px]:p-4"
    >
      <div className="grid gap-x-3 gap-y-2 md:grid-cols-[minmax(140px,.72fr)_minmax(220px,1.22fr)_minmax(190px,.95fr)_minmax(245px,auto)_minmax(116px,.48fr)] md:items-end">
        <div className="flex min-h-6 items-center justify-start md:col-[1/-1]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_28%,var(--dashboard-border))] bg-[color-mix(in_srgb,var(--accent-soft)_72%,transparent)] px-2.5 py-1 text-[9px] font-black text-[var(--accent-strong)] shadow-[0_0_16px_color-mix(in_srgb,var(--accent)_10%,transparent)]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-[var(--accent)] opacity-30 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--accent)]" />
            </span>
            {t("activity.today.live")}
          </span>
        </div>

        <ReadOnlyActivityField label={t("activity.today.type")} value={typeLabel} />
        <ReadOnlyActivityField
          label={t("activity.today.workItem")}
          optional={t("common.optional")}
          value={segment.title || "—"}
          liveTitle
        />
        <ReadOnlyActivityField
          label={t("activity.today.project")}
          optional={t("common.optional")}
          value={projectName || t("activity.today.noProject")}
        />

        <div className="grid min-w-0 content-start gap-1.5">
          <span className="flex min-h-5 items-center text-[10px] font-black text-[var(--text-muted)]">
            {t("activity.today.liveTimer")}
          </span>
          <div className="flex min-h-[63px] min-w-0 items-start justify-center overflow-visible px-1">
            <ActivityActiveTimer segment={segment} />
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-1.5 md:border-s md:border-[var(--dashboard-border)] md:ps-4">
          <span aria-hidden="true" className="min-h-5" />
          <Button
            size="sm"
            variant="outline"
            onClick={onStop}
            className="h-[63px] w-full shrink-0 rounded-[14px] border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] px-3 text-[11px] font-black hover:border-[color-mix(in_srgb,var(--accent)_46%,var(--border))] hover:bg-[var(--accent-soft)] max-[767px]:h-11"
          >
            <Square aria-hidden="true" className="size-3.5" />
            {t("activity.today.stop")}
          </Button>
        </div>
      </div>
    </div>
  );
}
