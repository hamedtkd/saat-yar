import { BellRing, CheckCircle2, Clock3, LogOut, TimerReset } from "lucide-react";
import { duration } from "@/lib/format";
import { cn } from "@/lib/cn";

export function TodaySmartSummary({
  started,
  finished,
  workedMinutes,
  creditedMinutes,
  dailyTarget,
  suggestedExit,
  openBreak,
  lunchRunning,
}: {
  started: boolean;
  finished: boolean;
  workedMinutes: number;
  creditedMinutes: number;
  dailyTarget: number;
  suggestedExit: string;
  openBreak: boolean;
  lunchRunning: boolean;
}) {
  const remaining = Math.max(0, dailyTarget - creditedMinutes);
  const completed = dailyTarget === 0 || creditedMinutes >= dailyTarget;
  const status = !started
    ? "روز کاری هنوز شروع نشده است"
    : finished
      ? "روز کاری با موفقیت پایان یافته است"
      : openBreak
        ? "وقفه در حال اجراست"
        : lunchRunning
          ? "ناهار در حال اجراست"
          : completed
            ? "هدف امروز تکمیل شده است"
            : `${duration(remaining)} تا تکمیل هدف باقی مانده`;

  const items = [
    { icon: <Clock3 />, label: "کارکرد فعلی", value: duration(workedMinutes) },
    { icon: <TimerReset />, label: "زمان باقی‌مانده", value: completed ? "تکمیل" : duration(remaining) },
    { icon: <LogOut />, label: "خروج پیشنهادی", value: started && !finished ? suggestedExit : "—" },
  ];

  return (
    <section className={cn("mb-4 rounded-2xl border p-4 shadow-[0_10px_35px_rgba(17,45,55,.04)]", completed ? "border-emerald-200 bg-emerald-50/70" : "border-[#dfe7e9] bg-white/95") }>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {completed ? <CheckCircle2 className="text-[#079b60]" /> : <BellRing className="text-[#0969a9]" />}
          <div>
            <strong className="block text-sm text-[#102a3a]">وضعیت هوشمند امروز</strong>
            <span className="text-[10px] text-[#607783]">{status}</span>
          </div>
        </div>
        {started && !finished && !completed && <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#526b75]">{Math.max(0, Math.round(creditedMinutes / Math.max(1, dailyTarget) * 100)).toLocaleString("fa-IR")}٪ پیشرفت</span>}
      </div>
      <div className="grid grid-cols-3 gap-2 max-[620px]:grid-cols-1">
        {items.map((item) => <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white bg-white/80 p-3"><span className="grid size-9 place-items-center rounded-lg bg-[#edf9f4] text-[#079b60]">{item.icon}</span><div><small className="block text-[9px] text-[#6c7d89]">{item.label}</small><strong className="text-sm text-[#102a3a]">{item.value}</strong></div></div>)}
      </div>
    </section>
  );
}
