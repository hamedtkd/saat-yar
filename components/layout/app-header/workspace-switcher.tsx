import { BriefcaseBusiness } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/types";
import { headerControlShell } from "./header-control-styles";

export function WorkspaceSwitcher({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <Select value={mode} onValueChange={(value) => onChange(value as Mode)}>
      <SelectTrigger
        aria-label="تغییر سریع فضای کاری"
        className={cn(
          headerControlShell,
          "w-auto min-w-[132px] justify-start gap-2 py-0 pr-2.5 pl-9 text-xs font-extrabold",
          "max-[520px]:min-w-[108px] max-[520px]:pr-2 max-[520px]:text-[10px]",
          "[&>svg]:left-2.5",
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-[9px] bg-[var(--accent-soft)] text-[var(--accent-strong)] max-[420px]:hidden">
          <BriefcaseBusiness aria-hidden="true" className="size-4" />
        </span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-[250px]">
        <div className="mx-1 mb-1 grid gap-1 rounded-lg bg-[var(--surface-2)] px-2.5 py-2 text-[9px] leading-5 text-[var(--text-muted)]">
          <span><b className="text-[var(--text)]">کارمند:</b> حضور، مرخصی و حقوق</span>
          <span><b className="text-[var(--text)]">فریلنسر:</b> مشتری، پروژه و فاکتور</span>
          <span><b className="text-[var(--text)]">ترکیبی:</b> هر دو فضای کاری</span>
        </div>
        <SelectGroup>
          <SelectLabel>فضای کاری · بخش‌های قابل دسترس را تغییر می‌دهد</SelectLabel>
          <SelectItem value="employee">کارمند</SelectItem>
          <SelectItem value="freelancer">فریلنسر</SelectItem>
          <SelectItem value="hybrid">ترکیبی</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
