import { Check, Play, Square } from "lucide-react";
import { LiveDuration } from "@/components/common/live-duration";
import { SurfaceCard } from "@/components/common/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { duration, fa, faDigits } from "@/lib/format";
import type { TodayPageProps } from "./types.ts";
import { TodayProgressArc } from "./today-progress-arc";

type Props = Pick<TodayPageProps, "data" | "record" | "timerDraft" | "setTimerDraft" | "activeEntry" | "todayCalc" | "dailyTarget" | "suggestedExit" | "toggleProjectTimer" | "startWork" | "finishWork" | "updateRecord">;

export function TodayFocusCard(props: Props) {
  const mode = props.data.settings.mode;
  const isEmployee = mode === "employee";
  const timerLabel = props.activeEntry ? "تایمر پروژه در حال اجرا" : props.record.start && !props.record.end ? "در حال کار" : props.record.end ? "روز کاری تمام شده" : "آماده شروع";
  const progress = props.dailyTarget === 0 ? 100 : Math.min(100, Math.round(props.todayCalc.credited / Math.max(1, props.dailyTarget) * 100));

  return (
    <SurfaceCard className="dashboard-card mb-4 overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,.035)] dark:shadow-[0_10px_26px_rgba(0,0,0,.18)]">
      <div className={cn("grid grid-cols-[minmax(0,1.18fr)_minmax(350px,.82fr)] max-[1050px]:grid-cols-1", !isEmployee && "grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]")}>
        <div className={cn(isEmployee ? "grid content-center gap-3" : "grid grid-cols-12 content-center gap-4", "min-h-[258px] p-5 sm:p-6")}>
          {isEmployee && (
            <div className="grid gap-1">
              <strong className="flex items-center gap-2 text-[15px] font-black text-[var(--text)]">
                یادداشت روز کاری
                <span className="grid size-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">✎</span>
              </strong>
              <span className="text-[10px] leading-5 text-[var(--text-muted)]">خلاصه مهم‌ترین کارهایی که در طول امروز انجام دادی.</span>
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
              <Textarea rows={4} className="min-h-32 resize-none rounded-[18px] bg-[var(--surface-2)] leading-7" placeholder="مثلاً کارهای انجام‌شده، پیگیری‌های فردا یا نتیجه جلسه" value={props.record.note} onChange={(event) => props.updateRecord({ note: event.target.value })} />
            ) : (
              <Input placeholder="شرح کوتاه کار امروز" value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, note: event.target.value }))} />
            )}
          </label>
          {!isEmployee && <button type="button" aria-pressed={props.timerDraft.billable} className={cn("col-span-4 flex h-11 items-center justify-center gap-3 self-end rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--text-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] hover:bg-[var(--surface-1)] max-[720px]:col-span-12", props.timerDraft.billable && "border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[var(--accent-soft)] text-[var(--accent-strong)]")} onClick={() => props.setTimerDraft((previous) => ({ ...previous, billable: !previous.billable }))}><span className={cn("relative h-5 w-9 rounded-full bg-[var(--border)] after:absolute after:right-1 after:top-1 after:size-3 after:rounded-full after:bg-[var(--surface-1)] after:transition-all after:content-['']", props.timerDraft.billable && "bg-[var(--accent)] after:right-5")} /> قابل صورت‌حساب</button>}
          {isEmployee && (
            <div className="flex items-center justify-between gap-3 text-[10px] text-[var(--text-muted)]">
              <span>آخرین ذخیره به‌صورت خودکار انجام می‌شود.</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 font-bold text-[var(--accent-strong)]"><Check className="size-3.5" /> ذخیره یادداشت</span>
            </div>
          )}
        </div>

        <div className="relative grid min-h-[258px] place-items-center content-center overflow-hidden border-r border-[var(--dashboard-border)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-accent))] p-4 text-center max-[1050px]:border-r-0 max-[1050px]:border-t">
          <div className="absolute inset-x-12 top-4 h-28 rounded-full bg-[var(--accent-soft)] blur-3xl" aria-hidden="true" />
          <span className="relative mb-1 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--surface-glass)] px-3 py-1.5 text-[10px] font-black text-[var(--accent-strong)]">
            <i className="size-2 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_var(--accent-soft)]" />{timerLabel}
          </span>
          <TodayProgressArc value={progress} className="dashboard-glow">
            <strong className="block text-[clamp(2.35rem,5vw,3.65rem)] font-black leading-none tracking-[-.04em] text-[var(--accent-strong)]">{props.activeEntry ? <LiveDuration startedAt={props.activeEntry.startedAt} /> : props.record.start && !props.record.end ? duration(props.todayCalc.worked) : props.record.end ? duration(props.todayCalc.worked) : "۰:۰۰"}</strong>
            <span className="mt-2 block text-[10px] font-bold text-[var(--text-muted)]">{fa.format(progress)}٪ از هدف روزانه</span>
          </TodayProgressArc>
          <small className="relative -mt-1 text-[10px] text-[var(--text-muted)]">{props.record.start ? `شروع ${faDigits(props.record.start)} · خروج پیشنهادی ${faDigits(props.suggestedExit)}` : `خروج پیشنهادی ${faDigits(props.suggestedExit)}`}</small>
          <div className="relative mt-4 grid w-full max-w-[285px] grid-cols-2 gap-2 max-[520px]:grid-cols-1">
            {!isEmployee ? <Button onClick={() => props.toggleProjectTimer()} className="w-full">{props.activeEntry ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button> : null}
            {!props.record.start ? <Button onClick={props.startWork} className={cn("w-full", isEmployee && "col-span-2")}><Play /> شروع روز</Button> : !props.record.end ? <Button variant="outline" onClick={props.finishWork} className="w-full"><Square /> پایان روز</Button> : <Button variant="secondary" onClick={props.startWork} className={cn("w-full", isEmployee && "col-span-2")}><Play /> شروع دوباره</Button>}
            {isEmployee && props.record.start && !props.record.end && <Button variant="secondary" className="w-full" disabled>در حال ثبت</Button>}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
