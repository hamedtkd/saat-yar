"use client";

import { ChevronDown } from "lucide-react";
import { useLocaleUi } from "@/components/i18n/use-locale-ui";
import { BreaksEditor } from "./breaks-editor";
import { LunchEditor } from "./lunch-editor";
import type { TodayTimeStripProps } from "./types";
import { useTimeStripActions } from "./use-time-strip-actions";

export function AdvancedEditor(props: Pick<TodayTimeStripProps, "record" | "updateRecord">) {
  const { t } = useLocaleUi();
  const actions = useTimeStripActions({ updateRecord: props.updateRecord });
  return <details className="group border-t border-[var(--border)] bg-[var(--surface-2)]">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-extrabold text-[var(--text)] transition-colors hover:bg-[var(--accent-soft)] [&::-webkit-details-marker]:hidden"><span>{t("today.advanced.title")}</span><ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" /></summary>
    <div className="grid gap-4 border-t border-[var(--border)] p-4"><LunchEditor record={props.record} updateRecord={props.updateRecord} updateLunch={actions.updateLunch} /><BreaksEditor record={props.record} addBreak={actions.addBreak} updateBreak={actions.updateBreak} removeBreak={actions.removeBreak} /></div>
  </details>;
}
