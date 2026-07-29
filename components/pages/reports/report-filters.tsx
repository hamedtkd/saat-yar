import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tw } from "@/lib/tw";
import type { AppData, ReportFilter } from "@/lib/types";

export function ReportFilters({ data, filters, setFilters }: {
  data: AppData;
  filters: ReportFilter;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilter>>;
}) {
  return (
    <section className={tw("filters", "panel")}>
      <div className={tw("search-box")}><Search /><Input placeholder="جست‌وجوی پروژه یا توضیح" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} /></div>
      <Select value={filters.clientId} onValueChange={(clientId) => setFilters({ ...filters, clientId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه مشتری‌ها</SelectItem>{data.clients.map((client) => <SelectItem value={client.id} key={client.id}>{client.name}</SelectItem>)}</SelectContent></Select>
      <Select value={filters.projectId} onValueChange={(projectId) => setFilters({ ...filters, projectId })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه پروژه‌ها</SelectItem>{data.projects.map((project) => <SelectItem value={project.id} key={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>
      <Select value={filters.billable} onValueChange={(billable) => setFilters({ ...filters, billable })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">همه وضعیت‌ها</SelectItem><SelectItem value="true">قابل صورتحساب</SelectItem><SelectItem value="false">غیرقابل صورتحساب</SelectItem></SelectContent></Select>
      <Button><Filter /> اعمال فیلتر</Button>
    </section>
  );
}
