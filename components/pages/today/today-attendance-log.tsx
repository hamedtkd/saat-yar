import { Coffee, LogIn, LogOut, Pause } from "lucide-react";
import { SurfaceCard } from "@/components/common/surface-card";
import { duration, faDigits } from "@/lib/format";
import { spanMinutes } from "@/lib/time-engine";
import type { WorkRecord } from "@/lib/types";

export function TodayAttendanceLog({ record }: { record: WorkRecord }) {
  const events = [
    ...(record.start ? [{ key: "start", type: "ورود", time: record.start, duration: "—", note: "شروع روز کاری", icon: <LogIn />, tone: "bg-[var(--success-soft)] text-[var(--success)]" }] : []),
    ...(record.lunchStart ? [{ key: "lunch", type: "ناهار", time: record.lunchStart, duration: record.lunchEnd ? duration(spanMinutes(record.lunchStart, record.lunchEnd)) : "در حال اجرا", note: record.lunchPaid ? "ناهار با حقوق" : "استراحت ناهار", icon: <Coffee />, tone: "bg-[var(--warning-soft)] text-[var(--warning)]" }] : []),
    ...record.breaks.map((item) => ({ key: item.id, type: "وقفه", time: item.start, duration: item.end ? duration(spanMinutes(item.start, item.end)) : "در حال اجرا", note: item.title || "وقفه کاری", icon: <Pause />, tone: "bg-[var(--info-soft)] text-[var(--info)]" })),
    ...(record.end ? [{ key: "end", type: "خروج", time: record.end, duration: "—", note: "پایان روز کاری", icon: <LogOut />, tone: "bg-[var(--danger-soft)] text-[var(--danger)]" }] : []),
  ];

  return (
    <SurfaceCard className="dashboard-card mb-4 overflow-hidden p-3 shadow-[0_5px_16px_rgba(0,0,0,.03)] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-xs font-black">ورودها، خروج‌ها، ناهار و وقفه‌ها</strong><span className="text-[10px] text-[var(--text-muted)]">{faDigits(String(events.length))} رویداد</span></div>
      {events.length ? <div className="overflow-x-auto rounded-[16px] border border-[var(--dashboard-border)]">
        <table className="w-full min-w-[620px] border-collapse text-[11px]">
          <thead className="bg-[var(--surface-2)] text-[var(--text-muted)]"><tr><th className="px-3 py-2.5 text-right">نوع</th><th className="px-3 py-2.5 text-right">زمان</th><th className="px-3 py-2.5 text-right">مدت</th><th className="px-3 py-2.5 text-right">یادداشت</th></tr></thead>
          <tbody>{events.map((event) => <tr key={event.key} className="border-t border-[var(--dashboard-border)]"><td className="px-3 py-2.5"><span className="inline-flex items-center gap-2 font-black"><i className={`grid size-7 place-items-center rounded-lg ${event.tone} [&_svg]:size-3.5`}>{event.icon}</i>{event.type}</span></td><td className="px-3 py-2.5 font-bold">{faDigits(event.time)}</td><td className="px-3 py-2.5">{event.duration}</td><td className="px-3 py-2.5 text-[var(--text-muted)]">{event.note}</td></tr>)}</tbody>
        </table>
      </div> : <div className="rounded-[16px] border border-dashed border-[var(--dashboard-border)] bg-[var(--surface-2)] px-4 py-7 text-center text-[11px] text-[var(--text-muted)]">با ثبت اولین ورود، رویدادهای امروز اینجا نمایش داده می‌شوند.</div>}
    </SurfaceCard>
  );
}
