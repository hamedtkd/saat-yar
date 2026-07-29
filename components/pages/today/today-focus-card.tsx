import { Play, Square } from "lucide-react";
import { LiveDuration } from "@/components/common/live-duration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { duration, faDigits } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { TodayPageProps } from "./types";

export function TodayFocusCard(props: Pick<TodayPageProps, "data" | "record" | "timerDraft" | "setTimerDraft" | "activeEntry" | "todayCalc" | "suggestedExit" | "toggleProjectTimer" | "startWork" | "finishWork">) {
  const mode = props.data.settings.mode;
  return (
    <section className={tw("focus-card")}>
      <div className={tw("focus-form")}>
        {mode !== "employee" && <>
          <label>مشتری<Select value={props.data.projects.find((item) => item.id === props.timerDraft.projectId)?.clientId ?? ""} onValueChange={(clientId) => props.setTimerDraft((previous) => ({ ...previous, projectId: props.data.projects.find((project) => project.clientId === clientId)?.id ?? "" }))}><SelectTrigger><SelectValue placeholder="انتخاب مشتری" /></SelectTrigger><SelectContent>{props.data.clients.filter((item) => !item.archived).map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select></label>
          <label>پروژه<Select value={props.timerDraft.projectId} onValueChange={(projectId) => props.setTimerDraft((previous) => ({ ...previous, projectId }))}><SelectTrigger><SelectValue placeholder="انتخاب پروژه" /></SelectTrigger><SelectContent>{props.data.projects.filter((item) => item.status === "active").map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></label>
          <label>وظیفه<Input placeholder="مثلاً طراحی رابط" value={props.timerDraft.task} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, task: event.target.value }))} /></label>
        </>}
        <label className={tw("focus-note")}>توضیحات<Input placeholder="شرح کوتاه کار امروز" value={props.timerDraft.note} onChange={(event) => props.setTimerDraft((previous) => ({ ...previous, note: event.target.value }))} /></label>
        {mode !== "employee" && <button type="button" className={tw("billable-toggle", props.timerDraft.billable && "on")} onClick={() => props.setTimerDraft((previous) => ({ ...previous, billable: !previous.billable }))}><span /> قابل صورتحساب</button>}
      </div>
      <div className={tw("focus-clock")}>
        <span className={tw("running-label")}><i />{props.activeEntry ? "تایمر پروژه در حال اجرا" : props.record.start && !props.record.end ? "روز کاری در حال اجرا" : "آماده شروع"}</span>
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
