import { Coffee, Pause, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { duration, fa } from "@/lib/format";

import type { TodayTimeStripProps } from "./types";

export function QuickControls(props: Pick<TodayTimeStripProps, "record" | "lunchRunning" | "startLunch" | "finishLunch" | "activeBreak" | "todayCalc" | "startBreak" | "finishBreak">) {
  return <>
    <div className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-[#dfe9e6] bg-[#f7fbf9] p-3">
      <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f7f1] text-[#079b60]"><Coffee className="size-5" /></span><div><strong className="block text-sm font-extrabold text-[#173747]">ناهار</strong><span className="mt-1 block text-[11px] text-[#6c7d89]">{fa.format(props.record.lunchMinutes)} دقیقه</span></div></div>
      <Button type="button" variant={props.lunchRunning ? "default" : "outline"} size="sm" onClick={props.lunchRunning ? props.finishLunch : props.startLunch}
        className={cn("shrink-0 rounded-xl px-3", props.lunchRunning && "bg-[#0b4556] text-white hover:bg-[#083b49]")}>
        {props.lunchRunning ? <><Square className="size-4" />پایان</> : <><Play className="size-4" />شروع</>}
      </Button>
    </div>
    <div className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-[#e2e7ee] bg-[#f8fafc] p-3">
      <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef2ff] text-[#315ea8]"><Pause className="size-5" /></span><div><strong className="block text-sm font-extrabold text-[#173747]">وقفه</strong><span className="mt-1 block text-[11px] text-[#6c7d89]">{duration(props.todayCalc.breakMinutes)}</span></div></div>
      {!props.activeBreak ? <Button type="button" variant="outline" size="sm" onClick={props.startBreak} className="shrink-0 rounded-xl px-3"><Play className="size-4" />شروع</Button> :
        <div className="flex flex-wrap justify-end gap-1.5">{[15,30,40,60].map((value) => <Button type="button" variant="outline" size="sm" key={value} onClick={() => props.finishBreak(value)} className="h-9 min-w-9 rounded-lg px-2">{fa.format(value)}</Button>)}<Button type="button" size="icon" onClick={() => props.finishBreak()} aria-label="پایان وقفه" className="size-9 rounded-lg bg-[#0b4556] hover:bg-[#083b49]"><Square className="size-4" /></Button></div>}
    </div>
  </>;
}
