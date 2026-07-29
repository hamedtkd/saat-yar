import { Edit3, Trash2, Umbrella } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, jalali } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData, LeaveEntry } from "@/lib/types";

export function LeaveTable({ data, setData, setDraft }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  setDraft: React.Dispatch<React.SetStateAction<LeaveEntry>>;
}) {
  return (
    <article className={tw("panel", "table-panel")}>
      <PanelHead icon={<Umbrella />} title="تاریخچه مرخصی‌ها" />
      <div className={tw("table-wrap")}><table><thead><tr><th>بازه</th><th>نوع</th><th>مدت</th><th>توضیح</th><th>عملیات</th></tr></thead><tbody>
        {data.leaves.map((entry) => <tr key={entry.id}><td>{jalali(entry.startDate)} تا {jalali(entry.endDate)}</td><td><StatusBadge success>{entry.type === "full" ? "روز کامل" : entry.type === "half" ? "نیم‌روز" : "ساعتی"}</StatusBadge></td><td>{entry.type === "hourly" ? duration(entry.minutes) : entry.type === "half" ? "نیم‌روز" : "یک روز"}</td><td>{entry.note || "—"}</td><td><div className={tw("row-actions")}><Button variant="outline" size="icon" onClick={() => setDraft(entry)}><Edit3 /></Button><Button variant="destructive" size="icon" onClick={() => { if (confirm("این مرخصی حذف شود؟")) setData((previous) => ({ ...previous, leaves: previous.leaves.filter((item) => item.id !== entry.id) })); }}><Trash2 /></Button></div></td></tr>)}
        {data.leaves.length === 0 && <tr><td colSpan={5}><EmptyState icon={<Umbrella />} title="مرخصی‌ای ثبت نشده" description="اولین مرخصی را از فرم کناری ثبت کن." /></td></tr>}
      </tbody></table></div>
    </article>
  );
}
