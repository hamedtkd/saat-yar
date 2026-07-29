import { BarChart3, Check, FileSpreadsheet, Filter, Printer } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, money } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData, TimeEntry } from "@/lib/types";

export function ReportTable({ data, entries }: { data: AppData; entries: TimeEntry[] }) {
  return (
    <section className={tw("dashboard-grid", "report-table-grid")}>
      <article className={tw("panel", "table-panel")}><PanelHead icon={<FileSpreadsheet />} title="جزئیات رکوردها" /><div className={tw("table-wrap")}><table><thead><tr><th>تاریخ</th><th>مشتری</th><th>پروژه</th><th>شرح</th><th>مدت</th><th>نرخ مؤثر</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>
        {entries.map((entry) => {
          const project = data.projects.find((item) => item.id === entry.projectId);
          const client = data.clients.find((item) => item.id === entry.clientId);
          const minutes = entryMinutes(entry);
          return <tr key={entry.id}><td>{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" }).format(new Date(entry.startedAt))}</td><td>{client?.name}</td><td>{project?.name}</td><td>{entry.note || entry.task || "—"}</td><td>{duration(minutes)}</td><td>{money(entry.effectiveRate)}</td><td>{money(entry.billable ? minutes / 60 * entry.effectiveRate : 0)}</td><td><StatusBadge success={entry.billable}>{entry.billable ? "قابل صورتحساب" : "غیرقابل"}</StatusBadge></td></tr>;
        })}
        {entries.length === 0 && <tr><td colSpan={8}><EmptyState icon={<Filter />} title="رکوردی با این فیلتر پیدا نشد" description="فیلترها را تغییر بده یا تایمر پروژه را شروع کن." /></td></tr>}
      </tbody></table></div></article>
      <aside className={tw("panel", "print-card")}><PanelHead icon={<Printer />} title="آماده ارسال به مشتری" /><div className={tw("paper-preview")}><BarChart3 /><span /><span /><i /></div><ul><li><Check /> خلاصه زمان و درآمد</li><li><Check /> نمودارهای تحلیلی</li><li><Check /> ریز فعالیت‌ها</li><li><Check /> مناسب چاپ و ذخیره</li></ul><Button className={tw("full")} onClick={() => window.print()}><Printer /> پیش‌نمایش چاپ</Button></aside>
    </section>
  );
}
