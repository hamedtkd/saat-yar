import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppData, ReportFilter } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ReportFilters({ data, filters, setFilters }: {
  data: AppData;
  filters: ReportFilter;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilter>>;
}) {
  return (
    <section className={cn("mb-4 grid grid-cols-[1.2fr_repeat(3,1fr)_auto] gap-[11px] print:hidden max-[1180px]:grid-cols-2 max-[1180px]:[&_.search-box]:col-span-2 max-[620px]:grid-cols-1 max-[620px]:[&_.search-box]:col-auto", "rounded-[15px] border border-[#dfe7e9] bg-white/95 shadow-[0_10px_35px_rgba(17,45,55,.055)] p-4")}>
      <div className={cn("flex min-w-[230px] items-center gap-[7px] rounded-[11px] border border-[#dfe7e9] bg-white px-[10px] [&_svg]:flex-none [&_svg]:text-[#6c7d89] [&_input]:border-0 [&_input]:px-0 [&_input]:shadow-none")}><Search /><Input placeholder="جست‌وجوی پروژه یا توضیح" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} /></div>
      <Select value={filters.clientId} onValueChange={(clientId) => setFilters({ ...filters, clientId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه مشتری‌ها</SelectItem>{data.clients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select>
      <Select value={filters.projectId} onValueChange={(projectId) => setFilters({ ...filters, projectId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه پروژه‌ها</SelectItem>{data.projects.map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>
      <Select value={filters.billable} onValueChange={(billable) => setFilters({ ...filters, billable })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه وضعیت‌ها</SelectItem><SelectItem value="true">قابل صورتحساب</SelectItem><SelectItem value="false">غیرقابل صورتحساب</SelectItem></SelectContent></Select>
      <Button><Filter /> اعمال فیلتر</Button>
    </section>
  );
}
