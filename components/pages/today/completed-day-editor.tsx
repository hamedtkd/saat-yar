"use client";

import { CheckCircle2, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TodayPageProps } from "./types";
import { TodayFocusCard } from "./today-focus-card";
import { TodayTimeStrip } from "./today-time-strip";

export function CompletedDayEditor(props: TodayPageProps) {
  const completed = Boolean(props.record.start && props.record.end);
  const [editing, setEditing] = useState(!completed);
  const locked = completed && !editing;

  return <>
    {completed && (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[color-mix(in_srgb,var(--success)_24%,var(--border))] bg-[var(--success-soft)] px-4 py-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 text-[var(--success)]" aria-hidden="true" />
          <div className="grid gap-0.5">
            <strong className="text-xs font-extrabold text-[var(--text)]">ثبت این روز کامل شده است</strong>
            <span className="text-[10px] leading-5 text-[var(--text-muted)]">برای جلوگیری از تغییر ناخواسته، اطلاعات این روز فقط‌خواندنی است.</span>
          </div>
        </div>
        <Button type="button" variant={editing ? "outline" : "secondary"} onClick={() => setEditing((value) => !value)}>
          {editing ? <><X /> پایان ویرایش</> : <><Pencil /> ویرایش این روز</>}
        </Button>
      </div>
    )}
    <fieldset disabled={locked} className="min-w-0 disabled:[&_input]:cursor-not-allowed disabled:[&_textarea]:cursor-not-allowed disabled:[&_button]:cursor-not-allowed disabled:[&_details]:opacity-80">
      <TodayFocusCard {...props} />
      <TodayTimeStrip {...props} />
    </fieldset>
  </>;
}
