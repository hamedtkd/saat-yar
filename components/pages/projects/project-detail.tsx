import { ChevronRight, Clock3, Info, Pause, Play, Square, Tag, TrendingUp, WalletCards } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { MetricCard } from "@/components/common/metric-card";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { duration, entryMinutes, fa, money } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { AppData, Project, TimeEntry } from "@/lib/types";

export function ProjectDetail({ data, setData, project, activeEntry, onBack, onToggleTimer }: {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  project: Project;
  activeEntry?: TimeEntry;
  onBack: () => void;
  onToggleTimer: (id?: string) => void;
}) {
  const entries = data.timeEntries.filter((entry) => entry.projectId === project.id);
  const minutes = entries.reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const billable = entries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entryMinutes(entry), 0);
  const progress = Math.min(100, Math.round(minutes / Math.max(1, (project.budgetHours ?? 0) * 60) * 100));
  return <>
    <section className={tw("page-heading", "project-title")}><div><button type="button" className={tw("back-link")} onClick={onBack}><ChevronRight /> همه پروژه‌ها</button><h1><i style={{ background: project.color }} />{project.name}</h1><p>کارفرما: {data.clients.find((client) => client.id === project.clientId)?.name}</p></div><div className={tw("row-actions")}><Button onClick={() => onToggleTimer(project.id)}>{activeEntry?.projectId === project.id ? <><Square /> پایان تایمر</> : <><Play /> شروع تایمر</>}</Button><Button variant="outline" onClick={() => setData((previous) => ({ ...previous, projects: previous.projects.map((item) => item.id === project.id ? { ...item, status: item.status === "active" ? "paused" : "active" } : item) }))}><Pause /> {project.status === "active" ? "توقف پروژه" : "فعال‌سازی"}</Button></div></section>
    <section className={tw("metric-grid", "four")}><MetricCard icon={<Clock3 />} label="زمان ثبت‌شده" value={duration(minutes)} suffix="ساعت" /><MetricCard icon={<TrendingUp />} label="بودجه زمانی" value={`${fa.format(progress)}٪`} suffix={`از ${fa.format(project.budgetHours ?? 0)} ساعت`} /><MetricCard icon={<WalletCards />} label="مبلغ قابل صورتحساب" value={money(billable / 60 * project.rate)} suffix="تومان" /><MetricCard icon={<Tag />} label="نرخ ساعتی" value={money(project.rate)} suffix="تومان" tone="blue" /></section>
    <section className={tw("project-progress", "panel")}><div><span>باقی‌مانده</span><strong>{duration(Math.max(0, (project.budgetHours ?? 0) * 60 - minutes))}</strong></div><div className={tw("progress-main")}><span>بودجه زمانی پروژه</span><i><b style={{ width: `${progress}%` }} /></i><small>{duration(minutes)} از {fa.format(project.budgetHours ?? 0)} ساعت</small></div><div><span>هزینه مورد انتظار</span><strong>{money((project.budgetHours ?? 0) * project.rate)}</strong><small>تومان</small></div></section>
    <section className={tw("dashboard-grid", "project-detail-grid")}><article className={tw("panel", "table-panel")}><PanelHead icon={<Clock3 />} title="تازه‌ترین رکوردهای زمان" /><div className={tw("table-wrap")}><table><thead><tr><th>تاریخ</th><th>شروع</th><th>پایان</th><th>مدت</th><th>وظیفه</th><th>قابل صورتحساب</th></tr></thead><tbody>{entries.slice(0, 8).map((entry) => <tr key={entry.id}><td>{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(new Date(entry.startedAt))}</td><td>{new Date(entry.startedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</td><td>{entry.endedAt ? new Date(entry.endedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) : "در حال اجرا"}</td><td>{duration(entryMinutes(entry))}</td><td>{entry.task || entry.note || "—"}</td><td><StatusBadge success={entry.billable}>{entry.billable ? "بله" : "خیر"}</StatusBadge></td></tr>)}{entries.length === 0 && <tr><td colSpan={6}><EmptyState compact icon={<Clock3 />} description="هنوز زمانی برای این پروژه ثبت نشده." /></td></tr>}</tbody></table></div></article><aside className={tw("panel", "project-info")}><PanelHead icon={<Info />} title="اطلاعات پروژه" /><dl><dt>وضعیت</dt><dd><StatusBadge success>{project.status === "active" ? "فعال" : "متوقف"}</StatusBadge></dd><dt>واحد پول</dt><dd>تومان</dd><dt>قابل صورتحساب</dt><dd>{project.billable === false ? "خیر" : "بله"}</dd><dt>یادداشت‌ها</dt><dd>{project.note || "—"}</dd></dl></aside></section>
  </>;
}
