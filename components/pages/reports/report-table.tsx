import { BarChart3, Check, FileSpreadsheet, Filter, Printer } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, money } from "@/lib/format";
import type { AppData, TimeEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ReportTable({ data, entries }: { data: AppData; entries: TimeEntry[] }) {
  return (
    <section className={cn("grid grid-cols-[minmax(0,1fr)_320px] gap-[14px] max-[900px]:grid-cols-1", "grid-cols-[minmax(0,1fr)_300px] max-[1180px]:grid-cols-[minmax(0,1fr)_280px] max-[900px]:grid-cols-1")}>
      <article className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "min-w-0 p-[13px]")}><PanelHead icon={<FileSpreadsheet />} title="جزئیات رکوردها" /><div className={cn("w-full overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px] [&_th]:h-[39px] [&_th]:whitespace-nowrap [&_th]:border-y [&_th]:border-[#edf1f2] [&_th]:bg-[#fbfcfc] [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-semibold [&_th]:text-[#536975] [&_td]:min-h-[46px] [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[#edf1f2] [&_td]:px-3 [&_td]:py-[9px] [&_td]:text-[#2e4856] [&_td_strong]:flex [&_td_strong]:items-center [&_td_strong]:gap-[7px] [&_td_strong]:text-[11px] [&_td_strong]:text-[#102a3a] [&_td_strong>i]:h-[7px] [&_td_strong>i]:w-[7px] [&_td_strong>i]:rounded-full [&_td_small]:mt-[3px] [&_td_small]:block [&_td_small]:text-[9px] [&_td_small]:text-[#6c7d89] [&_td_input]:min-w-[175px]")}><table><thead><tr><th>تاریخ</th><th>مشتری</th><th>پروژه</th><th>شرح</th><th>مدت</th><th>نرخ مؤثر</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>
        {entries.map((entry) => {
          const project = data.projects.find((item) => item.id === entry.projectId);
          const client = data.clients.find((item) => item.id === entry.clientId);
          const minutes = entryMinutes(entry);
          return <tr key={entry.id}><td>{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "long" }).format(new Date(entry.startedAt))}</td><td>{client?.name}</td><td>{project?.name}</td><td>{entry.note || entry.task || "—"}</td><td>{duration(minutes)}</td><td>{money(entry.effectiveRate)}</td><td>{money(entry.billable ? minutes / 60 * entry.effectiveRate : 0)}</td><td><StatusBadge success={entry.billable}>{entry.billable ? "قابل صورتحساب" : "غیرقابل"}</StatusBadge></td></tr>;
        })}
        {entries.length === 0 && <tr><td colSpan={8}><EmptyState icon={<Filter />} title="رکوردی با این فیلتر پیدا نشد" description="فیلترها را تغییر بده یا تایمر پروژه را شروع کن." /></td></tr>}
      </tbody></table></div></article>
      <aside className={cn("rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4", "max-[900px]:order-first print:hidden [&_ul]:list-none [&_ul]:p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-[7px] [&_li]:py-1.5 [&_li]:text-[10px] [&_li]:text-[#6c7d89] [&_li_svg]:w-[14px] [&_li_svg]:text-[#079b60]")}><PanelHead icon={<Printer />} title="آماده ارسال به مشتری" /><div className={cn("mx-auto my-[10px] grid h-[165px] w-[132px] place-items-start justify-center gap-3 border border-[#dfe7e9] bg-white p-[22px] shadow-[0_8px_18px_rgba(17,45,55,.08)] [&_svg]:h-[33px] [&_svg]:w-[33px] [&_svg]:text-[#079b60] [&_span]:h-1 [&_span]:w-[75px] [&_span]:bg-[#dfe6e7] [&_i]:h-[38px] [&_i]:w-[70px] [&_i]:bg-[linear-gradient(90deg,#079b60_30%,#dfe9e6_30%_40%,#276bd5_40%_60%,#dfe9e6_60%)]")}><BarChart3 /><span /><span /><i /></div><ul><li><Check /> خلاصه زمان و درآمد</li><li><Check /> نمودارهای تحلیلی</li><li><Check /> ریز فعالیت‌ها</li><li><Check /> مناسب چاپ و ذخیره</li></ul><Button className={cn("w-full")} onClick={() => window.print()}><Printer /> پیش‌نمایش چاپ</Button></aside>
    </section>
  );
}
