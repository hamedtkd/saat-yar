import { Filter, RotateCcw, Search } from "lucide-react";

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
import type {
  AppData,
  Mode,
  ReportFilter,
} from "@/lib/types";

type ReportFiltersProps = {
  mode: Mode;
  data: AppData;
  filters: ReportFilter;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilter>>;
};

export function ReportFilters({
  mode,
  data,
  filters,
  setFilters,
}: ReportFiltersProps) {
  const isEmployee = mode === "employee";

  function updateFilter<K extends keyof ReportFilter>(
    key: K,
    value: ReportFilter[K],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters((current) => ({
      ...current,
      query: "",
      clientId: "all",
      projectId: "all",
      billable: "all",
    }));
  }

  const hasActiveFilters =
    Boolean(filters.query) ||
    filters.clientId !== "all" ||
    filters.projectId !== "all" ||
    filters.billable !== "all";

  return (
    <section
      className={cn(
        "mb-4 rounded-2xl border border-[#dfe7e9]",
        "bg-white/95 p-4",
        "shadow-[0_10px_35px_rgba(17,45,55,0.055)]",
        "print:hidden",
      )}
    >
      <div
        className={cn(
          "grid items-center gap-3",
          isEmployee
            ? "grid-cols-[minmax(0,1fr)_auto_auto]"
            : "grid-cols-[minmax(240px,1.2fr)_repeat(3,minmax(150px,1fr))_auto_auto]",
          "max-[1180px]:grid-cols-2",
          "max-[1180px]:[&_.search-box]:col-span-2",
          "max-[620px]:grid-cols-1",
          "max-[620px]:[&_.search-box]:col-auto",
        )}
      >
        <div
          className={cn(
            "search-box flex h-12 min-w-0 items-center gap-2",
            "rounded-xl border border-[#dfe7e9]",
            "bg-white px-3",
            "transition-colors",
            "focus-within:border-[#079b60]",
            "focus-within:ring-3 focus-within:ring-[#079b60]/10",
          )}
        >
          <Search className="size-4 shrink-0 text-[#6c7d89]" />

          <Input
            value={filters.query}
            onChange={(event) =>
              updateFilter("query", event.target.value)
            }
            placeholder={
              isEmployee
                ? "جست‌وجو در توضیحات یا تاریخ"
                : "جست‌وجوی پروژه، مشتری یا توضیح"
            }
            className="h-auto min-w-0 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>

        {!isEmployee && (
          <>
            <Select
              value={filters.clientId}
              onValueChange={(clientId) =>
                updateFilter("clientId", clientId)
              }
            >
              <SelectTrigger className="h-12 min-w-0 rounded-xl border-[#dfe7e9] bg-white shadow-none">
                <SelectValue placeholder="همه مشتری‌ها" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  همه مشتری‌ها
                </SelectItem>

                {data.clients.map((client) => (
                  <SelectItem
                    value={client.id}
                    key={client.id}
                  >
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.projectId}
              onValueChange={(projectId) =>
                updateFilter("projectId", projectId)
              }
            >
              <SelectTrigger className="h-12 min-w-0 rounded-xl border-[#dfe7e9] bg-white shadow-none">
                <SelectValue placeholder="همه پروژه‌ها" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  همه پروژه‌ها
                </SelectItem>

                {data.projects.map((project) => (
                  <SelectItem
                    value={project.id}
                    key={project.id}
                  >
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.billable}
              onValueChange={(billable) =>
                updateFilter("billable", billable)
              }
            >
              <SelectTrigger className="h-12 min-w-0 rounded-xl border-[#dfe7e9] bg-white shadow-none">
                <SelectValue placeholder="همه وضعیت‌ها" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  همه وضعیت‌ها
                </SelectItem>
                <SelectItem value="true">
                  قابل صورتحساب
                </SelectItem>
                <SelectItem value="false">
                  غیرقابل صورتحساب
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        )}

        <Button
          type="button"
          className="h-12 rounded-xl bg-[#0b4556] px-4 hover:bg-[#083b49]"
        >
          <Filter className="size-4" />
          اعمال فیلتر
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl"
          disabled={!hasActiveFilters}
          onClick={resetFilters}
        >
          <RotateCcw className="size-4" />
          پاک‌کردن
        </Button>
      </div>

      {isEmployee && (
        <p className="mt-3 text-[10px] leading-6 text-[#6c7d89]">
          در حالت کارمند، فیلترهای مشتری، پروژه و صورتحساب نمایش
          داده نمی‌شوند.
        </p>
      )}
    </section>
  );
}