import type { Locale } from "@/lib/i18n/locales";
import { TimeWheel } from "./time-wheel";

type Props = {
  locale: Locale;
  hour: string;
  minute: string;
  hourLabel: string;
  minuteLabel: string;
  hours: string[];
  minutes: string[];
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
};

export function TimeWheelField(props: Props) {
  return (
    <div dir="ltr" className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-2 max-[359px]:gap-1.5 max-[359px]:rounded-[18px] max-[359px]:p-1.5 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--text)_4%,transparent)]">
      <TimeWheel locale={props.locale} label={props.hourLabel} value={props.hour} options={props.hours} onChange={props.onHourChange} />
      <span aria-hidden="true" className="relative z-30 text-2xl font-black max-[359px]:text-xl text-[var(--accent-strong)]">:</span>
      <TimeWheel locale={props.locale} label={props.minuteLabel} value={props.minute} options={props.minutes} onChange={props.onMinuteChange} />
    </div>
  );
}
