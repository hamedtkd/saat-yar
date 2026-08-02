import { Edit3, Trash2, Umbrella } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, jalali } from "@/lib/format";
import type { AppData, LeaveEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function LeaveTable({ data, setData, setDraft }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
}) {
  return (
    <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "min-w-0 p-[13px]")}>
      <PanelHead icon={<Umbrella />} title="تاریخچه مرخصی‌ها" />
      <div className={cn("w-full overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px] [&_th]:h-[39px] [&_th]:whitespace-nowrap [&_th]:border-y [&_th]:border-[#edf1f2] [&_th]:bg-[#fbfcfc] [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-semibold [&_th]:text-[#536975] [&_td]:min-h-[46px] [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf1f2] [&_td]:px-3 [&_td]:py-[9px] [&_td]:text-[#2e4856] [&_td_strong]:flex [&_td_strong]:items-center [&_td_strong]:gap-[7px] [&_td_strong]:text-[11px] [&_td_strong]:text-[#102a3a] [&_td_strong>i]:h-[7px] [&_td_strong>i]:w-[7px] [&_td_strong>i]:rounded-full [&_td_small]:mt-[3px] [&_td_small]:block [&_td_small]:text-[9px] [&_td_small]:text-[#6c7d89] [&_td_input]:min-w-[175px]")}><table><thead><tr><th>بازه</th><th>نوع</th><th>مدت</th><th>توضیح</th><th>عملیات</th></tr></thead><tbody>
        {data.leaves.map((entry) => <tr key={entry.id}><td>{jalali(entry.startDate)} تا {jalali(entry.endDate)}</td><td><StatusBadge success>{entry.type === "full" ? "روز کامل" : entry.type === "half" ? "نیم‌روز" : "ساعتی"}</StatusBadge></td><td>{entry.type === "hourly" ? duration(entry.minutes) : entry.type === "half" ? "نیم‌روز" : "یک روز"}</td><td>{entry.note || "—"}</td><td><div className={cn("flex items-center gap-[9px] max-[620px]:flex-wrap")}><Button variant="outline" size="icon" onClick={() => setDraft(entry)}><Edit3 /></Button><Button variant="destructive" size="icon" onClick={() => { if (confirm("این مرخصی حذف شود؟")) setData((previous) => ({ ...previous, leaves: previous.leaves.filter((item) => item.id !== entry.id) })); }}><Trash2 /></Button></div></td></tr>)}
        {data.leaves.length === 0 && <tr><td colSpan={5}><EmptyState icon={<Umbrella />} title="مرخصی‌ای ثبت نشده" description="اولین مرخصی را از فرم کناری ثبت کن." /></td></tr>}
      </tbody></table></div>
    </article>
  );
}
