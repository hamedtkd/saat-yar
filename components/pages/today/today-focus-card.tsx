import { Play, Square } from "lucide-react";
import { LiveDuration } from "@/components/common/live-duration";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { duration, faDigits } from "@/lib/format";
import type { TodayPageProps } from "./types.ts";
import { cn } from "@/lib/cn";

type Props = Pick<TodayPageProps, "data" | "record" | "timerDraft" | "setTimerDraft" | "activeEntry" | "todayCalc" | "suggestedExit" | "toggleProjectTimer" | "startWork" | "finishWork">;

export function TodayFocusCard(props: Props) {
  const mode = props.data.settings.mode;
  const timerLabel = props.activeEntry ? "تایمر پروژه در حال اجرا" : props.record.start && !props.record.end ? "روز کاری در حال اجرا" : "آماده شروع";
  return (
    <SurfaceCard className="mb-5 overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_380px] max-[980px]:grid-cols-1">
        <div className="grid grid-cols-3 gap-4 p-5 sm:p-6 max-[720px]:grid-cols-1">
          {mode !== "employee" && <>
            <label className="grid gap-2 text-xs font-bold text-[var(--text-muted)]">مشتری<Select value={props.data.projects.find((item) => item.id === props.timerDraft.projectId)?.clientId ?? ""} onValueChange={(clientId) => props.setTimerDraft((previous) => ({ ...previous, projectId: props.data.projects.find((project) => project.clientId === clientId)?.id ?? "" }))}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{props.data.clients.filter((item) => !item.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
            <label className="grid gap-2 text-xs font-bold text-[var(--text-muted)]">پروژه<Select value={props.timerDraft.projectId} onValueChange={(projectId) => props.setTimerDraft((previous) => ({ ...previous, projectId }))}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{props.data.projects.filter((item) => item.status === "active").map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label>
            <label className="grid gap-2 text-xs font-bold text-[var(--text-muted)]">وظیفه<Input placeholder="مثلاً طراحی رابط" value={props.timerDraft.task} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, task: event.target.value }))} /></label>
          </>}
          <label className={cn("grid gap-2 text-xs font-bold text-[var(--text-muted)]", mode !== "employee" && "col-span-2 max-[720px]:col-auto")}>توضیحات<Input placeholder="شرح کوتاه کار امروز" value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, note: event.target.value }))} /></label>
          {mode !== "employee" && <button type="button" className={cn("mt-auto flex h-11 items-center justify-center gap-3 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] text-xs font-bold text-[var(--text-muted)]", props.timerDraft.billable && "border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] text-[var(--accent-strong)]")} onClick={() => props.setTimerDraft((previous) => ({ ...previous, billable: !previous.billable }))}><span className={cn("relative h-6 w-10 rounded-full bg-[var(--border)] after:absolute after:right-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition-all after:content-['']", props.timerDraft.billable && "bg-[var(--accent)] after:right-5")} /> قابل صورتحساب</button>}
        </div>
        <div className="relative grid min-h-64 place-items-center content-center overflow-hidden border-r border-[var(--border)] bg-[linear-gradient(145deg,var(--surface-2),var(--accent-soft))] p-6 text-center max-[980px]:border-r-0 max-[980px]:border-t">
          <div className="absolute -left-10 -top-12 size-44 rounded-full bg-[var(--accent-soft)] blur-3xl" aria-hidden="true" />
          <span className="relative flex items-center gap-2 text-xs font-bold text-[var(--accent-strong)]"><i className="size-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_6px_var(--accent-soft)]" />{timerLabel}</span>
          <strong className="relative my-4 text-[clamp(2.4rem,5vw,4.5rem)] font-black tracking-[-.04em]">{props.activeEntry ? <LiveDuration startedAt={props.activeEntry.startedAt} /> : props.record.start && !props.record.end ? duration(props.todayCalc.worked) : "۰:۰۰"}</strong>
          <small className="relative text-xs text-[var(--text-muted)]">خروج پیشنهادی: {faDigits(props.suggestedExit)}</small>
          <div className="relative mt-5 flex flex-wrap justify-center gap-2 max-[620px]:w-full max-[620px]:flex-col">
            {mode !== "employee" && <Button onClick={() => props.toggleProjectTimer()}>{props.activeEntry ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button>}
            {!props.record.start ? <Button onClick={props.startWork}><Play /> شروع روز</Button> : !props.record.end ? <Button variant="outline" onClick={props.finishWork}><Square /> پایان روز</Button> : <Button variant="secondary" onClick={props.startWork}><Play /> شروع دوباره</Button>}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
