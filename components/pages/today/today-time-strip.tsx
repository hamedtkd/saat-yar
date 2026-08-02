import {
  ChevronDown,
  Coffee,
  Pause,
  Play,
  Plus,
  Square,
  Trash2,
} from "lucide-react";

import { MinuteDurationField } from "@/components/common/minute-duration-field";
import { TimePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { duration, fa, nowTime } from "@/lib/format";
import { spanMinutes } from "@/lib/time-engine";
import type { BreakItem, WorkRecord } from "@/lib/types";

import type { TodayPageProps } from "./types";

export function TodayTimeStrip(
  props: Pick<
    TodayPageProps,
    | "record"
    | "data"
    | "suggestedExit"
    | "updateRecord"
    | "lunchRunning"
    | "startLunch"
    | "finishLunch"
    | "activeBreak"
    | "todayCalc"
    | "startBreak"
    | "finishBreak"
  >,
) {
  function updateLunch(patch: Partial<WorkRecord>) {
    const next = {
      ...props.record,
      ...patch,
    };

    if (
      next.lunchStart &&
      next.lunchEnd &&
      ("lunchStart" in patch || "lunchEnd" in patch)
    ) {
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
              ...("start" in patch || "end" in patch
                ? {
                    startedAt: undefined,
                    endedAt: undefined,
                  }
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
    props.updateRecord({
      breaks: props.record.breaks.filter((item) => item.id !== id),
    });
  }

  return (
    <section
      className={cn(
        "mb-5 overflow-hidden rounded-2xl border border-[#dfe7e9]",
        "bg-white/95 shadow-[0_14px_44px_rgba(17,45,55,0.06)]",
      )}
    >
      <div
        className={cn(
          "grid gap-3 p-4",
          "lg:grid-cols-[1.1fr_1.1fr_1fr_1fr]",
          "md:grid-cols-2",
          "grid-cols-1",
        )}
      >
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-extrabold text-[#173747]">
            ورود
          </span>

          <TimePicker
            value={props.record.start}
            onChange={(start) =>
              props.updateRecord({
                start,
                startedAt: undefined,
              })
            }
            suggestions={[
              {
                label: "شروع معمول",
                value: props.data.settings.defaultStart,
              },
            ]}
          />
        </label>

        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-extrabold text-[#173747]">
            خروج
          </span>

          <TimePicker
            value={props.record.end}
            onChange={(end) =>
              props.updateRecord({
                end,
                endedAt: undefined,
              })
            }
            suggestions={[
              {
                label: "پیشنهادی",
                value: props.suggestedExit,
              },
              {
                label: "پایان معمول",
                value: props.data.settings.defaultEnd,
              },
            ]}
          />
        </label>

        <div
          className={cn(
            "flex min-h-20 items-center justify-between gap-3",
            "rounded-2xl border border-[#dfe9e6]",
            "bg-[#f7fbf9] p-3",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f7f1] text-[#079b60]">
              <Coffee className="size-5" />
            </span>

            <div className="min-w-0">
              <strong className="block text-sm font-extrabold text-[#173747]">
                ناهار
              </strong>

              <span className="mt-1 block text-[11px] text-[#6c7d89]">
                {fa.format(props.record.lunchMinutes)} دقیقه
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant={props.lunchRunning ? "default" : "outline"}
            size="sm"
            onClick={
              props.lunchRunning
                ? props.finishLunch
                : props.startLunch
            }
            className={cn(
              "shrink-0 rounded-xl px-3",
              props.lunchRunning &&
                "bg-[#0b4556] text-white hover:bg-[#083b49]",
            )}
          >
            {props.lunchRunning ? (
              <>
                <Square className="size-4" />
                پایان
              </>
            ) : (
              <>
                <Play className="size-4" />
                شروع
              </>
            )}
          </Button>
        </div>

        <div
          className={cn(
            "flex min-h-20 items-center justify-between gap-3",
            "rounded-2xl border border-[#e2e7ee]",
            "bg-[#f8fafc] p-3",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef2ff] text-[#315ea8]">
              <Pause className="size-5" />
            </span>

            <div className="min-w-0">
              <strong className="block text-sm font-extrabold text-[#173747]">
                وقفه
              </strong>

              <span className="mt-1 block text-[11px] text-[#6c7d89]">
                {duration(props.todayCalc.breakMinutes)}
              </span>
            </div>
          </div>

          {!props.activeBreak ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={props.startBreak}
              className="shrink-0 rounded-xl px-3"
            >
              <Play className="size-4" />
              شروع
            </Button>
          ) : (
            <div className="flex flex-wrap justify-end gap-1.5">
              {[15, 30, 40, 60].map((value) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  key={value}
                  onClick={() => props.finishBreak(value)}
                  className="h-9 min-w-9 rounded-lg px-2"
                >
                  {fa.format(value)}
                </Button>
              ))}

              <Button
                type="button"
                size="icon"
                onClick={() => props.finishBreak()}
                aria-label="پایان وقفه"
                className="size-9 rounded-lg bg-[#0b4556] hover:bg-[#083b49]"
              >
                <Square className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <details className="group border-t border-[#e5ecee] bg-[#fbfdfc]">
        <summary
          className={cn(
            "flex cursor-pointer list-none items-center justify-between",
            "px-4 py-3 text-xs font-extrabold text-[#173747]",
            "transition-colors hover:bg-[#f4f9f7]",
            "[&::-webkit-details-marker]:hidden",
          )}
        >
          <span>ویرایش دقیق ناهار و وقفه‌ها</span>

          <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" />
        </summary>

        <div className="grid gap-4 border-t border-[#edf2f3] p-4">
          <section
            className={cn(
              "rounded-2xl border border-[#dfe9e6]",
              "bg-[#f8fbfa] p-4",
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="text-sm font-extrabold text-[#173747]">
                  ناهار
                </strong>

                <p className="mt-1 text-[10px] leading-5 text-[#6c7d89]">
                  زمان شروع، پایان و وضعیت باحقوق بودن ناهار را تنظیم کنید.
                </p>
              </div>

              <label className="flex! cursor-pointer items-center gap-2 rounded-xl border border-[#dce8e3] bg-white px-3 py-2 text-[11px] font-semibold text-[#526b75]">
                <input
                  type="checkbox"
                  checked={Boolean(props.record.lunchPaid)}
                  onChange={(event) =>
                    props.updateRecord({
                      lunchPaid: event.target.checked,
                    })
                  }
                  className="size-4 accent-[#079b60]"
                />

                <span>با حقوق</span>
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid min-w-0 gap-2">
                <span className="text-[11px] font-bold text-[#526b75]">
                  شروع
                </span>

                <TimePicker
                  value={props.record.lunchStart ?? ""}
                  onChange={(lunchStart) =>
                    updateLunch({
                      lunchStart,
                      lunchStartedAt: undefined,
                    })
                  }
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-[11px] font-bold text-[#526b75]">
                  پایان
                </span>

                <TimePicker
                  value={props.record.lunchEnd ?? ""}
                  onChange={(lunchEnd) =>
                    updateLunch({
                      lunchEnd,
                      lunchEndedAt: undefined,
                    })
                  }
                />
              </label>

              <label className="grid min-w-0 gap-2">
                <span className="text-[11px] font-bold text-[#526b75]">
                  مدت
                </span>

                <MinuteDurationField
                  value={props.record.lunchMinutes}
                  onValueChange={(lunchMinutes) =>
                    updateLunch({
                      lunchMinutes,
                    })
                  }
                  max={360}
                />
              </label>
            </div>

            {(props.record.lunchStart || props.record.lunchEnd) && (
              <Button
                type="button"
                className="mt-3 rounded-xl"
                variant="ghost"
                size="sm"
                onClick={() =>
                  props.updateRecord({
                    lunchStart: undefined,
                    lunchEnd: undefined,
                    lunchStartedAt: undefined,
                    lunchEndedAt: undefined,
                  })
                }
              >
                پاک‌کردن ساعت ناهار
              </Button>
            )}
          </section>

          <section
            className={cn(
              "rounded-2xl border border-[#e2e7ee]",
              "bg-[#f8fafc] p-4",
            )}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="text-sm font-extrabold text-[#173747]">
                  وقفه‌ها
                </strong>

                <p className="mt-1 text-[10px] leading-5 text-[#6c7d89]">
                  هر وقفه را جداگانه ویرایش، باحقوق یا حذف کنید.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBreak}
                className="rounded-xl"
              >
                <Plus className="size-4" />
                افزودن وقفه
              </Button>
            </div>

            <div className="grid gap-3">
              {props.record.breaks.length === 0 && (
                <div
                  className={cn(
                    "rounded-xl border border-dashed border-[#cfdcda]",
                    "bg-white p-5 text-center",
                    "text-[11px] text-[#6c7d89]",
                  )}
                >
                  هنوز وقفه‌ای ثبت نشده است.
                </div>
              )}

              {props.record.breaks.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "grid items-end gap-3 rounded-xl",
                    "border border-[#dce7e4] bg-white p-3",
                    "xl:grid-cols-[1.2fr_1fr_1fr_auto]",
                    "md:grid-cols-2",
                    "grid-cols-1",
                  )}
                >
                  <label className="grid min-w-0 gap-2">
                    <span className="text-[11px] font-bold text-[#526b75]">
                      عنوان
                    </span>

                    <Input
                      value={item.title}
                      onChange={(event) =>
                        updateBreak(item.id, {
                          title: event.target.value,
                        })
                      }
                      placeholder={`وقفه ${fa.format(index + 1)}`}
                      className="h-11 rounded-xl border-[#dce7e4] shadow-none"
                    />
                  </label>

                  <label className="grid min-w-0 gap-2">
                    <span className="text-[11px] font-bold text-[#526b75]">
                      شروع
                    </span>

                    <TimePicker
                      value={item.start}
                      onChange={(start) =>
                        updateBreak(item.id, {
                          start,
                        })
                      }
                    />
                  </label>

                  <label className="grid min-w-0 gap-2">
                    <span className="text-[11px] font-bold text-[#526b75]">
                      پایان
                    </span>

                    <TimePicker
                      value={item.end}
                      onChange={(end) =>
                        updateBreak(item.id, {
                          end,
                        })
                      }
                    />
                  </label>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeBreak(item.id)}
                    aria-label={`حذف وقفه ${index + 1}`}
                    className="size-11 rounded-xl md:justify-self-end"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </details>
    </section>
  );
}