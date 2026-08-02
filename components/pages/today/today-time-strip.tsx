import { Coffee, Pause, Play, Plus, Square, Trash2 } from "lucide-react";
import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duration, fa, nowTime } from "@/lib/format";
import { spanMinutes } from "@/lib/time-engine";
import type { BreakItem, WorkRecord } from "@/lib/types";
import type { TodayPageProps } from "./types";

export function TodayTimeStrip(props: Pick<TodayPageProps, "record" | "data" | "suggestedExit" | "updateRecord" | "lunchRunning" | "startLunch" | "finishLunch" | "activeBreak" | "todayCalc" | "startBreak" | "finishBreak">) {
  function updateLunch(patch: Partial<WorkRecord>) {
    const next = { ...props.record, ...patch };
    if (next.lunchStart && next.lunchEnd && ("lunchStart" in patch || "lunchEnd" in patch)) {
      next.lunchMinutes = spanMinutes(next.lunchStart, next.lunchEnd);
    }
    props.updateRecord({
      ...patch,
      lunchMinutes: next.lunchMinutes,
    });
  }

  function updateBreak(id: string, patch: Partial<BreakItem>) {
    props.updateRecord({
      breaks: props.record.breaks.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              ...(("start" in patch || "end" in patch)
                ? { startedAt: undefined, endedAt: undefined }
                : {}),
            }
          : item,
      ),
    });
  }

  function addBreak() {
    const start = nowTime();
    props.updateRecord({
      breaks: [
        ...props.record.breaks,
        {
          id: crypto.randomUUID(),
          start,
          end: start,
          title: "وقفه شخصی",
          paid: false,
        },
      ],
    });
  }

  function removeBreak(id: string) {
    props.updateRecord({ breaks: props.record.breaks.filter((item) => item.id !== id) });
  }

  return (
    <section className="mb-[18px] grid grid-cols-[1fr_1fr_1.2fr_1.5fr] gap-3 rounded-[15px] border border-[#dfe7e9] bg-white/95 p-[13px] shadow-[0_10px_35px_rgba(17,45,55,.055)] max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
      <label>
        ورود
        <TimePicker
          value={props.record.start}
          onChange={(start) => props.updateRecord({ start, startedAt: undefined })}
          suggestions={[{ label: "شروع معمول", value: props.data.settings.defaultStart }]}
        />
      </label>
      <label>
        خروج
        <TimePicker
          value={props.record.end}
          onChange={(end) => props.updateRecord({ end, endedAt: undefined })}
          suggestions={[
            { label: "پیشنهادی", value: props.suggestedExit },
            { label: "پایان معمول", value: props.data.settings.defaultEnd },
          ]}
        />
      </label>

      <div className="flex min-h-[58px] items-center justify-between gap-[10px] rounded-[11px] border border-[#edf1f2] bg-[#fbfdfc] px-[10px] [&>span]:flex [&>span]:items-center [&>span]:gap-[7px] [&>span]:text-xs [&>span]:font-bold [&_small]:font-medium [&_small]:text-[#6c7d89]">
        <span><Coffee /> ناهار <small>{fa.format(props.record.lunchMinutes)} دقیقه</small></span>
        <Button
          variant={props.lunchRunning ? "default" : "outline"}
          size="sm"
          onClick={props.lunchRunning ? props.finishLunch : props.startLunch}
        >
          {props.lunchRunning ? <><Square /> پایان</> : <><Play /> شروع</>}
        </Button>
      </div>

      <div className="flex min-h-[58px] items-center justify-between gap-[10px] rounded-[11px] border border-[#edf1f2] bg-[#fbfdfc] px-[10px] [&>span]:flex [&>span]:items-center [&>span]:gap-[7px] [&>span]:text-xs [&>span]:font-bold [&_small]:font-medium [&_small]:text-[#6c7d89]">
        <span><Pause /> وقفه <small>{duration(props.todayCalc.breakMinutes)}</small></span>
        {!props.activeBreak ? (
          <Button variant="outline" size="sm" onClick={props.startBreak}><Play /> شروع</Button>
        ) : (
          <div className="flex gap-1">
            {[15, 30, 40, 60].map((value) => (
              <Button variant="outline" size="sm" key={value} onClick={() => props.finishBreak(value)}>{fa.format(value)}</Button>
            ))}
            <Button size="sm" onClick={() => props.finishBreak()}><Square /></Button>
          </div>
        )}
      </div>

      <details className="col-span-full rounded-xl border border-[#e3ebed] bg-[#fbfdfc] p-3 open:bg-white max-[620px]:col-auto">
        <summary className="cursor-pointer select-none text-xs font-extrabold text-[#15323a]">
          ویرایش دقیق ناهار و وقفه‌ها
        </summary>

        <div className="mt-4 grid gap-4">
          <section className="rounded-xl border border-[#e2ebe8] bg-[#f8fbfa] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <strong className="text-sm">ناهار</strong>
              <label className="flex items-center gap-2 text-[11px] font-semibold text-[#526b75]">
                <input
                  type="checkbox"
                  checked={Boolean(props.record.lunchPaid)}
                  onChange={(event) => props.updateRecord({ lunchPaid: event.target.checked })}
                  className="size-4 accent-[#079b60]"
                />
                با حقوق
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3 max-[700px]:grid-cols-1">
              <label>شروع<TimePicker value={props.record.lunchStart ?? ""} onChange={(lunchStart) => updateLunch({ lunchStart, lunchStartedAt: undefined })} /></label>
              <label>پایان<TimePicker value={props.record.lunchEnd ?? ""} onChange={(lunchEnd) => updateLunch({ lunchEnd, lunchEndedAt: undefined })} /></label>
              <label>مدت<MinuteDurationField value={props.record.lunchMinutes} onValueChange={(lunchMinutes) => updateLunch({ lunchMinutes })} max={360} /></label>
            </div>
            {(props.record.lunchStart || props.record.lunchEnd) && (
              <Button
                className="mt-3"
                variant="ghost"
                size="sm"
                onClick={() => props.updateRecord({ lunchStart: undefined, lunchEnd: undefined, lunchStartedAt: undefined, lunchEndedAt: undefined })}
              >
                پاک‌کردن ساعت ناهار
              </Button>
            )}
          </section>

          <section className="rounded-xl border border-[#e2ebe8] bg-[#f8fbfa] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <strong className="text-sm">وقفه‌ها</strong>
                <p className="m-0 mt-1 text-[10px] text-[#6c7d89]">هر وقفه را جداگانه ویرایش، باحقوق یا حذف کنید.</p>
              </div>
              <Button variant="outline" size="sm" onClick={addBreak}><Plus /> افزودن وقفه</Button>
            </div>

            <div className="grid gap-3">
              {props.record.breaks.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#cfdcda] p-4 text-center text-[11px] text-[#6c7d89]">
                  هنوز وقفه‌ای ثبت نشده است.
                </div>
              )}
              {props.record.breaks.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[1.2fr_1fr_1fr_auto_auto] items-end gap-2 rounded-lg border border-[#dce7e4] bg-white p-2 max-[850px]:grid-cols-2 max-[620px]:grid-cols-1">
                  <label>
                    عنوان
                    <Input value={item.title} onChange={(event) => updateBreak(item.id, { title: event.target.value })} placeholder={`وقفه ${fa.format(index + 1)}`} />
                  </label>
                  <label>شروع<TimePicker value={item.start} onChange={(start) => updateBreak(item.id, { start })} /></label>
                  <label>پایان<TimePicker value={item.end} onChange={(end) => updateBreak(item.id, { end })} /></label>
                  <label className="flex min-h-11 items-center gap-2 text-[11px] font-semibold text-[#526b75]">
                    <input
                      type="checkbox"
                      checked={Boolean(item.paid)}
                      onChange={(event) => updateBreak(item.id, { paid: event.target.checked })}
                      className="size-4 accent-[#079b60]"
                    />
                    با حقوق
                  </label>
                  <Button variant="destructive" size="icon" onClick={() => removeBreak(item.id)} aria-label={`حذف وقفه ${index + 1}`}><Trash2 /></Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </details>
    </section>
  );
}
