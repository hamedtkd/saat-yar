import { Clock3, Edit3, Folder, Info, Play, Plus } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duration, entryMinutes, faDigits, localDateKey } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { TodayPageProps } from "./types";

export function TodayTimeline(props: Pick<TodayPageProps, "data" | "selectedDate" | "editingEntry" | "setEditingEntry" | "setData" | "toggleProjectTimer" | "setTab">) {
  const entries = props.data.timeEntries.filter((entry) => localDateKey(new Date(entry.startedAt)) === props.selectedDate);
  const recentProjects = props.data.projects.filter((item) => item.status === "active").slice(0, 3);
  return (
    <section className={tw("dashboard-grid")}>
      <article className={tw("panel", "timeline-panel")}>
        <PanelHead icon={<Clock3 />} title="خط زمانی امروز">{props.data.settings.mode !== "employee" && <Button variant="ghost" size="sm" onClick={() => props.setEditingEntry(props.editingEntry ? "" : "manual")}><Plus /> افزودن ورودی زمان</Button>}</PanelHead>
        <div className={tw("table-wrap")}><table><thead><tr><th>وظیفه</th><th>شروع</th><th>پایان</th><th>مدت زمان</th><th>قابل صورتحساب</th><th>عملیات</th></tr></thead><tbody>
          {entries.map((entry) => {
            const project = props.data.projects.find((item) => item.id === entry.projectId);
            return <tr key={entry.id}><td><strong><i style={{ background: project?.color }} />{entry.task || project?.name || "بدون عنوان"}</strong><small>{entry.note}</small></td><td>{props.editingEntry === entry.id ? <Input type="datetime-local" value={entry.startedAt.slice(0, 16)} onChange={(event) => props.setData((previous) => ({ ...previous, timeEntries: previous.timeEntries.map((item) => item.id === entry.id ? { ...item, startedAt: new Date(event.target.value).toISOString() } : item) }))} /> : faDigits(new Date(entry.startedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }))}</td><td>{entry.endedAt ? faDigits(new Date(entry.endedAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })) : "در حال اجرا"}</td><td>{duration(entryMinutes(entry))}</td><td><StatusBadge success={entry.billable}>{entry.billable ? "بله" : "خیر"}</StatusBadge></td><td><Button variant="outline" size="icon" onClick={() => props.setEditingEntry(props.editingEntry === entry.id ? "" : entry.id)} aria-label="ویرایش"><Edit3 /></Button></td></tr>;
          })}
          {entries.length === 0 && <tr><td colSpan={6}><EmptyState icon={<Clock3 />} title="هنوز رکورد پروژه‌ای برای امروز نداری" description="تایمر پروژه را شروع کن یا یک ورودی دستی اضافه کن." /></td></tr>}
        </tbody></table></div>
        <div className={tw("table-total")}><span>جمع کل: <strong>{duration(entries.reduce((sum, entry) => sum + entryMinutes(entry), 0))}</strong></span></div>
      </article>
      {props.data.settings.mode !== "employee" && <aside className={tw("panel", "recent-projects")}><PanelHead icon={<Info />} title="پروژه‌های اخیر" />{recentProjects.map((project) => <div className={tw("recent-project")} key={project.id}><span style={{ background: project.color }} /><div><strong>{project.name}</strong><small>{props.data.clients.find((item) => item.id === project.clientId)?.name}</small></div><Button variant="outline" size="sm" onClick={() => props.toggleProjectTimer(project.id)}><Play /> شروع</Button></div>)}{recentProjects.length === 0 && <EmptyState compact icon={<Folder />} description="از صفحه پروژه‌ها اولین پروژه را بساز." />}<Button variant="ghost" className={tw("full")} onClick={() => props.setTab("projects")}>مشاهده همه پروژه‌ها</Button></aside>}
    </section>
  );
}
