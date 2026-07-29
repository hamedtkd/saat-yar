import { Coffee, Pause, Play, Square } from "lucide-react";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { duration, fa } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { TodayPageProps } from "./types";

export function TodayTimeStrip(props: Pick<TodayPageProps, "record" | "data" | "suggestedExit" | "updateRecord" | "lunchRunning" | "startLunch" | "finishLunch" | "activeBreak" | "todayCalc" | "startBreak" | "finishBreak">) {
  return (
    <section className={tw("time-edit-strip")}>
      <label>ورود<TimePicker value={props.record.start} onChange={(start) => props.updateRecord({ start })} suggestions={[{ label: "شروع معمول", value: props.data.settings.defaultStart }]} /></label>
      <label>خروج<TimePicker value={props.record.end} onChange={(end) => props.updateRecord({ end })} suggestions={[{ label: "پیشنهادی", value: props.suggestedExit }, { label: "پایان معمول", value: props.data.settings.defaultEnd }]} /></label>
      <div className={tw("tracker-box")}><span><Coffee /> ناهار <small>{fa.format(props.record.lunchMinutes)} دقیقه</small></span><Button variant={props.lunchRunning ? "default" : "outline"} size="sm" onClick={props.lunchRunning ? props.finishLunch : props.startLunch}>{props.lunchRunning ? <><Square /> پایان</> : <><Play /> شروع</>}</Button></div>
      <div className={tw("tracker-box")}><span><Pause /> وقفه <small>{duration(props.todayCalc.breakMinutes)}</small></span>{!props.activeBreak ? <Button variant="outline" size="sm" onClick={props.startBreak}><Play /> شروع</Button> : <div className={tw("preset-row")}>{[15, 30, 40, 60].map((value) => <Button variant="outline" size="sm" key={value} onClick={() => props.finishBreak(value)}>{fa.format(value)}</Button>)}<Button size="sm" onClick={() => props.finishBreak()}><Square /></Button></div>}</div>
    </section>
  );
}
