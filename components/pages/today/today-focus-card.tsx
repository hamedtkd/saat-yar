import { Play, Square } from "lucide-react";
import { LiveDuration } from "@/components/common/live-duration";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { duration, faDigits } from "@/lib/format";
import type { TodayPageProps } from "./types.ts";

type Props = Pick<TodayPageProps, "data" | "record" | "timerDraft" | "setTimerDraft" | "activeEntry" | "todayCalc" | "suggestedExit" | "toggleProjectTimer" | "startWork" | "finishWork">;

export function TodayFocusCard(props: Props) {
  const mode = props.data.settings.mode;
  const isEmployee = mode === "employee";
  const timerLabel = props.activeEntry ? "تایمر پروژه در حال اجرا" : props.record.start && !props.record.end ? "روز کاری در حال اجرا" : "آماده شروع";

  return (
    <SurfaceCard className="mb-5 overflow-hidden">
      <div className={cn("grid grid-cols-[minmax(0,1fr)_360px] max-[980px]:grid-cols-1", !isEmployee && "grid-cols-[minmax(0,1fr)_340px]")}>
        <div className={cn("p-5 sm:p-6", isEmployee ? "grid content-center gap-3" : "grid grid-cols-12 content-center gap-4")}>
          {isEmployee && (
            <div className="grid gap-1">
              <strong className="text-sm font-extrabold text-[var(--text)]">یادداشت روز کاری</strong>
              <span className="text-[10px] leading-5 text-[var(--text-muted)]">کارهای مهم، نتیجه جلسه یا نکته‌ای که باید در گزارش امروز بماند.</span>
            </div>
          )}
          {!isEmployee && <>
            <label className="col-span-4 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">مشتری<Select value={props.data.projects.find((item) => item.id === props.timerDraft.projectId)?.clientId ?? ""} onValueChange={(clientId) => props.setTimerDraft((previous) => ({ ...previous, projectId: props.data.projects.find((project) => project.clientId === clientId)?.id ?? "" }))}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{props.data.clients.filter((item) => !item.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
            <label className="col-span-4 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">پروژه<Select value={props.timerDraft.projectId} onValueChange={(projectId) => props.setTimerDraft((previous) => ({ ...previous, projectId }))}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{props.data.projects.filter((item) => item.status === "active").map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label>
            <label className="col-span-4 grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)] max-[720px]:col-span-12">وظیفه<Input placeholder="مثلاً طراحی رابط" value={props.timerDraft.task} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, task: event.target.value }))} /></label>
          </>}
          <label className={cn("grid min-w-0 gap-2 text-xs font-bold text-[var(--text-muted)]", isEmployee ? "w-full" : "col-span-8 max-[720px]:col-span-12")}>
            توضیحات
            {isEmployee ? (
              <Textarea rows={4} className="min-h-28" placeholder="مثلاً کارهای انجام‌شده، پیگیری‌های فردا یا نتیجه جلسه" value={props.record.note} onChange={(event) => props.updateRecord({ note: event.target.value })} />
            ) : (
              <Input placeholder="شرح کوتاه کار امروز" value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, note: event.target.value }))} />
            )}
          </label>
          {!isEmployee && <button type="button" aria-pressed={props.timerDraft.billable} className={cn("col-span-4 flex h-11 items-center justify-center gap-3 self-end rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--text-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] hover:bg-[var(--surface-1)] max-[720px]:col-span-12", props.timerDraft.billable && "border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)]")} onClick={() => props.setTimerDraft((previous) => ({ ...previous, billable: !previous.billable }))}><span className={cn("relative h-5 w-9 rounded-full bg-[var(--border)] after:absolute after:right-1 after:top-1 after:size-3 after:rounded-full after:bg-[var(--surface-1)] after:transition-all after:content-['']", props.timerDraft.billable && "bg-[var(--accent)] after:right-5")} /> قابل صورت‌حساب</button>}
        </div>
        <div className="relative grid min-h-52 place-items-center content-center overflow-hidden border-r border-[var(--border)] bg-[linear-gradient(145deg,var(--surface-2),var(--accent-soft))] p-5 text-center max-[980px]:border-r-0 max-[980px]:border-t">
          <div className="absolute -left-10 -top-12 size-40 rounded-full bg-[var(--accent-soft)] blur-3xl" aria-hidden="true" />
          <span className="relative flex items-center gap-2 text-xs font-bold text-[var(--accent-strong)]"><i className="size-2.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--accent-soft)]" />{timerLabel}</span>
          <strong className="relative my-3 text-[clamp(2.4rem,5vw,4.2rem)] font-black tracking-[-.04em]">{props.activeEntry ? <LiveDuration startedAt={props.activeEntry.startedAt} /> : props.record.start && !props.record.end ? duration(props.todayCalc.worked) : "۰:۰۰"}</strong>
          <small className="relative text-xs text-[var(--text-muted)]">خروج پیشنهادی: {faDigits(props.suggestedExit)}</small>
          <div className="relative mt-4 flex flex-wrap justify-center gap-2 max-[620px]:w-full max-[620px]:flex-col">
            {!isEmployee && <Button onClick={() => props.toggleProjectTimer()}>{props.activeEntry ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button>}
            {!props.record.start ? <Button onClick={props.startWork}><Play /> شروع روز</Button> : !props.record.end ? <Button variant="outline" onClick={props.finishWork}><Square /> پایان روز</Button> : <Button variant="secondary" onClick={props.startWork}><Play /> شروع دوباره</Button>}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
