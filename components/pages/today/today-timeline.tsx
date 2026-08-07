import { Clock3, Edit3, Folder, Info, Play, Plus } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PanelHead } from "@/components/common/panel-head";
import { SurfaceCard } from "@/components/common/surface-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duration, entryMinutes, faDigits, localDateKey } from "@/lib/format";
import type { TodayPageProps } from "./types.ts";
import { cn } from "@/lib/cn";

export function TodayTimeline(
  props: Pick<
    TodayPageProps,
    | "data"
    | "selectedDate"
    | "editingEntry"
    | "setEditingEntry"
    | "setData"
    | "toggleProjectTimer"
    | "setTab"
  >,
) {
  const entries = props.data.timeEntries.filter(
    (entry) => localDateKey(new Date(entry.startedAt)) === props.selectedDate,
  );
  const recentProjects = props.data.projects
    .filter((item) => item.status === "active")
    .slice(0, 3);
  return (
    <section
      className={cn(
        "mb-4 grid grid-cols-[minmax(0,1fr)_300px] gap-2.5 max-[900px]:grid-cols-1",
      )}
    >
      <SurfaceCard className="dashboard-card min-w-0 p-3 shadow-[0_5px_16px_rgba(0,0,0,.03)]">
        <PanelHead icon={<Clock3 />} title="خط زمانی امروز">
          {props.data.settings.mode !== "employee" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                props.setEditingEntry(props.editingEntry ? "" : "manual")
              }
            >
              <Plus /> افزودن ورودی زمان
            </Button>
          )}
        </PanelHead>
        <div
          className={cn(
            "w-full overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px] [&_th]:h-[39px] [&_th]:whitespace-nowrap [&_th]:border-y [&_th]:border-[var(--border)] [&_th]:bg-[var(--surface-2)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-right [&_th]:font-semibold [&_th]:text-[var(--text-muted)] [&_td]:min-h-[46px] [&_td]:whitespace-nowrap [&_td]:border-b [&_td]:border-[var(--border)] [&_td]:px-3 [&_td]:py-[9px] [&_td]:text-[var(--text)] [&_td_strong]:flex [&_td_strong]:items-center [&_td_strong]:gap-[7px] [&_td_strong]:text-[11px] [&_td_strong]:text-[var(--text)] [&_td_strong>i]:size-[7px] [&_td_strong>i]:rounded-full [&_td_small]:mt-[3px] [&_td_small]:block [&_td_small]:text-[9px] [&_td_small]:text-[var(--text-muted)] [&_td_input]:min-w-[175px]",
          )}
        >
          <table>
            <thead>
              <tr>
                <th>وظیفه</th>
                <th>شروع</th>
                <th>پایان</th>
                <th>مدت زمان</th>
                <th>قابل صورتحساب</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const project = props.data.projects.find(
                  (item) => item.id === entry.projectId,
                );
                return (
                  <tr key={entry.id}>
                    <td>
                      <strong>
                        <i style={{ background: project?.color }} />
                        {entry.task || project?.name || "بدون عنوان"}
                      </strong>
                      <small>{entry.note}</small>
                    </td>
                    <td>
                      {props.editingEntry === entry.id ? (
                        <Input
                          type="datetime-local"
                          value={entry.startedAt.slice(0, 16)}
                          onChange={(event) =>
                            props.setData((previous) => ({
                              ...previous,
                              timeEntries: previous.timeEntries.map((item) =>
                                item.id === entry.id
                                  ? {
                                      ...item,
                                      startedAt: new Date(
                                        event.target.value,
                                      ).toISOString(),
                                    }
                                  : item,
                              ),
                            }))
                          }
                        />
                      ) : (
                        faDigits(
                          new Date(entry.startedAt).toLocaleTimeString(
                            "fa-IR",
                            { hour: "2-digit", minute: "2-digit" },
                          ),
                        )
                      )}
                    </td>
                    <td>
                      {entry.endedAt
                        ? faDigits(
                            new Date(entry.endedAt).toLocaleTimeString(
                              "fa-IR",
                              { hour: "2-digit", minute: "2-digit" },
                            ),
                          )
                        : "در حال اجرا"}
                    </td>
                    <td>{duration(entryMinutes(entry))}</td>
                    <td>
                      <StatusBadge success={entry.billable}>
                        {entry.billable ? "بله" : "خیر"}
                      </StatusBadge>
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          props.setEditingEntry(
                            props.editingEntry === entry.id ? "" : entry.id,
                          )
                        }
                        aria-label="ویرایش"
                      >
                        <Edit3 />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<Clock3 />}
                      title="هنوز رکورد پروژه‌ای برای امروز نداری"
                      description="تایمر پروژه را شروع کن یا یک ورودی دستی اضافه کن."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div
          className={cn(
            "flex justify-center px-0 pb-0 pt-3 text-[11px] text-[var(--text-muted)] [&_strong]:text-base [&_strong]:text-[var(--text)]",
          )}
        >
          <span>
            جمع کل:{" "}
            <strong>
              {duration(
                entries.reduce((sum, entry) => sum + entryMinutes(entry), 0),
              )}
            </strong>
          </span>
        </div>
      </SurfaceCard>
      {props.data.settings.mode !== "employee" && (
        <SurfaceCard as="aside" className="dashboard-card p-4 shadow-[0_5px_16px_rgba(0,0,0,.03)] max-[900px]:order-first [&>button]:mt-3">
          <PanelHead icon={<Info />} title="پروژه‌های اخیر" />
          {recentProjects.map((project) => (
            <div
              className={cn(
                "grid grid-cols-[9px_1fr_auto] items-center gap-[10px] border-b border-[var(--border)] py-3 [&>span]:size-[9px] [&>span]:rounded-full [&>div]:grid [&_strong]:text-xs [&_small]:text-[9px] [&_small]:text-[var(--text-muted)]",
              )}
              key={project.id}
            >
              <span style={{ background: project.color }} />
              <div>
                <strong>{project.name}</strong>
                <small>
                  {
                    props.data.clients.find(
                      (item) => item.id === project.clientId,
                    )?.name
                  }
                </small>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => props.toggleProjectTimer(project.id)}
              >
                <Play /> شروع
              </Button>
            </div>
          ))}
          {recentProjects.length === 0 && (
            <EmptyState
              compact
              icon={<Folder />}
              description="از صفحه پروژه‌ها اولین پروژه را بساز."
            />
          )}
          <Button
            variant="ghost"
            className={cn("w-full")}
            onClick={() => props.setTab("projects")}
          >
            مشاهده همه پروژه‌ها
          </Button>
        </SurfaceCard>
      )}
    </section>
  );
}
