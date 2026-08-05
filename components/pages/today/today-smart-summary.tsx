import { BellRing, CheckCircle2, Clock3, LogOut, TimerReset } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { duration } from "@/lib/format";

export function TodaySmartSummary({ started, finished, workedMinutes, creditedMinutes, dailyTarget, suggestedExit, openBreak, lunchRunning }: {
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
  const status = !started ? "روز کاری هنوز شروع نشده است" : finished ? "روز کاری با موفقیت پایان یافته است" : openBreak ? "وقفه در حال اجراست" : lunchRunning ? "ناهار در حال اجراست" : completed ? "هدف امروز تکمیل شده است" : `${duration(remaining)} تا تکمیل هدف باقی مانده`;
  const items = [
    { icon: <Clock3 />, label: "کارکرد فعلی", value: duration(workedMinutes) },
    { icon: <TimerReset />, label: "زمان باقی‌مانده", value: completed ? "تکمیل" : duration(remaining) },
    { icon: <LogOut />, label: "خروج پیشنهادی", value: started && !finished ? suggestedExit : "—" },
  ];

  return (
    <SurfaceCard className="mb-5 overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            {completed ? <CheckCircle2 /> : <BellRing />}
          </span>
          <div>
            <strong className="block text-sm font-black">وضعیت هوشمند امروز</strong>
            <span className="text-xs text-[var(--text-muted)]">{status}</span>
          </div>
        </div>
        {started && !finished && <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[10px] font-black text-[var(--accent-strong)]">{Math.max(0, Math.round(creditedMinutes / Math.max(1, dailyTarget) * 100)).toLocaleString("fa-IR")}٪ پیشرفت</span>}
      </div>
      <div className="grid grid-cols-3 gap-3 max-[620px]:grid-cols-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)] [&_svg]:size-4">{item.icon}</span>
            <div><small className="block text-[10px] text-[var(--text-muted)]">{item.label}</small><strong className="text-sm font-black">{item.value}</strong></div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
