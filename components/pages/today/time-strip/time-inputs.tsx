import type { ReactNode } from "react";
import { LogIn, LogOut } from "lucide-react";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { TodayTimeStripProps } from "./types";

function TimeCard({ title, icon, tone, picker, action }: {
  title: string;
  icon: ReactNode;
  tone: string;
  picker: ReactNode;
  action: ReactNode;
}) {
  return <div className="grid min-h-[122px] content-between gap-3 rounded-[18px] border border-[var(--dashboard-border)] bg-[var(--surface-2)] p-3.5">
    <div className="flex items-center justify-between gap-3"><strong className="text-sm font-black text-[var(--text)]">{title}</strong><span className={cn("grid size-9 place-items-center rounded-xl", tone)}>{icon}</span></div>
    {picker}
    {action}
  </div>;
}

export function TimeInputs({ record, data, suggestedExit, updateRecord, startWork, finishWork }: Pick<TodayTimeStripProps, "record" | "data" | "suggestedExit" | "updateRecord" | "startWork" | "finishWork">) {
  return <>
    <TimeCard
      title="ورود"
      icon={<LogIn className="size-4" />}
      tone="bg-[var(--success-soft)] text-[var(--success)]"
      picker={<TimePicker value={record.start} onChange={(start) => updateRecord({ start, startedAt: undefined })} suggestions={[{ label: "شروع معمول", value: data.settings.defaultStart }]} />}
      action={<Button type="button" size="sm" className="w-full" onClick={startWork} disabled={Boolean(record.start && !record.end)}>ثبت ورود</Button>}
    />
    <TimeCard
      title="خروج"
      icon={<LogOut className="size-4" />}
      tone="bg-[var(--danger-soft)] text-[var(--danger)]"
      picker={<TimePicker value={record.end} onChange={(end) => updateRecord({ end, endedAt: undefined })} suggestions={[{ label: "پیشنهادی", value: suggestedExit }, { label: "پایان معمول", value: data.settings.defaultEnd }]} />}
      action={<Button type="button" size="sm" variant="destructive" className="w-full" onClick={finishWork} disabled={!record.start || Boolean(record.end)}>ثبت خروج</Button>}
    />
  </>;
}
