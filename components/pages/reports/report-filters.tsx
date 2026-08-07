import { Filter, RotateCcw, Search } from "lucide-react";

import { JalaliDatePicker } from "@/components/pickers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { AppData, Mode, ReportFilter } from "@/lib/types";

type ReportFiltersProps = {
  mode: Mode;
  data: AppData;
  filters: ReportFilter;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilter>>;
};

export function ReportFilters({ mode, data, filters, setFilters }: ReportFiltersProps) {
  const isEmployee = mode === "employee";

  function updateFilter<K extends keyof ReportFilter>(key: K, value: ReportFilter[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      query: "",
      clientId: "all",
      projectId: "all",
      billable: "all",
      dateFrom: "",
      dateTo: "",
      status: "all",
    });
  }

  const activeCount = [
    Boolean(filters.query),
    filters.clientId !== "all",
    filters.projectId !== "all",
    filters.billable !== "all",
    Boolean(filters.dateFrom),
    Boolean(filters.dateTo),
    filters.status !== "all",
  ].filter(Boolean).length;

  return (
    <section className={cn("dashboard-card rounded-[var(--card-radius)] border border-[var(--dashboard-border)] p-3.5 shadow-[0_5px_16px_rgba(0,0,0,.03)] print:hidden sm:p-4")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--text)]">
          <Filter className="size-4 text-[var(--accent-strong)]" />
          فیلترهای پیشرفته
          {activeCount > 0 && <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[9px] text-[var(--accent-strong)]">{activeCount.toLocaleString("fa-IR")} فعال</span>}
        </div>
        <Button type="button" variant="outline" size="sm" disabled={!activeCount} onClick={resetFilters}>
          <RotateCcw className="size-4" /> پاک‌کردن همه
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[620px]:grid-cols-1">
        <div className="search-box flex h-12 min-w-0 items-center gap-2 rounded-[var(--control-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-2)] px-3 transition-colors focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
          <Search className="size-4 shrink-0 text-[var(--text-muted)]" />
          <Input
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder={isEmployee ? "توضیح یا تاریخ" : "پروژه، مشتری یا توضیح"}
            className="h-auto min-w-0 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>

        <JalaliDatePicker
          value={filters.dateFrom}
          onChange={(value) => updateFilter("dateFrom", value)}
          placeholder="از تاریخ"
          mode={data.settings.mode}
          includeOfficialHolidays={data.settings.autoOfficialHolidays}
          includeWeeklyHoliday={data.settings.autoWeeklyHoliday}
        />
        <JalaliDatePicker
          value={filters.dateTo}
          onChange={(value) => updateFilter("dateTo", value)}
          placeholder="تا تاریخ"
          mode={data.settings.mode}
          includeOfficialHolidays={data.settings.autoOfficialHolidays}
          includeWeeklyHoliday={data.settings.autoWeeklyHoliday}
        />

        {isEmployee ? (
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value as ReportFilter["status"])}>
            <SelectTrigger className="h-12 rounded-[var(--control-radius)] border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none"><SelectValue placeholder="همه وضعیت‌ها" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="complete">رکورد کامل</SelectItem>
              <SelectItem value="incomplete">ناقص یا نیازمند اصلاح</SelectItem>
              <SelectItem value="overtime">اضافه‌کاری</SelectItem>
              <SelectItem value="deficit">کسری کار</SelectItem>
              <SelectItem value="holiday">تعطیل‌کاری</SelectItem>
              <SelectItem value="leave">دارای مرخصی</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Select value={filters.clientId} onValueChange={(value) => updateFilter("clientId", value)}>
            <SelectTrigger className="h-12 rounded-[var(--control-radius)] border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none"><SelectValue placeholder="همه مشتری‌ها" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه مشتری‌ها</SelectItem>
              {data.clients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {!isEmployee && <>
          <Select value={filters.projectId} onValueChange={(value) => updateFilter("projectId", value)}>
            <SelectTrigger className="h-12 rounded-[var(--control-radius)] border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none"><SelectValue placeholder="همه پروژه‌ها" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه پروژه‌ها</SelectItem>
              {data.projects.filter((project) => filters.clientId === "all" || project.clientId === filters.clientId).map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.billable} onValueChange={(value) => updateFilter("billable", value)}>
            <SelectTrigger className="h-12 rounded-[var(--control-radius)] border-[var(--dashboard-border)] bg-[var(--surface-2)] shadow-none"><SelectValue placeholder="وضعیت صورتحساب" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="true">قابل صورتحساب</SelectItem>
              <SelectItem value="false">غیرقابل صورتحساب</SelectItem>
            </SelectContent>
          </Select>
        </>}
      </div>

      <p className="mt-3 text-[10px] leading-6 text-[var(--text-muted)]">
        فیلترها بلافاصله روی جدول و خروجی CSV/Excel اعمال می‌شوند.
      </p>
    </section>
  );
}
