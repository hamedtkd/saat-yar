"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Clock3, Info, Pause, Play, Plus, ReceiptText, Square, Trash2, TrendingDown, TrendingUp, TriangleAlert, WalletCards } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { MetricCard } from "@/components/common/metric-card";
import { NumberField } from "@/components/common/number-field";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { duration, fa, jalali, localDateKey, money } from "@/lib/format";
import { getProjectFinanceSummary } from "@/lib/project-finance";
import type { AppData, ExpenseCategory, Project, TimeEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

const expenseCategories: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "software", label: "نرم‌افزار و اشتراک" },
  { value: "contractor", label: "همکار و پیمانکار" },
  { value: "travel", label: "رفت‌وآمد" },
  { value: "equipment", label: "تجهیزات" },
  { value: "other", label: "سایر" },
];

export function ProjectDetail({ data, setData, project, activeEntry, onBack, onToggleTimer, financialsHidden }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  project: Project;
  activeEntry?: TimeEntry;
  onBack: () => void;
  onToggleTimer: (id?: string) => void;
  financialsHidden: boolean;
}) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [now, setNow] = useState<number>();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const [expenseDraft, setExpenseDraft] = useState({ title: "", amount: 0, date: localDateKey(), category: "other" as ExpenseCategory, note: "" });
  const entries = data.timeEntries.filter((entry) => entry.projectId === project.id);
  const expenses = data.expenses.filter((expense) => expense.projectId === project.id).sort((a, b) => b.date.localeCompare(a.date));
  const summary = getProjectFinanceSummary(project, data.timeEntries, data.expenses);
  const cappedProgress = Math.min(100, summary.budgetProgress);
  const mask = (value: number) => financialsHidden ? "••••••" : money(value);

  function addExpense() {
    if (!expenseDraft.title.trim() || expenseDraft.amount <= 0) return;
    setData((previous) => ({
      ...previous,
      expenses: [{
        id: crypto.randomUUID(),
        projectId: project.id,
        clientId: project.clientId,
        title: expenseDraft.title.trim(),
        amount: expenseDraft.amount,
        date: expenseDraft.date,
        category: expenseDraft.category,
        note: expenseDraft.note.trim(),
        createdAt: new Date().toISOString(),
      }, ...previous.expenses],
    }));
    setExpenseDraft({ title: "", amount: 0, date: localDateKey(), category: "other", note: "" });
    setShowExpenseForm(false);
  }

  return <>
    <section className={cn("mb-[22px] flex min-h-24 items-start justify-between gap-6 [&>div:first-child]:min-w-0 [&_h1]:mb-0.5 [&_h1]:mt-2 [&_h1]:text-[clamp(26px,2.4vw,36px)] [&_h1]:leading-[1.35] [&_h1]:tracking-[-.9px] [&_p]:m-0 [&_p]:text-[13px] [&_p]:text-[#6c7d89] max-[620px]:mb-[17px] max-[620px]:min-h-0 max-[620px]:flex-col max-[620px]:[&>button]:w-full max-[620px]:[&>.row-actions]:w-full max-[620px]:[&_h1]:text-[25px]", "[&_h1]:flex [&_h1]:items-center [&_h1]:gap-[10px] [&_h1_i]:h-[35px] [&_h1_i]:w-3 [&_h1_i]:rounded-[7px]")}>
      <div><button type="button" className="flex items-center gap-1 border-0 bg-transparent p-0 text-[#079b60]" onClick={onBack}><ChevronRight /> همه پروژه‌ها</button><h1><i style={{ background: project.color }} />{project.name}</h1><p>کارفرما: {data.clients.find((client) => client.id === project.clientId)?.name}</p></div>
      <div className="flex items-center gap-[9px] max-[620px]:flex-wrap"><Button onClick={() => onToggleTimer(project.id)}>{activeEntry?.projectId === project.id ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button><Button variant="outline" onClick={() => setData((previous) => ({ ...previous, projects: previous.projects.map((item) => item.id === project.id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item) }))}><Pause /> {project.status === "active" ? "توقف پروژه" : "فعال‌سازی"}</Button></div>
    </section>

    {summary.budgetStatus === "warning" && <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><TriangleAlert className="h-5 w-5" /><span>بیش از ۸۰٪ بودجه زمانی پروژه مصرف شده است.</span></div>}
    {summary.budgetStatus === "exceeded" && <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><TriangleAlert className="h-5 w-5" /><span>بودجه زمانی پروژه تمام شده و {duration(summary.trackedMinutes - summary.budgetMinutes)} بیشتر از بودجه ثبت شده است.</span></div>}

    <section className="mb-[18px] grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
      <MetricCard icon={<Clock3 />} label="زمان ثبت‌شده" value={duration(summary.trackedMinutes)} suffix="ساعت" />
      <MetricCard icon={<TrendingUp />} label="مصرف بودجه" value={`${fa.format(summary.budgetProgress)}٪`} suffix={`از ${fa.format(project.budgetHours ?? 0)} ساعت`} />
      <MetricCard icon={<WalletCards />} label="درآمد ثبت‌شده" value={mask(summary.revenue)} suffix="تومان" />
      <MetricCard icon={<TrendingDown />} label="سود خالص" value={mask(summary.profit)} suffix="تومان" tone={summary.profit < 0 ? "blue" : undefined} />
    </section>

    <section className={cn("mb-[18px] grid grid-cols-[190px_1fr_230px] items-center gap-7 px-6 py-[18px] max-[900px]:grid-cols-1 max-[900px]:[&_.progress-main]:row-start-1", "rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)]")}>
      <div className="grid gap-1 text-center"><span className="text-[10px] text-[#6c7d89]">باقی‌مانده بودجه</span><strong className="text-[22px] text-[#079b60]">{duration(summary.remainingMinutes)}</strong></div>
      <div className="progress-main grid gap-1"><span className="text-[10px] text-[#6c7d89]">بودجه زمانی پروژه</span><i className="my-2 block h-[7px] overflow-hidden rounded-[10px] bg-[#e8edef]"><b className={cn("block h-full rounded-[inherit]", summary.budgetStatus === "exceeded" ? "bg-red-500" : summary.budgetStatus === "warning" ? "bg-amber-500" : "bg-[#079b60]")} style={{ width: `${cappedProgress}%` }} /></i><small className="text-[10px] text-[#6c7d89]">{duration(summary.trackedMinutes)} از {fa.format(project.budgetHours ?? 0)} ساعت</small></div>
      <div className="grid gap-1 text-center"><span className="text-[10px] text-[#6c7d89]">حاشیه سود</span><strong className={cn("text-[22px]", summary.profit < 0 ? "text-red-600" : "text-[#079b60]")}>{financialsHidden ? "••••••" : summary.marginPercent === null ? "—" : `${fa.format(summary.marginPercent)}٪`}</strong><small className="text-[10px] text-[#6c7d89]">هزینه‌ها: {mask(summary.expenses)} تومان</small></div>
    </section>

    <section className="mb-[18px] rounded-[15px] border border-[#dfe7e9] bg-white/95 p-4 shadow-[0_10px_35px_rgba(17,45,55,.055)]">
      <PanelHead icon={<ReceiptText />} title="هزینه‌های پروژه"><Button size="sm" variant="outline" onClick={() => setShowExpenseForm((value) => !value)}><Plus /> ثبت هزینه</Button></PanelHead>
      {showExpenseForm && <div className="mb-4 grid grid-cols-4 gap-3 rounded-xl bg-[#f8fbfa] p-3 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        <label className="grid gap-1 text-xs">عنوان<Input value={expenseDraft.title} onChange={(event) => setExpenseDraft((value) => ({ ...value, title: event.target.value }))} /></label>
        <label className="grid gap-1 text-xs">مبلغ (تومان)<NumberField value={expenseDraft.amount} onValueChange={(amount) => setExpenseDraft((value) => ({ ...value, amount }))} /></label>
        <label className="grid gap-1 text-xs">تاریخ<Input type="date" value={expenseDraft.date} onChange={(event) => setExpenseDraft((value) => ({ ...value, date: event.target.value }))} /></label>
        <label className="grid gap-1 text-xs">دسته‌بندی<Select value={expenseDraft.category} onValueChange={(category) => setExpenseDraft((value) => ({ ...value, category: category as ExpenseCategory }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{expenseCategories.map((item) => <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
        <label className="col-span-3 grid gap-1 text-xs max-[620px]:col-auto">یادداشت<Input value={expenseDraft.note} onChange={(event) => setExpenseDraft((value) => ({ ...value, note: event.target.value }))} /></label>
        <div className="flex items-end gap-2"><Button className="w-full" onClick={addExpense} disabled={!expenseDraft.title.trim() || expenseDraft.amount <= 0}>ذخیره هزینه</Button><Button variant="outline" onClick={() => setShowExpenseForm(false)}>لغو</Button></div>
      </div>}
      <div className="w-full overflow-x-auto"><table className="w-full border-collapse text-[11px]"><thead><tr className="border-y border-[#edf1f2] bg-[#fbfcfc] text-right text-[#536975]"><th className="p-3">تاریخ</th><th className="p-3">عنوان</th><th className="p-3">دسته‌بندی</th><th className="p-3">مبلغ</th><th className="p-3">عملیات</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense.id} className="border-b border-[#edf1f2]"><td className="p-3">{jalali(expense.date)}</td><td className="p-3"><strong>{expense.title}</strong>{expense.note && <small className="mt-1 block text-[#6c7d89]">{expense.note}</small>}</td><td className="p-3">{expenseCategories.find((item) => item.value === expense.category)?.label ?? "سایر"}</td><td className="p-3 font-semibold">{mask(expense.amount)} تومان</td><td className="p-3"><Button size="icon" variant="ghost" aria-label={`حذف هزینه ${expense.title}`} onClick={() => setData((previous) => ({ ...previous, expenses: previous.expenses.filter((item) => item.id !== expense.id) }))}><Trash2 className="h-4 w-4" /></Button></td></tr>)}{expenses.length === 0 && <tr><td colSpan={5}><EmptyState compact icon={<ReceiptText />} description="هنوز هزینه‌ای برای این پروژه ثبت نشده است." /></td></tr>}</tbody></table></div>
    </section>

    <section className="grid grid-cols-[minmax(0,1fr)_250px] gap-[14px] max-[900px]:grid-cols-1">
      <article className="min-w-0 rounded-[15px] border border-[#dfe7e9] bg-white/95 p-[13px] shadow-[0_10px_35px_rgba(17,45,55,.055)]"><PanelHead icon={<Clock3 />} title="تازه‌ترین رکوردهای زمان" /><div className="w-full overflow-x-auto"><table className="w-full border-collapse text-[11px]"><thead><tr className="border-y border-[#edf1f2] bg-[#fbfcfc] text-right text-[#536975]"><th className="p-3">تاریخ</th><th className="p-3">شروع</th><th className="p-3">پایان</th><th className="p-3">مدت</th><th className="p-3">وظیفه</th><th className="p-3">قابل صورتحساب</th></tr></thead><tbody>{entries.slice(0, 8).map((entry) => <tr key={entry.id} className="border-b border-[#edf1f2]"><td className="p-3">{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(new Date(entry.startedAt))}</td><td className="p-3">{new Date(entry.startedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</td><td className="p-3">{entry.endedAt ? new Date(entry.endedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) : "در حال اجرا"}</td><td className="p-3">{duration(Math.max(0, Math.round(((entry.endedAt ? new Date(entry.endedAt).getTime() : now ?? new Date(entry.startedAt).getTime()) - new Date(entry.startedAt).getTime()) / 60_000)))}</td><td className="p-3">{entry.task || entry.note || "—"}</td><td className="p-3"><StatusBadge success={entry.billable}>{entry.billable ? "بله" : "خیر"}</StatusBadge></td></tr>)}{entries.length === 0 && <tr><td colSpan={6}><EmptyState compact icon={<Clock3 />} description="هنوز زمانی برای این پروژه ثبت نشده." /></td></tr>}</tbody></table></div></article>
      <aside className="rounded-[15px] border border-[#dfe7e9] bg-white/95 p-4 shadow-[0_10px_35px_rgba(17,45,55,.055)] max-[900px]:order-first"><PanelHead icon={<Info />} title="اطلاعات پروژه" /><dl className="m-0 [&_dt]:border-t [&_dt]:border-[#edf1f2] [&_dt]:pt-[13px] [&_dt]:text-[10px] [&_dt]:text-[#6c7d89] [&_dd]:mb-[13px] [&_dd]:mt-1.5 [&_dd]:text-xs"><dt>وضعیت</dt><dd><StatusBadge success>{project.status === "active" ? "فعال" : "متوقف"}</StatusBadge></dd><dt>نرخ ساعتی</dt><dd>{mask(project.rate)} تومان</dd><dt>قابل صورتحساب</dt><dd>{project.billable === false ? "خیر" : "بله"}</dd><dt>یادداشت‌ها</dt><dd>{project.note || "—"}</dd></dl></aside>
    </section>
  </>;
}
