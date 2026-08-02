import { Play, Square } from "lucide-react";
import { LiveDuration } from "@/components/common/live-duration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { duration, faDigits } from "@/lib/format";
import type { TodayPageProps } from "./types";
import { cn } from "@/lib/cn";

export function TodayFocusCard(props: Pick<TodayPageProps, "data" | "record" | "timerDraft" | "setTimerDraft" | "activeEntry" | "todayCalc" | "suggestedExit" | "toggleProjectTimer" | "startWork" | "finishWork">) {
  const mode = props.data.settings.mode;
  return (
    <section className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] mb-[18px] grid grid-cols-[1fr_390px] gap-[26px] px-6 py-[19px] max-[1180px]:grid-cols-[1fr_330px] max-[900px]:grid-cols-1 max-[620px]:p-[15px]")}>
      <div className={cn("grid grid-cols-3 content-center gap-x-[18px] gap-y-[14px] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1")}>
        {mode !== "employee" && <>
          <label>مشتری<Select value={props.data.projects.find((item) => item.id === props.timerDraft.projectId)?.clientId ?? ""} onValueChange={(clientId) => props.setTimerDraft((previous) => ({ ...previous, projectId: props.data.projects.find((project) => project.clientId === clientId)?.id ?? "" }))}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{props.data.clients.filter((item) => !item.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
          <label>پروژه<Select value={props.timerDraft.projectId} onValueChange={(projectId) => props.setTimerDraft((previous) => ({ ...previous, projectId }))}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{props.data.projects.filter((item) => item.status === "active").map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label>
          <label>وظیفه<Input placeholder="مثلاً طراحی رابط" value={props.timerDraft.task} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, task: event.target.value }))} /></label>
        </>}
        <label className={cn("col-span-2 max-[620px]:col-auto")}>توضیحات<Input placeholder="شرح کوتاه کار امروز" value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, note: event.target.value }))} /></label>
        {mode !== "employee" && <button type="button" className={cn("self-end flex h-11 items-center justify-center gap-[9px] rounded-[11px] border border-[#dfe7e9] bg-white text-[#6c7d89] [&>span]:relative [&>span]:h-[22px] [&>span]:w-[38px] [&>span]:rounded-full [&>span]:bg-[#d7e0e2] [&>span]:after:absolute [&>span]:after:right-[3px] [&>span]:after:top-[3px] [&>span]:after:h-4 [&>span]:after:w-4 [&>span]:after:rounded-full [&>span]:after:bg-white [&>span]:after:transition-all [&>span]:after:content-['']", props.timerDraft.billable && "text-[#102a3a] [&>span]:bg-[#079b60] [&>span]:after:right-[19px]")} onClick={() => props.setTimerDraft((previous) => ({ ...previous, billable: !previous.billable }))}><span /> قابل صورتحساب</button>}
      </div>
      <div className={cn("grid min-h-[170px] place-items-center content-center border-r border-[#dfe7e9] pr-[25px] text-center [&>strong]:my-[3px] [&>strong]:text-[clamp(31px,3.2vw,48px)] [&>strong]:font-medium [&>strong]:tracking-[1px] [&>small]:text-[#6c7d89] [&>div]:mt-[18px] [&>div]:flex [&>div]:gap-2 max-[900px]:border-0 max-[900px]:border-t max-[900px]:border-[#dfe7e9] max-[900px]:px-0 max-[900px]:pt-5 max-[620px]:[&>div]:w-full max-[620px]:[&>div]:flex-col")}>
        <span className={cn("flex items-center gap-[7px] text-[11px] [&_i]:h-[9px] [&_i]:w-[9px] [&_i]:rounded-full [&_i]:bg-[#079b60] [&_i]:shadow-[0_0_0_5px_#e4f6ef]")}><i />{props.activeEntry ? "تایمر پروژه در حال اجرا" : props.record.start && !props.record.end ? "روز کاری در حال اجرا" : "آماده شروع"}</span>
        <strong>{props.activeEntry ? <LiveDuration startedAt={props.activeEntry.startedAt} /> : props.record.start && !props.record.end ? duration(props.todayCalc.worked) : "۰:۰۰:۰۰"}</strong>
        <small>خروج پیشنهادی: {faDigits(props.suggestedExit)}</small>
        <div>
          {mode !== "employee" && <Button onClick={() => props.toggleProjectTimer()}>{props.activeEntry ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button>}
          {!props.record.start ? <Button onClick={props.startWork}><Play /> شروع روز</Button> : !props.record.end ? <Button variant="outline" onClick={props.finishWork}><Square /> پایان روز</Button> : <Button variant="secondary" onClick={props.startWork}><Play /> شروع دوباره</Button>}
        </div>
      </div>
    </section>
  );
}
